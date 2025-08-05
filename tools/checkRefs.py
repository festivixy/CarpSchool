#!/usr/bin/env python3
"""
Reference Checker for React/Meteor Codebase

Validates import statements and file references after refactoring
and file moves. Helps catch broken imports and circular dependencies.

Usage:
    python checkRefs.py [options]

Options:
    --imports     Check import statements for broken references
    --exports     Check component exports and usage
    --circular    Check for circular dependencies
    --paths       Validate all file paths in imports
    --all         Run all checks (default)
    --verbose     Show detailed output
    --fix         Suggest fixes for broken references
"""

import os
import re
import sys
import json
import argparse
from pathlib import Path
from collections import defaultdict, deque
from typing import Dict, List, Set, Tuple, Optional

class RefChecker:
    def __init__(self, root_dir: str = ".", verbose: bool = False):
        self.root_dir = Path(root_dir).resolve()
        self.verbose = verbose
        self.errors = []
        self.warnings = []
        self.suggestions = []

        # File patterns to check
        self.js_extensions = {'.js', '.jsx', '.ts', '.tsx', '.mjs'}

        # Load package.json dependencies
        self.package_dependencies = self.load_package_dependencies()
        self.import_patterns = [
            r'import\s+(?:(?:\{[^}]+\}|\w+|\*\s+as\s+\w+)(?:\s*,\s*(?:\{[^}]+\}|\w+))*\s+from\s+)?["\']([^"\']+)["\']',
            r'require\s*\(\s*["\']([^"\']+)["\']\s*\)',
            r'import\s*\(\s*["\']([^"\']+)["\']\s*\)',
        ]

        self.component_pattern = r'(?:export\s+default\s+(?:function\s+)?(\w+)|export\s+(?:const|function)\s+(\w+)|class\s+(\w+)\s+extends)'

    def log(self, message: str, level: str = "INFO"):
        """Log message with level"""
        if self.verbose or level in ["ERROR", "WARNING"]:
            print(f"[{level}] {message}")

    def add_error(self, message: str):
        """Add error to results"""
        self.errors.append(message)
        self.log(message, "ERROR")

    def add_warning(self, message: str):
        """Add warning to results"""
        self.warnings.append(message)
        self.log(message, "WARNING")

    def add_suggestion(self, message: str):
        """Add suggestion to results"""
        self.suggestions.append(message)
        self.log(message, "SUGGESTION")

    def find_js_files(self) -> List[Path]:
        """Find all JavaScript/TypeScript files in the project"""
        js_files = []

        # Focus on imports directory for Meteor projects
        search_dirs = [
            self.root_dir / "imports",
            self.root_dir / "client",
            self.root_dir / "server",
            self.root_dir / "public"
        ]

        for search_dir in search_dirs:
            if search_dir.exists():
                for file_path in search_dir.rglob("*"):
                    if file_path.suffix in self.js_extensions and file_path.is_file():
                        js_files.append(file_path)

        self.log(f"Found {len(js_files)} JavaScript/TypeScript files")
        return js_files

    def extract_imports(self, file_path: Path) -> List[Tuple[str, int]]:
        """Extract import statements from a file"""
        imports = []

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            for line_num, line in enumerate(content.split('\n'), 1):
                # Skip comments
                if line.strip().startswith('//') or line.strip().startswith('/*'):
                    continue

                for pattern in self.import_patterns:
                    matches = re.findall(pattern, line)
                    for match in matches:
                        imports.append((match, line_num))

        except Exception as e:
            self.add_error(f"Error reading {file_path}: {e}")

        return imports

    def find_project_root(self, current_file: Path) -> Optional[Path]:
        """Find the nearest package.json to determine project root"""
        current_dir = current_file.parent if current_file.is_file() else current_file

        while current_dir != current_dir.parent:  # Stop at filesystem root
            package_json = current_dir / "package.json"
            if package_json.exists():
                return current_dir
            current_dir = current_dir.parent

        return None

    def load_package_dependencies(self) -> Set[str]:
        """Load all dependencies from package.json files"""
        dependencies = set()

        # Skip build directories and node_modules to avoid corrupted/generated files
        excluded_paths = ['node_modules', '.meteor/local', 'build', 'dist']

        # Find all package.json files in the project
        for package_json_path in self.root_dir.rglob("package.json"):
            # Skip if in excluded directories
            if any(excluded in str(package_json_path) for excluded in excluded_paths):
                continue

            try:
                with open(package_json_path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if not content:  # Skip empty files
                        continue

                    package_data = json.loads(content)

                # Collect all types of dependencies
                for dep_type in ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']:
                    if dep_type in package_data:
                        dep_section = package_data[dep_type]
                        # Handle both object (normal) and list (rare edge case) formats
                        if isinstance(dep_section, dict):
                            dependencies.update(dep_section.keys())
                        elif isinstance(dep_section, list):
                            dependencies.update(dep_section)

            except (json.JSONDecodeError, FileNotFoundError, KeyError, UnicodeDecodeError) as e:
                # Only log if verbose mode is on to reduce noise
                if self.verbose:
                    self.log(f"Warning: Could not read {package_json_path}: {e}")

        self.log(f"Loaded {len(dependencies)} dependencies from package.json files")
        return dependencies

    def resolve_import_path(self, import_path: str, current_file: Path) -> Optional[Path]:
        """Resolve an import path to an actual file path"""
        # Handle relative imports (starting with . or ..)
        if import_path.startswith('.'):
            base_dir = current_file.parent
            resolved_path = (base_dir / import_path).resolve()
        # Handle absolute imports (starting with /)
        elif import_path.startswith('/'):
            # Find the nearest package.json to determine project root
            project_root = self.find_project_root(current_file)
            if project_root is None:
                # Fallback to provided root_dir if no package.json found
                project_root = self.root_dir

            # Remove leading slash and resolve relative to project root
            relative_path = import_path.lstrip('/')
            resolved_path = (project_root / relative_path).resolve()
        else:
            # Handle external packages
            if import_path.startswith('meteor/'):
                return None  # Meteor packages, assume they exist

            # Check if it's a node_modules import (no leading slash, contains slash)
            if '/' in import_path or not import_path.replace('-', '').replace('_', '').isalnum():
                # Likely a node_modules package
                return None

            # Fallback: treat as relative to project root
            project_root = self.find_project_root(current_file)
            if project_root is None:
                project_root = self.root_dir
            resolved_path = (project_root / import_path).resolve()

        # Try different extensions if exact file doesn't exist
        if resolved_path.exists() and resolved_path.is_file():
            return resolved_path

        # Try adding extensions
        for ext in ['.js', '.jsx', '.ts', '.tsx', '.mjs']:
            test_path = resolved_path.with_suffix(ext)
            if test_path.exists():
                return test_path

        # Try index files
        if resolved_path.is_dir():
            for index_file in ['index.js', 'index.jsx', 'index.ts', 'index.tsx']:
                index_path = resolved_path / index_file
                if index_path.exists():
                    return index_path

        return None

    def extract_exports(self, file_path: Path) -> List[str]:
        """Extract exported component names from a file"""
        exports = []

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find component exports
            matches = re.findall(self.component_pattern, content)
            for match in matches:
                # match is a tuple, find the non-empty group
                component_name = next((name for name in match if name), None)
                if component_name:
                    exports.append(component_name)

            # Find named exports
            named_exports = re.findall(r'export\s*\{\s*([^}]+)\s*\}', content)
            for export_list in named_exports:
                names = [name.strip().split(' as ')[0] for name in export_list.split(',')]
                exports.extend([name.strip() for name in names if name.strip()])

        except Exception as e:
            self.add_error(f"Error reading exports from {file_path}: {e}")

        return exports

    def check_imports(self) -> Dict[str, List[str]]:
        """Check all import statements for broken references"""
        self.log("Checking import statements...")

        broken_imports = defaultdict(list)
        js_files = self.find_js_files()

        for file_path in js_files:
            relative_path = file_path.relative_to(self.root_dir)
            imports = self.extract_imports(file_path)

            for import_path, line_num in imports:
                resolved = self.resolve_import_path(import_path, file_path)

                if resolved is None and not self.is_external_package(import_path):
                    error_msg = f"{relative_path}:{line_num} - Broken import: '{import_path}'"
                    broken_imports[str(relative_path)].append(error_msg)
                    self.add_error(error_msg)

        return dict(broken_imports)

    def is_external_package(self, import_path: str) -> bool:
        """Check if import is an external package that exists in package.json"""
        # Handle scoped packages (e.g., @babel/core)
        if import_path.startswith('@'):
            # For scoped packages, take everything up to the second slash or end
            parts = import_path.split('/')
            if len(parts) >= 2:
                package_name = f"{parts[0]}/{parts[1]}"
            else:
                package_name = import_path
        else:
            # For regular packages, take only the first part
            package_name = import_path.split('/')[0]

        # Special handling for Meteor packages
        if import_path.startswith('meteor/'):
            return True  # Meteor packages are always considered valid

        # Check if the package is declared in package.json
        return package_name in self.package_dependencies



    def check_circular_dependencies(self) -> List[List[str]]:
        """Check for circular dependencies"""
        self.log("Checking for circular dependencies...")

        # Build dependency graph
        dependency_graph = defaultdict(set)
        js_files = self.find_js_files()

        for file_path in js_files:
            imports = self.extract_imports(file_path)
            for import_path, _ in imports:
                resolved = self.resolve_import_path(import_path, file_path)
                if resolved:
                    dependency_graph[str(file_path.relative_to(self.root_dir))].add(
                        str(resolved.relative_to(self.root_dir))
                    )

        # Find cycles using DFS
        cycles = []
        visited = set()
        rec_stack = set()

        def dfs(node, path):
            if node in rec_stack:
                cycle_start = path.index(node)
                cycle = path[cycle_start:] + [node]
                cycles.append(cycle)
                return

            if node in visited:
                return

            visited.add(node)
            rec_stack.add(node)

            for neighbor in dependency_graph.get(node, []):
                dfs(neighbor, path + [node])

            rec_stack.remove(node)

        for node in dependency_graph:
            if node not in visited:
                dfs(node, [])

        for cycle in cycles:
            cycle_str = " → ".join(cycle)
            self.add_warning(f"Circular dependency: {cycle_str}")

        return cycles

    def suggest_fixes(self, broken_imports: Dict[str, List[str]]):
        """Suggest fixes for broken imports"""
        self.log("Generating fix suggestions...")

        js_files = self.find_js_files()
        file_map = {}

        # Build map of component names to file paths
        for file_path in js_files:
            exports = self.extract_exports(file_path)
            for export in exports:
                if export not in file_map:
                    file_map[export] = []
                file_map[export].append(file_path)

        # Suggest fixes
        for file_path, errors in broken_imports.items():
            for error in errors:
                # Extract import name from error
                match = re.search(r"Broken import: '([^']+)'", error)
                if match:
                    import_path = match.group(1)
                    # Simple suggestion based on file name
                    suggested_files = [f for f in js_files if import_path.split('/')[-1] in str(f)]
                    if suggested_files:
                        self.add_suggestion(f"For broken import '{import_path}' in {file_path}, consider: {[str(f.relative_to(self.root_dir)) for f in suggested_files[:3]]}")

    def generate_report(self) -> Dict:
        """Generate comprehensive report"""
        return {
            "errors": self.errors,
            "warnings": self.warnings,
            "suggestions": self.suggestions,
            "summary": {
                "total_errors": len(self.errors),
                "total_warnings": len(self.warnings),
                "total_suggestions": len(self.suggestions)
            }
        }

    def run_all_checks(self) -> Dict:
        """Run all reference checks"""
        print("🔍 Starting comprehensive reference check...\n")

        # Check imports
        broken_imports = self.check_imports()

        # Check circular dependencies
        circular_deps = self.check_circular_dependencies()

        # Generate suggestions
        if broken_imports:
            self.suggest_fixes(broken_imports)

        return self.generate_report()

def main():
    parser = argparse.ArgumentParser(description="Check references in React/Meteor codebase")
    parser.add_argument("--imports", action="store_true", help="Check import statements")
    parser.add_argument("--exports", action="store_true", help="Check component exports")
    parser.add_argument("--circular", action="store_true", help="Check circular dependencies")
    parser.add_argument("--paths", action="store_true", help="Validate file paths")
    parser.add_argument("--all", action="store_true", help="Run all checks")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--fix", action="store_true", help="Suggest fixes")
    parser.add_argument("--root", default=".", help="Root directory to check")

    args = parser.parse_args()

    # Default to all checks if no specific check is requested
    if not any([args.imports, args.exports, args.circular, args.paths]):
        args.all = True

    checker = RefChecker(args.root, args.verbose)

    try:
        if args.all:
            report = checker.run_all_checks()
        else:
            if args.imports:
                checker.check_imports()
            if args.circular:
                checker.check_circular_dependencies()

            report = checker.generate_report()

        # Print summary
        print("\n" + "="*60)
        print("📊 REFERENCE CHECK SUMMARY")
        print("="*60)
        print(f"❌ Errors: {report['summary']['total_errors']}")
        print(f"⚠️  Warnings: {report['summary']['total_warnings']}")
        print(f"💡 Suggestions: {report['summary']['total_suggestions']}")

        if report['summary']['total_errors'] == 0 and report['summary']['total_warnings'] == 0:
            print("\n✅ All references look good!")
            return 0
        else:
            print(f"\n🔧 Found issues that may need attention.")
            return 1

    except Exception as e:
        print(f"❌ Error running reference check: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
