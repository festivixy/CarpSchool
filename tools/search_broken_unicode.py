#!/usr/bin/env python3
"""
Search Broken Unicode - Find and report broken unicode characters in files

This script helps identify files with unicode encoding issues, broken characters,
and encoding problems that can cause display or processing issues.

Usage:
    search_broken_unicode.py [file_or_directory]
    search_broken_unicode.py --pattern "��" src/
    search_broken_unicode.py --encoding-issues --recursive .
    search_broken_unicode.py --fix --backup src/file.py

Features:
    - Detects common broken unicode patterns (�, ��, etc.)
    - Identifies encoding mismatches
    - Recursive directory scanning
    - Multiple encoding detection
    - Optional fixing with backup
    - Detailed reporting
"""

import sys
import os
import argparse
import re
import chardet
from pathlib import Path
import shutil
from datetime import datetime

class BrokenUnicodeSearcher:
    """Search for and optionally fix broken unicode characters"""

    def __init__(self):
        # Common broken unicode patterns
        self.broken_patterns = [
            r'�',           # Replacement character
            r'��',          # Double replacement
            r'���',         # Triple replacement
            r'\ufffd',      # Unicode replacement character
            r'\u00c2\u00a0', # Non-breaking space encoding issue
            r'\u00e2\u0080\u0099', # Smart quote encoding issue
            r'\u00e2\u0080\u009c', # Smart quote encoding issue
            r'\u00e2\u0080\u009d', # Smart quote encoding issue
        ]

        # File extensions to check by default
        self.default_extensions = {
            '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss',
            '.json', '.xml', '.txt', '.md', '.rst', '.log', '.yml', '.yaml'
        }

        self.results = []

    def detect_encoding(self, file_path):
        """Detect file encoding using chardet"""
        try:
            with open(file_path, 'rb') as f:
                raw_data = f.read(10000)  # Read first 10KB
                result = chardet.detect(raw_data)
                return result
        except Exception as e:
            return {'encoding': None, 'confidence': 0, 'error': str(e)}

    def search_file(self, file_path, patterns=None, check_encoding=True):
        """Search a single file for broken unicode"""
        if patterns is None:
            patterns = self.broken_patterns

        file_results = {
            'file': str(file_path),
            'issues': [],
            'encoding_info': None,
            'line_count': 0,
            'errors': []
        }

        # Check encoding
        if check_encoding:
            encoding_info = self.detect_encoding(file_path)
            file_results['encoding_info'] = encoding_info

            # Warn about low confidence encoding detection
            if encoding_info.get('confidence', 0) < 0.7:
                file_results['issues'].append({
                    'type': 'encoding_uncertainty',
                    'message': f"Low confidence encoding detection: {encoding_info.get('encoding')} ({encoding_info.get('confidence', 0):.2f})"
                })

        # Try multiple encodings to read the file
        encodings_to_try = ['utf-8', 'latin1', 'cp1252', 'iso-8859-1']
        if file_results['encoding_info'] and file_results['encoding_info'].get('encoding'):
            detected_encoding = file_results['encoding_info']['encoding']
            if detected_encoding not in encodings_to_try:
                encodings_to_try.insert(0, detected_encoding)

        content = None
        used_encoding = None

        for encoding in encodings_to_try:
            try:
                with open(file_path, 'r', encoding=encoding, errors='replace') as f:
                    content = f.read()
                    used_encoding = encoding
                    break
            except Exception as e:
                file_results['errors'].append(f"Failed to read with {encoding}: {e}")
                continue

        if content is None:
            file_results['errors'].append("Could not read file with any encoding")
            return file_results

        # Search for patterns
        lines = content.split('\n')
        file_results['line_count'] = len(lines)

        for line_num, line in enumerate(lines, 1):
            for pattern in patterns:
                matches = re.finditer(pattern, line)
                for match in matches:
                    file_results['issues'].append({
                        'type': 'broken_unicode',
                        'pattern': pattern,
                        'line': line_num,
                        'column': match.start() + 1,
                        'context': line.strip(),
                        'match': match.group(),
                        'encoding_used': used_encoding
                    })

        return file_results

    def search_directory(self, directory, recursive=True, extensions=None):
        """Search directory for files with broken unicode"""
        if extensions is None:
            extensions = self.default_extensions

        directory = Path(directory)
        if not directory.exists():
            print(f"❌ Directory does not exist: {directory}")
            return

        print(f"🔍 Searching directory: {directory}")
        if recursive:
            print("📁 Recursive search enabled")

        pattern = "**/*" if recursive else "*"
        files_found = 0
        files_checked = 0

        for file_path in directory.glob(pattern):
            if file_path.is_file():
                files_found += 1

                # Check extension
                if extensions and file_path.suffix.lower() not in extensions:
                    continue

                # Skip binary files and common non-text files
                if self.is_likely_binary(file_path):
                    continue

                files_checked += 1
                if files_checked % 50 == 0:
                    print(f"📊 Checked {files_checked} files...")

                result = self.search_file(file_path)
                if result['issues'] or result['errors']:
                    self.results.append(result)

        print(f"📈 Summary: {files_found} files found, {files_checked} checked")

    def is_likely_binary(self, file_path):
        """Check if file is likely binary"""
        binary_extensions = {
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico',
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.zip', '.tar', '.gz', '.bz2', '.7z', '.rar',
            '.exe', '.dll', '.so', '.dylib', '.a', '.o',
            '.mp3', '.mp4', '.avi', '.mov', '.wav', '.flac',
            '.ttf', '.otf', '.woff', '.woff2', '.eot'
        }

        if file_path.suffix.lower() in binary_extensions:
            return True

        # Check for common binary patterns in filename
        name = file_path.name.lower()
        if any(x in name for x in ['binary', 'compiled', '.min.', '.bundle.']):
            return True

        return False

    def fix_file(self, file_path, backup=True):
        """Attempt to fix broken unicode in a file"""
        if backup:
            backup_path = f"{file_path}.unicode_backup_{int(datetime.now().timestamp())}"
            shutil.copy2(file_path, backup_path)
            print(f"📄 Created backup: {backup_path}")

        # Read file with replacement characters
        try:
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ Could not read file: {e}")
            return False

        # Apply fixes
        original_content = content

        # Replace common broken patterns
        fixes = {
            '�': '?',  # Replace with question mark
            '��': '?', # Replace double replacement
            '���': '?', # Replace triple replacement
        }

        for broken, replacement in fixes.items():
            content = content.replace(broken, replacement)

        if content != original_content:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed unicode issues in: {file_path}")
                return True
            except Exception as e:
                print(f"❌ Could not write fixed file: {e}")
                return False
        else:
            print(f"ℹ️  No fixes needed for: {file_path}")
            return True

    def print_results(self, verbose=False):
        """Print search results"""
        if not self.results:
            print("✅ No broken unicode characters found!")
            return

        print(f"\n🚨 Found issues in {len(self.results)} file(s):")
        print("=" * 60)

        total_issues = 0

        for result in self.results:
            file_path = result['file']
            issues = result['issues']
            errors = result['errors']
            encoding_info = result['encoding_info']

            print(f"\n📁 {file_path}")

            if encoding_info and verbose:
                enc = encoding_info.get('encoding', 'unknown')
                conf = encoding_info.get('confidence', 0)
                print(f"   Encoding: {enc} (confidence: {conf:.2f})")

            if errors:
                for error in errors:
                    print(f"   ❌ {error}")

            if issues:
                issue_count = len([i for i in issues if i['type'] == 'broken_unicode'])
                total_issues += issue_count

                for issue in issues:
                    if issue['type'] == 'broken_unicode':
                        line = issue['line']
                        col = issue['column']
                        pattern = issue['pattern']
                        context = issue['context'][:60] + "..." if len(issue['context']) > 60 else issue['context']

                        print(f"   🔸 Line {line}:{col} - Pattern: {repr(pattern)}")
                        if verbose:
                            print(f"      Context: {repr(context)}")
                    elif issue['type'] == 'encoding_uncertainty':
                        print(f"   ⚠️  {issue['message']}")

        print(f"\n📊 Total: {total_issues} broken unicode occurrences in {len(self.results)} files")

def main():
    parser = argparse.ArgumentParser(
        description="Search for broken unicode characters in files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  search_broken_unicode.py myfile.py
  search_broken_unicode.py --recursive src/
  search_broken_unicode.py --pattern "��" --verbose .
  search_broken_unicode.py --fix --backup broken_file.txt
  search_broken_unicode.py --extensions .py,.js,.html src/

Common patterns searched:
  � (replacement character)
  �� (double replacement)
  ��� (triple replacement)
  Unicode escape sequences
        """
    )

    parser.add_argument(
        'path',
        nargs='?',
        default='.',
        help='File or directory to search (default: current directory)'
    )

    parser.add_argument(
        '--recursive', '-r',
        action='store_true',
        help='Search directories recursively'
    )

    parser.add_argument(
        '--pattern', '-p',
        action='append',
        help='Additional pattern to search for (can be used multiple times)'
    )

    parser.add_argument(
        '--extensions', '-e',
        help='Comma-separated list of file extensions to check (e.g., .py,.js,.html)'
    )

    parser.add_argument(
        '--fix',
        action='store_true',
        help='Attempt to fix broken unicode characters'
    )

    parser.add_argument(
        '--backup',
        action='store_true',
        default=True,
        help='Create backup when fixing (default: true)'
    )

    parser.add_argument(
        '--no-backup',
        action='store_true',
        help='Do not create backup when fixing'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Show detailed output including context'
    )

    parser.add_argument(
        '--encoding-check',
        action='store_true',
        default=True,
        help='Check file encodings (default: true)'
    )

    args = parser.parse_args()

    # Handle backup option
    backup = args.backup and not args.no_backup

    # Parse extensions
    extensions = None
    if args.extensions:
        extensions = set(ext.strip() for ext in args.extensions.split(','))
        if not all(ext.startswith('.') for ext in extensions):
            extensions = set('.' + ext.lstrip('.') for ext in extensions)

    # Create searcher
    searcher = BrokenUnicodeSearcher()

    # Add custom patterns
    if args.pattern:
        searcher.broken_patterns.extend(args.pattern)

    path = Path(args.path)

    if path.is_file():
        print(f"🔍 Searching file: {path}")
        result = searcher.search_file(path, check_encoding=args.encoding_check)
        if result['issues'] or result['errors']:
            searcher.results.append(result)

        if args.fix and result['issues']:
            searcher.fix_file(path, backup=backup)

    elif path.is_dir():
        searcher.search_directory(path, recursive=args.recursive, extensions=extensions)

        if args.fix and searcher.results:
            print(f"\n🔧 Fixing {len(searcher.results)} files...")
            for result in searcher.results:
                if result['issues']:
                    searcher.fix_file(result['file'], backup=backup)
    else:
        print(f"❌ Path does not exist: {path}")
        sys.exit(1)

    # Print results
    searcher.print_results(verbose=args.verbose)

if __name__ == "__main__":
    main()
