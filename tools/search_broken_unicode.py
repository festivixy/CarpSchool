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
from charset_normalizer import from_path
from pathlib import Path
import shutil
from datetime import datetime
import subprocess
import json

try:
    from tqdm import tqdm
    TQDM_AVAILABLE = True
except ImportError:
    TQDM_AVAILABLE = False
    # Fallback tqdm for when it's not installed
    class tqdm:
        def __init__(self, iterable=None, desc="", total=None, disable=False):
            self.iterable = iterable
            self.desc = desc
            self.total = total or (len(iterable) if iterable else 0)
            self.n = 0
            if not disable:
                print(f"{desc}: 0/{self.total}")

        def __iter__(self):
            for item in self.iterable:
                yield item
                self.update(1)

        def update(self, n=1):
            self.n += n
            if self.n % max(1, self.total // 10) == 0:
                print(f"{self.desc}: {self.n}/{self.total}")

        def close(self):
            print(f"{self.desc}: {self.n}/{self.total} ✅")

class BrokenUnicodeSearcher:
    """Search for and optionally fix broken unicode characters"""

    def __init__(self):
        # Common broken unicode patterns
        self.broken_patterns = [
            r'�',           # Replacement character
            r'��',          # Double replacement
            r'���',         # Triple replacement
            r'����',        # Quadruple replacement (4-byte chars like emojis)
            r'\ufffd',      # Unicode replacement character
            r'\u00c2\u00a0', # Non-breaking space encoding issue
            r'\u00e2\u0080\u0099', # Smart quote encoding issue
            r'\u00e2\u0080\u009c', # Smart quote encoding issue
            r'\u00e2\u0080\u009d', # Smart quote encoding issue
            # Windows-1254 corruption patterns (potentially reversible)
            r'ğŸ[^\s]{2,}',  # Patterns starting with ğŸ (F0 9F in Windows-1254)
            r'â[^\s]{2,}',   # Patterns starting with â (E2 in Windows-1254)
        ]

        # File extensions to check by default
        self.default_extensions = {
            '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss',
            '.txt', '.md', '.rst'
        }

        self.results = []
        self.git_available = self.check_git_available()
        self.git_cache = {}  # Cache git results to avoid repeated calls

    def check_git_available(self):
        """Check if git is available and we're in a git repository"""
        try:
            result = subprocess.run(['git', 'rev-parse', '--git-dir'],
                                  capture_output=True, text=True, cwd='.')
            return result.returncode == 0
        except Exception:
            return False

    def get_file_git_history(self, file_path, max_commits=10):
        """Get git history for entire file (more efficient than per-line)"""
        if not self.git_available:
            return None

        cache_key = f"{file_path}_{max_commits}"
        if cache_key in self.git_cache:
            return self.git_cache[cache_key]

        try:
            # Use git log -p to get all changes to the file
            cmd = ['git', 'log', '-p', '--follow', f'-{max_commits}', file_path]
            result = subprocess.run(cmd, capture_output=True, text=True, cwd='.')
            if result.returncode != 0:
                return None

            # Parse commits and their changes
            commits = {}
            lines = result.stdout.split('\n')
            current_commit = None
            current_changes = {}

            for line in lines:
                if line.startswith('commit '):
                    if current_commit and current_changes:
                        commits[current_commit] = current_changes
                    current_commit = line.split()[1][:8]  # Short hash
                    current_changes = {}
                elif line.startswith('+') and not line.startswith('+++') and len(line) > 1:
                    # This is an added line
                    added_line = line[1:]  # Remove + prefix
                    # Store by content for easy lookup
                    content_key = added_line.strip()
                    if content_key:
                        current_changes[content_key] = added_line

            # Don't forget the last commit
            if current_commit and current_changes:
                commits[current_commit] = current_changes

            self.git_cache[cache_key] = commits
            return commits

        except Exception:
            return None

    def get_git_suggestion_from_cache(self, file_path, line_content):
        """Get git suggestion from cached file history"""
        file_history = self.get_file_git_history(file_path)
        if not file_history:
            return None

        line_stripped = line_content.strip()

        # Look through commits for a similar line without broken unicode
        for commit_hash, changes in file_history.items():
            for original_content in changes.values():
                original_stripped = original_content.strip()

                # Skip if it has broken unicode too
                if '�' in original_stripped or any(pattern in original_stripped for pattern in ['ğŸ', 'â']):
                    continue

                # Check if this could be the original version
                # Simple heuristic: similar length and structure
                if (abs(len(original_stripped) - len(line_stripped)) < 10 and
                    any(word in original_stripped for word in line_stripped.split() if len(word) > 3)):

                    return {
                        'suggestion': original_stripped,
                        'commit': commit_hash,
                        'historical_line': original_content
                    }

        return None

    def suggest_original_character(self, file_path, line_number, current_line):
        """Suggest original character based on git history (now uses cached approach)"""
        if not self.git_available:
            return None

        # Use the faster cached git history approach
        suggestion = self.get_git_suggestion_from_cache(file_path, current_line)
        if suggestion:
            # Extract specific unicode suggestions from the full line
            unicode_suggestion = self.extract_unicode_suggestion(current_line, suggestion['historical_line'])
            if unicode_suggestion:
                suggestion['suggestion'] = unicode_suggestion
            return suggestion

        return None

    def extract_unicode_suggestion(self, broken_line, good_line):
        """Extract unicode character suggestions by comparing lines"""
        # Simple approach: find positions where broken_line has � and good_line has unicode
        suggestions = {}

        # Convert both lines to lists for character-by-character comparison
        broken_chars = list(broken_line)
        good_chars = list(good_line)

        # Try to align and find replacements
        min_len = min(len(broken_chars), len(good_chars))

        for i in range(min_len):
            if broken_chars[i] == '��' and good_chars[i] != '�':
                # Found a potential replacement
                suggestions[i] = good_chars[i]

        # Also check for common patterns
        broken_patterns = ['�', '��', '�����']
        for pattern in broken_patterns:
            if pattern in broken_line and pattern not in good_line:
                # Try to find what this pattern corresponds to in good_line
                broken_pos = broken_line.find(pattern)
                if broken_pos >= 0 and broken_pos < len(good_line):
                    # Look for unicode characters around this position in good_line
                    for j in range(max(0, broken_pos-2), min(len(good_line), broken_pos+3)):
                        char = good_line[j]
                        if ord(char) > 127:  # Non-ASCII character (likely emoji/unicode)
                            suggestions[pattern] = char
                            break

        return suggestions if suggestions else None

    def try_encoding_reversal(self, corrupted_text, encoding='windows-1254'):
        """Try to reverse encoding corruption by re-encoding and decoding"""
        try:
            # Check if the corrupted text contains replacement characters
            if '�' in corrupted_text:
                return None  # Cannot reverse if data was lost

            # Encode the corrupted text back to bytes using the suspected wrong encoding
            wrong_encoding_bytes = corrupted_text.encode(encoding, errors='strict')

            # Decode as UTF-8 to get the original
            restored = wrong_encoding_bytes.decode('utf-8', errors='strict')

            # Verify this looks like a valid restoration (contains emoji/unicode)
            if any(ord(c) > 127 for c in restored):
                return {
                    'restored': restored,
                    'method': f'encoding_reversal_{encoding}',
                    'confidence': 'high' if len(restored) < len(corrupted_text) else 'medium'
                }

            return None

        except Exception:
            return None

    def detect_encoding(self, file_path):
        """Detect file encoding using charset-normalizer with chardet fallback"""
        try:
            # Try charset-normalizer first (more accurate, especially for UTF-8 vs Windows-1252)
            try:
                results = from_path(file_path)
                if results.best():
                    best_match = results.best()
                    return {
                        'encoding': best_match.encoding,
                        'confidence': 1.0 - best_match.chaos,  # Convert chaos to confidence (lower chaos = higher confidence)
                        'language': getattr(best_match, 'language', ''),
                        'method': 'charset-normalizer'
                    }
            except Exception:
                pass  # Fall back to chardet

            # Fallback to chardet if charset-normalizer fails
            with open(file_path, 'rb') as f:
                raw_data = f.read(10000)  # Read first 10KB
                result = chardet.detect(raw_data)

                # For code files, prefer UTF-8 if chardet confidence is low
                if result and result.get('confidence', 0) < 0.93:
                    file_ext = str(file_path).lower().split('.')[-1] if '.' in str(file_path) else ''
                    code_extensions = {'py', 'js', 'jsx', 'ts', 'tsx', 'md', 'json', 'css', 'scss', 'html', 'xml', 'yml', 'yaml'}

                    if file_ext in code_extensions:
                        # Try UTF-8 first for code files
                        try:
                            with open(file_path, 'r', encoding='utf-8') as test_f:
                                test_f.read()  # If this succeeds, UTF-8 is valid
                            return {'encoding': 'utf-8', 'confidence': 0.95, 'language': '', 'chardet_result': result, 'method': 'utf-8-fallback'}
                        except UnicodeDecodeError:
                            pass  # Fall back to chardet result

                if result:
                    result['method'] = 'chardet'
                return result
        except Exception as e:
            return {'encoding': None, 'confidence': 0, 'error': str(e), 'method': 'error'}

    def search_file(self, file_path, patterns=None, check_encoding=True, enable_git_history=True):
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
            # Collect all matches first to deduplicate overlapping patterns
            all_matches = []
            for pattern in patterns:
                matches = re.finditer(pattern, line)
                for match in matches:
                    all_matches.append({
                        'pattern': pattern,
                        'start': match.start(),
                        'end': match.end(),
                        'match': match.group(),
                        'line_num': line_num,
                        'line_content': line
                    })

            # Sort by start position, then by length (longest first) to prioritize longer matches
            all_matches.sort(key=lambda x: (x['start'], -(x['end'] - x['start'])))

            # Deduplicate overlapping matches, keeping only the longest match at each position
            deduplicated_matches = []
            used_positions = set()

            for match_info in all_matches:
                start, end = match_info['start'], match_info['end']
                # Check if this match overlaps with any already used position
                if not any(pos in used_positions for pos in range(start, end)):
                    deduplicated_matches.append(match_info)
                    used_positions.update(range(start, end))

            # Convert deduplicated matches to issues
            for match_info in deduplicated_matches:
                issue = {
                    'type': 'broken_unicode',
                    'pattern': match_info['pattern'],
                    'line': match_info['line_num'],
                    'column': match_info['start'] + 1,
                    'context': match_info['line_content'].strip(),
                    'match': match_info['match'],
                    'encoding_used': used_encoding
                }

                # Try encoding reversal first (faster)
                # Disabled: Windows-1254 reversal causes false positives on normal unicode text
                # reversal = self.try_encoding_reversal(match.group())
                # if reversal:
                #     issue['encoding_reversal'] = reversal

                # Try git history suggestion when enabled
                if enable_git_history and self.git_available:
                    suggestion = self.suggest_original_character(file_path, match_info['line_num'], match_info['line_content'])
                    if suggestion:
                        issue['git_suggestion'] = suggestion

                file_results['issues'].append(issue)

        return file_results

    def search_directory(self, directory, recursive=True, extensions=None, enable_git_history=True):
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

        # First pass: collect all files to check
        files_to_check = []
        files_found = 0

        for file_path in directory.glob(pattern):
            if file_path.is_file():
                files_found += 1

                # Skip files in excluded directories
                excluded_dirs = {'node_modules', 'build', '.meteor', 'archive'}
                if any(excluded_dir in file_path.parts for excluded_dir in excluded_dirs):
                    continue

                # Check extension
                if extensions and file_path.suffix.lower() not in extensions:
                    continue

                # Skip binary files and common non-text files
                if self.is_likely_binary(file_path):
                    continue

                files_to_check.append(file_path)

        print(f"📊 Found {files_found} files, will check {len(files_to_check)}")

        # Second pass: check files with progress bar
        if files_to_check:
            with tqdm(files_to_check, desc="🔍 Scanning files", disable=len(files_to_check) < 5) as pbar:
                for file_path in pbar:
                    pbar.set_postfix_str(str(file_path.name))
                    result = self.search_file(file_path, enable_git_history=enable_git_history)
                    if result['issues'] or result['errors']:
                        self.results.append(result)

        print(f"✅ Scanned {len(files_to_check)} files, found issues in {len(self.results)}")

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

    def fix_file(self, file_path, backup=True, use_git_suggestions=True):
        """Attempt to fix broken unicode in a file using git history when possible"""
        if backup:
            backup_path = f"{file_path}.unicode_backup_{int(datetime.now().timestamp())}"
            shutil.copy2(file_path, backup_path)
            print(f"📄 Created backup: {backup_path}")

        # First, analyze the file to get git suggestions
        file_results = self.search_file(file_path)

        # Use the same encoding that was used during search
        used_encoding = 'utf-8'
        for issue in file_results['issues']:
            if issue.get('encoding_used'):
                used_encoding = issue['encoding_used']
                break

        # Read file with replacement characters using the same encoding as search
        try:
            with open(file_path, 'r', encoding=used_encoding, errors='replace') as f:
                lines = f.readlines()
        except Exception as e:
            print(f"❌ Could not read file: {e}")
            return False

        original_lines = lines.copy()
        changes_made = False

        # Apply git-based fixes first if available
        if use_git_suggestions and self.git_available:
            for issue in file_results['issues']:
                if issue['type'] == 'broken_unicode' and 'git_suggestion' in issue:
                    line_num = issue['line'] - 1  # Convert to 0-based index
                    if line_num < len(lines):
                        suggestion = issue['git_suggestion']
                        old_line = lines[line_num]

                        # Apply the git suggestions
                        broken_pattern = issue['match']  # The actual broken pattern that was found

                        if isinstance(suggestion['suggestion'], dict) and suggestion['suggestion']:
                            # Get the first suggested replacement character
                            replacement_char = list(suggestion['suggestion'].values())[0]

                            # For �� characters, replace directly
                            if broken_pattern == '�' and '�' in old_line:
                                new_line = old_line.replace('�', replacement_char, 1)
                                if new_line != old_line:
                                    lines[line_num] = new_line
                                    changes_made = True
                                    print(f"   ✨ Applied git suggestion on line {issue['line']}: � → {replacement_char}")

                            # For other patterns, try to replace the pattern directly
                            elif broken_pattern in old_line and isinstance(replacement_char, str):
                                new_line = old_line.replace(broken_pattern, replacement_char, 1)
                                if new_line != old_line:
                                    lines[line_num] = new_line
                                    changes_made = True
                                    print(f"   ✨ Applied git suggestion on line {issue['line']}: {broken_pattern} → {replacement_char}")

        # Apply encoding reversal fixes
        # Disabled: Windows-1254 reversal causes false positives on normal unicode text
        # if use_git_suggestions:  # Use same flag for encoding reversals
        #     for issue in file_results['issues']:
        #         if issue['type'] == 'broken_unicode' and 'encoding_reversal' in issue:
        #             line_num = issue['line'] - 1
        #             if line_num < len(lines):
        #                 reversal = issue['encoding_reversal']
        #                 old_line = lines[line_num]
        #                 pattern = issue['pattern']
        #
        #                 # Only replace the specific pattern, not the entire line
        #                 new_line = old_line.replace(pattern, reversal['restored'])
        #
        #                 if new_line != old_line:
        #                     lines[line_num] = new_line
        #                     changes_made = True
        #                     print(f"   🔄 Applied encoding reversal on line {issue['line']}: {pattern} → {reversal['restored']}")

        # Apply fallback fixes for any remaining issues
        fallback_fixes = {
            '�': '',  # Remove lone replacement characters
            '��': '',  # Remove double replacement
            '���': '', # Remove triple replacement
        }

        for i, line in enumerate(lines):
            original_line = line
            for broken, replacement in fallback_fixes.items():
                line = line.replace(broken, replacement)
            if line != original_line:
                lines[i] = line
                changes_made = True

        if changes_made:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
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
            print("��� No broken unicode characters found!")
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

                        # Show git history suggestion if available
                        if 'git_suggestion' in issue:
                            suggestion = issue['git_suggestion']
                            print(f"      💡 Git suggests: {suggestion['suggestion']} (from commit {suggestion['commit']})")
                            if verbose:
                                print(f"      📝 Original line: {repr(suggestion['historical_line'][:60])}")

                        # Show encoding reversal suggestion if available
                        if 'encoding_reversal' in issue:
                            reversal = issue['encoding_reversal']
                            print(f"      🔄 Encoding reversal: {repr(reversal['restored'])} (method: {reversal['method']}, confidence: {reversal['confidence']})")

                    elif issue['type'] == 'encoding_uncertainty':
                        print(f"   ⚠️  {issue['message']}")

        # Calculate auto-fix statistics
        total_fixable = 0
        for result in self.results:
            for issue in result['issues']:
                if issue['type'] == 'broken_unicode':
                    # Count issues that have git suggestions or encoding reversals
                    if 'git_suggestion' in issue or 'encoding_reversal' in issue:
                        total_fixable += 1

        fix_percentage = (total_fixable / total_issues * 100) if total_issues > 0 else 0

        print(f"\n📊 Total: {total_issues} broken unicode occurrences in {len(self.results)} files")
        print(f"🔧 Auto-fixable: {total_fixable} issues ({fix_percentage:.1f}%)")

        if total_fixable > 0:
            print(f"💡 Run with --fix to automatically repair {total_fixable} issues")

def main():
    parser = argparse.ArgumentParser(
        description="Search for broken unicode characters in files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  search_broken_unicode.py myfile.py
  search_broken_unicode.py --recursive src/
  search_broken_unicode.py --fast --recursive .  # Fast mode, no git
  search_broken_unicode.py --pattern "��" --verbose .
  search_broken_unicode.py --fix broken_file.txt
  search_broken_unicode.py --fix --backup broken_file.txt  # Create backup
  search_broken_unicode.py --extensions .py,.js,.html src/

Performance options:
  --fast          Skip git history (fastest)
  --no-git        Disable git suggestions only
  (default)       Full analysis with git + encoding reversal

Common patterns searched:
  � (replacement character)
  �� (double replacement)
  ��� (triple replacement)
  ğŸ* (Windows-1254 corruption)
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
        default=False,
        help='Create backup when fixing'
    )

    parser.add_argument(
        '--no-backup',
        action='store_true',
        help='Do not create backup when fixing (default: no backup)'
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

    parser.add_argument(
        '--fast',
        action='store_true',
        help='Fast mode: skip git history lookups for speed'
    )

    parser.add_argument(
        '--no-git',
        action='store_true',
        help='Disable git history suggestions (faster)'
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

    # Disable git if requested
    if args.no_git or args.fast:
        searcher.git_available = False
        if args.fast:
            print("��� Fast mode: skipping git history lookups")

    # Add custom patterns
    if args.pattern:
        searcher.broken_patterns.extend(args.pattern)

    path = Path(args.path)
    enable_git = searcher.git_available and not args.fast and not args.no_git

    if path.is_file():
        print(f"🔍 Searching file: {path}")
        result = searcher.search_file(path, check_encoding=args.encoding_check, enable_git_history=enable_git)
        if result['issues'] or result['errors']:
            searcher.results.append(result)

        if args.fix and result['issues']:
            searcher.fix_file(path, backup=backup)

    elif path.is_dir():
        searcher.search_directory(path, recursive=args.recursive, extensions=extensions, enable_git_history=enable_git)

        if args.fix and searcher.results:
            print(f"\n���� Fixing {len(searcher.results)} files...")
            with tqdm(searcher.results, desc="🔧 Fixing files", disable=len(searcher.results) < 3) as pbar:
                for result in pbar:
                    if result['issues']:
                        pbar.set_postfix_str(Path(result['file']).name)
                        searcher.fix_file(result['file'], backup=backup)
    else:
        print(f"❌ Path does not exist: {path}")
        sys.exit(1)

    # Print results
    searcher.print_results(verbose=args.verbose)

if __name__ == "__main__":
    main()
