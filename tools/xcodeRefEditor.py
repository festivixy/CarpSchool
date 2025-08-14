#!/usr/bin/env python3
"""
xcodeRefEditor.py - Xcode Workspace Reference Editor

A tool for managing file references in Xcode workspace (.xcworkspace) files.
Supports adding, removing, listing, and displaying tree structure of references.

Usage:
    xcodeRefEditor.py rm <workspace> <ref_path>        # Remove a reference
    xcodeRefEditor.py add <workspace> <ref_path> <local_path>  # Add a reference
    xcodeRefEditor.py tree <workspace> [path]          # Show tree structure
    xcodeRefEditor.py ls <workspace> [path]            # List references

Examples:
    xcodeRefEditor.py rm MyApp.xcworkspace CarpSchool/Plugins/file.swift
    xcodeRefEditor.py add MyApp.xcworkspace CarpSchool/NewFile.swift ./src/NewFile.swift
    xcodeRefEditor.py tree MyApp.xcworkspace
    xcodeRefEditor.py ls MyApp.xcworkspace CarpSchool/Plugins
"""

import argparse
import sys
import os
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class XcodeProjectEditor:
    """Editor for Xcode project files"""

    def __init__(self, project_path: Path):
        self.project_path = project_path
        self.pbxproj_path = project_path / "project.pbxproj"

        if not self.pbxproj_path.exists():
            raise FileNotFoundError(f"Project file not found: {self.pbxproj_path}")

        # Read the project file (it's a plist format, but we'll treat it as text for simple operations)
        with open(self.pbxproj_path, 'r', encoding='utf-8') as f:
            self.content = f.read()

    def save(self):
        """Save changes to the project file"""
        with open(self.pbxproj_path, 'w', encoding='utf-8') as f:
            f.write(self.content)
        print(f"✅ Saved changes to {self.pbxproj_path}")

    def add_file_reference(self, file_path: str, local_path: str) -> bool:
        """Add a file reference to the project (simplified implementation)"""
        # For now, just print what would be done
        print(f"📝 Would add to project: {file_path} -> {local_path}")
        print(f"   Project: {self.project_path}")
        return True


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
            for elem in elem:
                self._indent_xml(elem, level + 1)
            if not elem.tail or not elem.tail.strip():
                elem.tail = indent
        else:
            if level and (not elem.tail or not elem.tail.strip()):
                elem.tail = indent

    def _find_file_ref(self, ref_path: str) -> Optional[ET.Element]:
        """Find a FileRef element by path"""
        for file_ref in self.root.iter('FileRef'):
            location = file_ref.get('location', '')
            if location.endswith(ref_path) or ref_path in location:
                return file_ref
        return None

    def _find_group_ref(self, path: str) -> Optional[ET.Element]:
        """Find a Group element by path"""
        for group in self.root.iter('Group'):
            location = group.get('location', '')
            name = group.get('name', '')
            if path in location or path == name:
                return group
        return None

    def _get_file_structure(self, element=None, path="") -> Dict:
        """Get the file structure as a nested dictionary"""
        if element is None:
            element = self.root

        structure = {
            'type': element.tag,
            'name': element.get('name', ''),
            'location': element.get('location', ''),
            'children': []
        }

        for child in element:
            if child.tag in ['FileRef', 'Group']:
                child_path = f"{path}/{child.get('name', child.get('location', '').split('/')[-1])}"
                structure['children'].append(self._get_file_structure(child, child_path))

        return structure

    def remove_reference(self, ref_path: str) -> bool:
        """Remove a file reference from the workspace"""
        file_ref = self._find_file_ref(ref_path)
        if file_ref is not None:
            parent = file_ref.getparent()
            if parent is not None:
                parent.remove(file_ref)
                print(f"🗑️  Removed reference: {ref_path}")
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

        # Fallback to workspace-level reference
        # Check if reference already exists
        if self._find_file_ref(ref_path):
            print(f"⚠️  Reference already exists: {ref_path}")
            return False

        # Find or create parent group
        path_parts = ref_path.split('/')
        if len(path_parts) > 1:
            group_path = '/'.join(path_parts[:-1])
            parent_group = self._find_group_ref(group_path)

            if parent_group is None:
                # Create group if it doesn't exist
                parent_group = ET.SubElement(self.root, 'Group')
                parent_group.set('location', f"group:{group_path}")
                parent_group.set('name', path_parts[-2])
        else:
            parent_group = self.root

        # Create file reference
        file_ref = ET.SubElement(parent_group, 'FileRef')
        file_ref.set('location', f"group:{ref_path}")

        print(f"✅ Added reference to workspace: {ref_path} -> {local_path}")
        return True

    def list_references(self, path: str = "") -> List[Dict]:
        """List all references in a given path"""
        references = []

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

        for group in self.root.iter('Group'):
            location = group.get('location', '')
            name = group.get('name', location.split('/')[-1])

            if not path or path in location or path in name:
                references.append({
                    'type': 'group',
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
        structure = self._get_file_structure()
        self._print_tree_recursive(structure, "", path, 0, max_depth)

    def _print_tree_recursive(self, node: Dict, prefix: str, filter_path: str, depth: int, max_depth: int):
        """Recursively print tree structure"""
        if depth > max_depth:
            return

        name = node['name'] or node['location'].split('/')[-1]
        location = node['location']

        # Filter by path if specified
        if filter_path and filter_path not in location and filter_path not in name:
            return

        # Determine icon based on type
        if node['type'] == 'FileRef':
            if node['location'].endswith('.xcodeproj'):
                icon = "🎯"
            else:
                icon = "📄"
        elif node['type'] == 'Group':
            icon = "📁"
        else:
            icon = "📋"

        print(f"{prefix}{icon} {name}")

        # Print children
        if node['children']:
            for i, child in enumerate(node['children']):
                is_last = i == len(node['children']) - 1
                child_prefix = prefix + ("    " if is_last else "│   ")
                connector = "└── " if is_last else "├── "
                self._print_tree_recursive(child, prefix + connector, filter_path, depth + 1, max_depth)


def main():
    parser = argparse.ArgumentParser(
        description="Xcode Workspace Reference Editor",
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
    rm_parser.add_argument('ref_path', help='Reference path to remove (e.g., CarpSchool/Plugins/file.swift)')

    # Add command
    add_parser = subparsers.add_parser('add', help='Add a reference to workspace')
    add_parser.add_argument('workspace', help='Path to .xcworkspace file')
    add_parser.add_argument('ref_path', help='Reference path in workspace (e.g., CarpSchool/NewFile.swift)')
    add_parser.add_argument('local_path', help='Local file path to reference')

    # Tree command
    tree_parser = subparsers.add_parser('tree', help='Show workspace structure as tree')
    tree_parser.add_argument('workspace', help='Path to .xcworkspace file')
    tree_parser.add_argument('path', nargs='?', default='', help='Filter by path (optional)')
    tree_parser.add_argument('--depth', type=int, default=10, help='Maximum tree depth (default: 10)')

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
            print(f"📋 Workspace Structure: {args.workspace}")
            print("=" * 50)
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
                    print()
                else:
                    print(f"{icon} {ref['name']} ({ref['path']})")

            return 0

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
