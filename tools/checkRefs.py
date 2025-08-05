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

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import print as rich_print

# Initialize rich console
console = Console()

class RefChecker:
    def __init__(self, root_dir: str = ".", verbose: bool = False):
        self.root_dir = Path(root_dir).resolve()
        self.verbose = verbose
        self.errors = []
        self.warnings = []
        self.suggestions = []

        # File patterns to check
        self.js_extensions = {'.js', '.jsx', '.ts', '.tsx', '.mjs'}

        # Node.js built-in modules
        self.builtin_modules = {
            'assert', 'async_hooks', 'buffer', 'child_process', 'cluster',
            'console', 'constants', 'crypto', 'dgram', 'dns', 'domain',
            'events', 'fs', 'http', 'http2', 'https', 'inspector',
            'module', 'net', 'os', 'path', 'perf_hooks', 'process',
            'punycode', 'querystring', 'readline', 'repl', 'stream',
            'string_decoder', 'sys', 'timers', 'tls', 'trace_events',
            'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads',
            'zlib'
        }

        # Load package.json dependencies
        self.package_dependencies = self.load_package_dependencies()
        self.import_patterns = [
            r'import\s+(?:(?:\{[^}]+\}|\w+|\*\s+as\s+\w+)(?:\s*,\s*(?:\{[^}]+\}|\w+))*\s+from\s+)?["\']([^"\']+)["\']',
            r'require\s*\(\s*["\']([^"\']+)["\']\s*\)',
            r'import\s*\(\s*["\']([^"\']+)["\']\s*\)',
        ]

        self.component_pattern = r'(?:export\s+default\s+(?:function\s+)?(\w+)|export\s+(?:const|function)\s+(\w+)|class\s+(\w+)\s+extends)'

        # Pattern to extract named imports from import statements
        self.named_import_pattern = r'import\s+\{([^}]+)\}\s+from\s+["\']([^"\']+)["\']'

    def log(self, message: str, level: str = "INFO"):
        """Log message with level"""
        if self.verbose or level in ["ERROR", "WARNING"]:
            color_map = {
                "INFO": "cyan",
                "ERROR": "red",
                "WARNING": "yellow",
                "SUCCESS": "green"
            }
            color = color_map.get(level, "white")
            console.print(f"[{color}][{level}][/{color}] {message}")

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

    def extract_named_imports(self, file_path: Path) -> List[Tuple[List[str], str, int]]:
        """Extract named imports (e.g., {Component1, Component2}) from a file"""
        named_imports = []

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            for line_num, line in enumerate(content.split('\n'), 1):
                # Skip comments
                if line.strip().startswith('//') or line.strip().startswith('/*'):
                    continue

                matches = re.findall(self.named_import_pattern, line)
                for imports_str, source_path in matches:
                    # Parse the named imports, handling spaces and aliases
                    import_names = []
                    for import_item in imports_str.split(','):
                        import_item = import_item.strip()
                        # Handle "as" aliases (e.g., "Component as MyComponent")
                        if ' as ' in import_item:
                            original_name = import_item.split(' as ')[0].strip()
                        else:
                            original_name = import_item

                        if original_name:
                            import_names.append(original_name)

                    if import_names:
                        named_imports.append((import_names, source_path, line_num))

        except Exception as e:
            self.add_error(f"Error reading {file_path}: {e}")

        return named_imports

    def extract_exports(self, file_path: Path) -> Set[str]:
        """Extract all exported names from a file"""
        exports = set()

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find default exports (but not re-exports)
            default_exports = re.findall(r'export\s+default\s+(?:function\s+)?(\w+)(?!\s+as)', content)
            exports.update(default_exports)

            # Find named exports
            named_exports = re.findall(r'export\s+(?:const|let|var|function|class)\s+(\w+)', content)
            exports.update(named_exports)

            # Find export { ... } statements and re-exports
            # Handle: export { default as ComponentName } from "./ComponentName"
            reexport_pattern = r'export\s*\{\s*default\s+as\s+(\w+)\s*\}\s*from'
            reexports = re.findall(reexport_pattern, content)
            exports.update(reexports)

            # Handle: export { ComponentName } (but not re-exports)
            # Only process lines that don't have 'from' keyword
            for line in content.split('\n'):
                if line.strip().startswith('export') and '{' in line and '}' in line and 'from' not in line:
                    # Extract content between braces
                    match = re.search(r'export\s*\{\s*([^}]+)\s*\}', line)
                    if match:
                        block = match.group(1)
                        for export_item in block.split(','):
                            export_item = export_item.strip()
                            if ' as ' in export_item:
                                # Handle "originalName as exportedName"
                                exported_name = export_item.split(' as ')[1].strip()
                                exports.add(exported_name)
                            else:
                                # Handle simple exports like "ComponentName"
                                if export_item and export_item != 'default':
                                    exports.add(export_item)

            # Only add class/function declarations if they are explicitly exported
            # (The patterns above should catch all legitimate exports)

        except Exception as e:
            self.add_error(f"Error reading exports from {file_path}: {e}")

        return exports

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
        """Load dependencies from the nearest package.json walking up the directory tree"""
        dependencies = set()

        # Walk up the directory tree to find the first package.json
        current_dir = self.root_dir
        while current_dir != current_dir.parent:  # Stop at filesystem root
            package_json_path = current_dir / "package.json"

            if package_json_path.exists():
                try:
                    with open(package_json_path, 'r', encoding='utf-8') as f:
                        content = f.read().strip()
                        if not content:  # Skip empty files
                            break

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

                    self.log(f"Loaded {len(dependencies)} dependencies from {package_json_path}")
                    break  # Stop once we find and process the first package.json

                except (json.JSONDecodeError, FileNotFoundError, KeyError, UnicodeDecodeError) as e:
                    # Only log if verbose mode is on to reduce noise
                    if self.verbose:
                        self.log(f"Warning: Could not read {package_json_path}: {e}")
                    # Continue to parent directory if current package.json is corrupted

            current_dir = current_dir.parent

        if not dependencies:
            self.log("No valid package.json found in directory hierarchy")

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

            # Check named imports
            named_imports = self.extract_named_imports(file_path)
            for import_names, source_path, line_num in named_imports:
                resolved = self.resolve_import_path(source_path, file_path)

                if resolved and not self.is_external_package(source_path):
                    # File exists, check if exports contain the named imports
                    exports = self.extract_exports(resolved)

                    for import_name in import_names:
                        if import_name not in exports:
                            error_msg = f"{relative_path}:{line_num} - Named import '{import_name}' not found in '{source_path}'"
                            broken_imports[str(relative_path)].append(error_msg)
                            self.add_error(error_msg)

        return dict(broken_imports)

    def is_external_package(self, import_path: str) -> bool:
        """Check if import is an external package that exists in package.json or is built-in"""
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

        # Check if it's a Node.js built-in module
        if package_name in self.builtin_modules:
            return True  # Built-in modules are always valid

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
        console.print("🔍 [bold blue]Starting comprehensive reference check...[/bold blue]\n")

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

        # Create summary table
        table = Table(title="📊 Reference Check Summary", show_header=True, header_style="bold magenta")
        table.add_column("Type", style="dim", width=12)
        table.add_column("Count", justify="center", width=8)
        table.add_column("Status", width=15)

        # Add rows with conditional styling
        error_count = report['summary']['total_errors']
        warning_count = report['summary']['total_warnings']
        suggestion_count = report['summary']['total_suggestions']

        error_style = "red" if error_count > 0 else "green"
        warning_style = "yellow" if warning_count > 0 else "green"
        suggestion_style = "blue" if suggestion_count > 0 else "green"

        table.add_row("❌ Errors", str(error_count), "❌ Issues found" if error_count > 0 else "✅ Clean", style=error_style)
        table.add_row("⚠️  Warnings", str(warning_count), "⚠️ Attention needed" if warning_count > 0 else "✅ Clean", style=warning_style)
        table.add_row("💡 Suggestions", str(suggestion_count), "💡 Improvements" if suggestion_count > 0 else "✅ Clean", style=suggestion_style)

        console.print()
        console.print(table)

        if error_count == 0 and warning_count == 0:
            console.print(Panel.fit("✅ [bold green]All references look good![/bold green]", border_style="green"))
            return 0
        else:
            console.print(Panel.fit("🔧 [bold yellow]Found issues that may need attention.[/bold yellow]", border_style="yellow"))
            return 1

    except Exception as e:
        console.print(Panel.fit(f"❌ [bold red]Error running reference check: {e}[/bold red]", border_style="red"))
        return 1

if __name__ == "__main__":
    exit(main())
