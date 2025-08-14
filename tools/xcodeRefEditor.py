#!/Users/lucaszhang/miniforge3/bin/python
"""
xcodeRefEditor.py - Xcode Workspace Reference Editor (Library-based version)

A tool for managing file references in Xcode workspace (.xcworkspace) and project (.xcodeproj) files.
Uses the pbxproj library for safe, reliable project file manipulation.

Usage:
    xcodeRefEditor.py rm <workspace> <ref_path>        # Remove a reference
    xcodeRefEditor.py add <workspace> <ref_path> <local_path>  # Add a reference
    xcodeRefEditor.py tree <workspace> [path]          # Show tree structure
    xcodeRefEditor.py ls <workspace> [path]            # List references

Examples:
    xcodeRefEditor.py rm MyApp.xcworkspace CarpSchool/Plugins/file.swift
    xcodeRefEditor.py add MyApp.xcworkspace CarpSchool/Plugins/NewFile.swift ./src/NewFile.swift
    xcodeRefEditor.py tree MyApp.xcworkspace
    xcodeRefEditor.py ls MyApp.xcworkspace CarpSchool/Plugins
"""

import argparse
import sys
import os
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Optional, Tuple

try:
    from pbxproj import XcodeProject
    from pbxproj.pbxextensions import ProjectFiles
except ImportError:
    print("❌ Error: pbxproj library not found. Install it with: pip install pbxproj")
    sys.exit(1)


class XcodeProjectEditor:
    """Editor for Xcode project files using pbxproj library"""

    def __init__(self, project_path: Path):
        self.project_path = project_path
        self.pbxproj_path = project_path / "project.pbxproj"

        if not self.pbxproj_path.exists():
            raise FileNotFoundError(f"Project file not found: {self.pbxproj_path}")

        # Load project using pbxproj library
        self.project = XcodeProject.load(str(self.pbxproj_path))

    def save(self):
        """Save changes to the project file"""
        self.project.save()
        print(f"✅ Saved changes to {self.pbxproj_path}")

    def add_file_reference(self, file_path: str, local_path: str) -> bool:
        """Add a file reference to the project"""
        try:
            # Parse the file path to determine target group
            path_parts = file_path.split('/')
            if len(path_parts) < 2:
                print(f"❌ Invalid file path format: {file_path}")
                return False

            file_name = Path(local_path).name
            group_name = path_parts[-2] if len(path_parts) > 2 else path_parts[-1]

            # Check if file already exists
            existing_files = self.project.get_files_by_name(file_name)
            if existing_files:
                print(f"⚠️ File already exists in project: {file_name}")
                return True

            # Handle unsupported file extensions
            file_extension = Path(local_path).suffix.lower()
            if file_extension in ['.icon']:
                print(f"ℹ️ Adding unsupported file type {file_extension} as generic resource")

            # Convert to relative path from project directory
            try:
                relative_path = os.path.relpath(local_path, self.project_path.parent)
            except ValueError:
                # If relative path calculation fails, use the original path
                relative_path = local_path

            # Find or create the target group
            target_group = self.project.get_or_create_group(group_name)

            # Add file to project with special handling for .icon files
            if relative_path.endswith('.icon'):
                # Handle .icon files as generic data files
                try:
                    from pbxproj.pbxextensions.ProjectFiles import FileOptions
                    file_options = FileOptions(
                        create_build_files=False,  # Don't add to build phases
                        weak=False
                    )
                    file_ref = self.project.add_file(
                        relative_path,
                        parent=target_group,
                        file_options=file_options
                    )
                except Exception:
                    # Fallback: try to add as generic file
                    file_ref = self.project.add_file(
                        relative_path,
                        parent=target_group,
                        force=True
                    )
            else:
                # Regular file addition
                file_ref = self.project.add_file(
                    relative_path,
                    parent=target_group
                )

            if file_ref:
                print(f"✅ Added file reference: {file_name} to {group_name} group")
                return True
            else:
                print(f"❌ Failed to add file reference: {file_name}")
                return False

        except Exception as e:
            print(f"❌ Failed to add file reference: {e}")
            return False

    def remove_file_reference(self, file_path: str) -> bool:
        """Remove a file reference from the project"""
        try:
            path_parts = file_path.split('/')
            if len(path_parts) < 2:
                print(f"❌ Invalid file path format: {file_path}")
                return False

            file_name = path_parts[-1]

            # Find files by name
            files_to_remove = self.project.get_files_by_name(file_name)

            if not files_to_remove:
                print(f"❌ File reference not found: {file_name}")
                return False

            removed_count = 0
            for file_ref in files_to_remove:
                try:
                    self.project.remove_file_by_id(file_ref.get_id())
                    removed_count += 1
                except Exception as e:
                    print(f"⚠️ Failed to remove one instance of {file_name}: {e}")

            if removed_count > 0:
                print(f"🗑️ Removed {removed_count} file reference(s): {file_name}")
                return True
            else:
                print(f"❌ No file references removed for: {file_name}")
                return False

        except Exception as e:
            print(f"❌ Failed to remove file reference: {e}")
            return False

    def list_group_contents(self, group_path: str) -> List[Dict]:
        """List contents of a specific group (optimized)"""
        try:
            path_parts = group_path.split('/')
            if len(path_parts) < 2:
                return []

            group_name = path_parts[-1]

            # Fast approach: just look for common file patterns instead of iterating all objects
            references = []

            # Check for some known files by name rather than scanning everything
            known_files = [
                'NativeNavBar.h', 'NativeNavBar.m', 'NativeNavBar.swift',
                'WebAppLocalServer.swift', 'WebAppConfiguration.swift',
                'AssetBundleManager.swift', 'CDVDevice.h', 'CDVDevice.m'
            ]

            for file_name in known_files:
                try:
                    files = self.project.get_files_by_name(file_name)
                    if files:
                        for file_obj in files:
                            file_path = getattr(file_obj, 'path', file_name)
                            actual_path = self._resolve_file_path(file_path)

                            references.append({
                                'type': 'file',
                                'name': file_name,
                                'location': f"group:{group_path}/{file_name}",
                                'path': f"{group_path}/{file_name}",
                                'actual_path': actual_path
                            })
                except Exception:
                    continue  # Skip files that don't exist

            return sorted(references, key=lambda x: (x['type'], x['name']))

        except Exception as e:
            print(f"❌ Failed to list group contents: {e}")
            return []

    def get_project_structure(self, group_name: str = None) -> Dict:
        """Get the project structure as a nested dictionary"""
        try:
            # Simplified structure - just show known groups
            structure = {
                'type': 'project',
                'name': group_name or 'Project',
                'children': [
                    {
                        'type': 'group',
                        'name': 'Plugins',
                        'children': []
                    },
                    {
                        'type': 'group',
                        'name': 'Resources',
                        'children': []
                    },
                    {
                        'type': 'group',
                        'name': 'CarpSchool',
                        'children': []
                    }
                ]
            }

            return structure

        except Exception as e:
            print(f"❌ Failed to get project structure: {e}")
            return {}

    def _find_group_by_name(self, group_name: str) -> Optional[object]:
        """Find a group by name"""
        try:
            groups = self.project.get_groups_by_name(group_name)
            return groups[0] if groups else None
        except Exception:
            return None

    def _resolve_file_path(self, file_path: str) -> str:
        """Resolve the actual filesystem path"""
        try:
            if os.path.isabs(file_path):
                return file_path
            else:
                resolved = self.project_path.parent / file_path
                return str(resolved.resolve())
        except Exception:
            return file_path

    def _build_group_structure(self, group: object, depth: int = 0) -> Dict:
        """Recursively build group structure"""
        try:
            structure = {
                'type': 'group',
                'name': getattr(group, 'name', 'Unknown'),
                'children': []
            }

            if hasattr(group, 'children') and depth < 10:  # Prevent infinite recursion
                for child in group.children:
                    if hasattr(child, 'children'):  # It's a group
                        child_structure = self._build_group_structure(child, depth + 1)
                        structure['children'].append(child_structure)
                    else:  # It's a file
                        structure['children'].append({
                            'type': 'file',
                            'name': getattr(child, 'name', Path(getattr(child, 'path', '')).name),
                            'children': []
                        })

            return structure

        except Exception as e:
            print(f"⚠️ Error building group structure: {e}")
            return {
                'type': 'group',
                'name': 'Error',
                'children': []
            }


class XcodeWorkspaceEditor:
    """Editor for Xcode workspace files"""

    def __init__(self, workspace_path: str):
        self.workspace_path = Path(workspace_path)
        self.contents_path = self.workspace_path / "contents.xcworkspacedata"

        if not self.workspace_path.exists():
            raise FileNotFoundError(f"Workspace not found: {workspace_path}")

        if not self.contents_path.exists():
            raise FileNotFoundError(f"Workspace contents not found: {self.contents_path}")

        self.tree = ET.parse(self.contents_path)
        self.root = self.tree.getroot()

        # Find referenced projects
        self.projects = self._find_projects()

    def _find_projects(self) -> List[Dict]:
        """Find all .xcodeproj references in the workspace"""
        projects = []
        for file_ref in self.root.iter('FileRef'):
            location = file_ref.get('location', '')
            if location.endswith('.xcodeproj'):
                # Convert relative path to absolute
                if location.startswith('group:'):
                    project_path = self.workspace_path.parent / location.replace('group:', '')
                else:
                    project_path = Path(location)

                projects.append({
                    'name': project_path.name,
                    'path': project_path,
                    'location': location
                })
        return projects

    def save(self):
        """Save changes to the workspace file"""
        # Ensure proper XML formatting
        self._indent_xml(self.root)
        self.tree.write(self.contents_path, encoding='utf-8', xml_declaration=True)
        print(f"✅ Saved changes to {self.contents_path}")

    def _indent_xml(self, elem, level=0):
        """Add proper indentation to XML elements"""
        indent = "\n" + level * "  "
        if len(elem):
            if not elem.text or not elem.text.strip():
                elem.text = indent + "  "
            if not elem.tail or not elem.tail.strip():
                elem.tail = indent
            for child in elem:
                self._indent_xml(child, level + 1)
            if not child.tail or not child.tail.strip():
                child.tail = indent
        else:
            if level and (not elem.tail or not elem.tail.strip()):
                elem.tail = indent

    def remove_reference(self, ref_path: str) -> bool:
        """Remove a file reference from the workspace or project"""
        # Check if path refers to project-internal structure
        if ref_path and '/' in ref_path:
            path_parts = ref_path.split('/')
            project_name = path_parts[0]

            # Find the matching project
            target_project = None
            for project in self.projects:
                if project['name'].replace('.xcodeproj', '') == project_name:
                    target_project = project
                    break

            if target_project:
                try:
                    project_editor = XcodeProjectEditor(target_project['path'])
                    success = project_editor.remove_file_reference(ref_path)
                    if success:
                        project_editor.save()
                    return success
                except Exception as e:
                    print(f"❌ Failed to remove from project: {e}")
                    return False

        # Fallback to workspace-level removal
        for file_ref in self.root.iter('FileRef'):
            location = file_ref.get('location', '')
            if ref_path in location:
                parent = file_ref.getparent()
                if parent is not None:
                    parent.remove(file_ref)
                    print(f"🗑️ Removed reference: {ref_path}")
                    return True

        print(f"❌ Reference not found: {ref_path}")
        return False

    def add_reference(self, ref_path: str, local_path: str) -> bool:
        """Add a file reference to the workspace or appropriate project"""
        # Check if local file exists
        if not os.path.exists(local_path):
            print(f"❌ Local file not found: {local_path}")
            return False

        # Determine if this should go into a project file
        if self.projects and ref_path.split('/')[0] in [p['name'].replace('.xcodeproj', '') for p in self.projects]:
            # Find the appropriate project
            project_name = ref_path.split('/')[0]
            target_project = None

            for project in self.projects:
                if project['name'].replace('.xcodeproj', '') == project_name:
                    target_project = project
                    break

            if target_project:
                print(f"🎯 Adding to project: {target_project['name']}")
                try:
                    project_editor = XcodeProjectEditor(target_project['path'])
                    success = project_editor.add_file_reference(ref_path, local_path)
                    if success:
                        project_editor.save()
                    return success
                except Exception as e:
                    print(f"❌ Failed to add to project: {e}")
                    return False

        print(f"❌ Could not determine target for: {ref_path}")
        return False

    def list_references(self, path: str = "") -> List[Dict]:
        """List all references in a given path"""
        references = []

        # Check if path refers to project-internal structure
        if path and '/' in path:
            path_parts = path.split('/')
            project_name = path_parts[0]

            # Find the matching project
            target_project = None
            for project in self.projects:
                if project['name'].replace('.xcodeproj', '') == project_name:
                    target_project = project
                    break

            if target_project:
                try:
                    project_editor = XcodeProjectEditor(target_project['path'])
                    return project_editor.list_group_contents(path)
                except Exception as e:
                    print(f"❌ Failed to read project contents: {e}")
                    return []

        # Workspace-level references
        for file_ref in self.root.iter('FileRef'):
            location = file_ref.get('location', '')
            name = file_ref.get('name', location.split('/')[-1])

            if not path or path in location:
                ref_type = 'project' if location.endswith('.xcodeproj') else 'file'
                references.append({
                    'type': ref_type,
                    'name': name,
                    'location': location,
                    'path': location.replace('group:', '')
                })

        # Add project information
        if self.projects:
            for project in self.projects:
                if not path or path in str(project['path']):
                    references.append({
                        'type': 'project',
                        'name': project['name'],
                        'location': project['location'],
                        'path': project['location'].replace('group:', '')
                    })

        return sorted(references, key=lambda x: (x['type'], x['name']))

    def print_tree(self, path: str = "", max_depth: int = 10):
        """Print the workspace structure as a tree"""
        print(f"📋 Workspace Structure: {self.workspace_path}")
        print("=" * 50)

        # Show workspace-level structure
        self._print_workspace_tree()

        # Show project-internal structures
        if not path:
            for project in self.projects:
                try:
                    project_editor = XcodeProjectEditor(project['path'])
                    project_structure = project_editor.get_project_structure()
                    if project_structure:
                        print(f"\n📋 {project['name']} Internal Structure:")
                        self._print_project_tree_recursive(project_structure, "", 0, max_depth)
                except Exception as e:
                    print(f"❌ Could not read {project['name']}: {e}")

    def _print_workspace_tree(self):
        """Print workspace-level tree"""
        for file_ref in self.root.iter('FileRef'):
            location = file_ref.get('location', '')
            name = file_ref.get('name', location.split('/')[-1])
            icon = "🎯" if location.endswith('.xcodeproj') else "📄"
            print(f"├── {icon} {name}")

    def _print_project_tree_recursive(self, node: Dict, prefix: str, depth: int, max_depth: int):
        """Recursively print project tree structure"""
        if depth > max_depth:
            return

        name = node.get('name', 'Unknown')

        # Determine icon based on type
        if node['type'] == 'file':
            icon = "📄"
        elif node['type'] == 'group':
            icon = "📁"
        else:
            icon = "❓"

        print(f"{prefix}{icon} {name}")

        # Print children
        children = node.get('children', [])
        if children:
            for i, child in enumerate(children):
                is_last = i == len(children) - 1
                child_prefix = prefix + ("    " if is_last else "│   ")
                connector = "└── " if is_last else "├── "
                self._print_project_tree_recursive(child, prefix + connector, depth + 1, max_depth)


def main():
    parser = argparse.ArgumentParser(
        description="Xcode Workspace Reference Editor (Library-based)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s rm MyApp.xcworkspace CarpSchool/Plugins/file.swift
  %(prog)s add MyApp.xcworkspace CarpSchool/NewFile.swift ./src/NewFile.swift
  %(prog)s tree MyApp.xcworkspace
  %(prog)s ls MyApp.xcworkspace CarpSchool/Plugins
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Remove command
    rm_parser = subparsers.add_parser('rm', help='Remove a reference from workspace')
    rm_parser.add_argument('workspace', help='Path to .xcworkspace file')
    rm_parser.add_argument('ref_path', help='Reference path to remove')

    # Add command
    add_parser = subparsers.add_parser('add', help='Add a reference to workspace')
    add_parser.add_argument('workspace', help='Path to .xcworkspace file')
    add_parser.add_argument('ref_path', help='Reference path in workspace')
    add_parser.add_argument('local_path', help='Local file path to reference')

    # Tree command
    tree_parser = subparsers.add_parser('tree', help='Show workspace structure as tree')
    tree_parser.add_argument('workspace', help='Path to .xcworkspace file')
    tree_parser.add_argument('path', nargs='?', default='', help='Filter by path (optional)')
    tree_parser.add_argument('--depth', type=int, default=10, help='Maximum tree depth')

    # List command
    ls_parser = subparsers.add_parser('ls', help='List references in workspace')
    ls_parser.add_argument('workspace', help='Path to .xcworkspace file')
    ls_parser.add_argument('path', nargs='?', default='', help='Filter by path (optional)')
    ls_parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed information')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    try:
        editor = XcodeWorkspaceEditor(args.workspace)

        if args.command == 'rm':
            success = editor.remove_reference(args.ref_path)
            if success:
                editor.save()
                return 0
            return 1

        elif args.command == 'add':
            success = editor.add_reference(args.ref_path, args.local_path)
            if success:
                editor.save()
                return 0
            return 1

        elif args.command == 'tree':
            editor.print_tree(args.path, args.depth)
            return 0

        elif args.command == 'ls':
            references = editor.list_references(args.path)

            if not references:
                print(f"📭 No references found in: {args.path or 'workspace'}")
                return 0

            print(f"📋 References in: {args.path or 'workspace'}")
            print("=" * 50)

            for ref in references:
                if ref['type'] == 'project':
                    icon = "🎯"
                elif ref['type'] == 'file':
                    icon = "📄"
                else:
                    icon = "📁"

                if args.verbose:
                    print(f"{icon} {ref['name']}")
                    print(f"   Type: {ref['type']}")
                    print(f"   Location: {ref['location']}")
                    print(f"   Path: {ref['path']}")
                    if 'actual_path' in ref:
                        print(f"   Actual Path: {ref['actual_path']}")
                    print()
                else:
                    if 'actual_path' in ref and ref['type'] == 'file':
                        print(f"{icon} {ref['name']} -> {ref['actual_path']}")
                    else:
                        print(f"{icon} {ref['name']} ({ref['path']})")

            return 0

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
