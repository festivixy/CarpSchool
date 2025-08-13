#!/usr/bin/env python3
"""
iOS App Transport Security (ATS) Configuration Tool
Adds ATS exception domains to iOS Info.plist files for CarpSchool app
"""

import sys
import os
import plistlib
import argparse
from datetime import datetime
import shutil


def print_colored(message, color='white'):
    """Print colored output to terminal"""
    colors = {
        'red': '\033[0;31m',
        'green': '\033[0;32m',
        'yellow': '\033[1;33m',
        'blue': '\033[0;34m',
        'white': '\033[0m'
    }
    end_color = '\033[0m'
    print(f"{colors.get(color, colors['white'])}{message}{end_color}")


def create_backup(plist_path):
    """Create a timestamped backup of the plist file"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{plist_path}.backup.{timestamp}"
    shutil.copy2(plist_path, backup_path)
    print_colored(f"✅ Created backup: {backup_path}", 'green')
    return backup_path


def load_plist(plist_path):
    """Load and parse the Info.plist file"""
    try:
        with open(plist_path, 'rb') as f:
            return plistlib.load(f)
    except Exception as e:
        print_colored(f"❌ Failed to load plist: {e}", 'red')
        return None


def save_plist(plist_data, plist_path):
    """Save the plist data back to file"""
    try:
        with open(plist_path, 'wb') as f:
            plistlib.dump(plist_data, f)
        return True
    except Exception as e:
        print_colored(f"❌ Failed to save plist: {e}", 'red')
        return False


def ensure_ats_structure(plist_data):
    """Ensure NSAppTransportSecurity structure exists"""
    if 'NSAppTransportSecurity' not in plist_data:
        plist_data['NSAppTransportSecurity'] = {}
        print_colored("✅ Created NSAppTransportSecurity structure", 'green')
    
    ats = plist_data['NSAppTransportSecurity']
    
    if 'NSExceptionDomains' not in ats:
        ats['NSExceptionDomains'] = {}
        print_colored("✅ Created NSExceptionDomains structure", 'green')
    
    return ats


def add_carpschool_domains(plist_path):
    """Add CarpSchool-specific ATS domains to Info.plist"""
    print_colored("🚗 Adding CarpSchool-specific ATS domains...", 'yellow')
    
    # Check if plist file exists
    if not os.path.exists(plist_path):
        print_colored(f"❌ Info.plist not found at: {plist_path}", 'red')
        print_colored("💡 Make sure to build the iOS app first", 'yellow')
        return False
    
    # Create backup
    backup_path = create_backup(plist_path)
    
    # Load plist
    plist_data = load_plist(plist_path)
    if plist_data is None:
        return False
    
    # Ensure ATS structure exists
    ats = ensure_ats_structure(plist_data)
    exception_domains = ats['NSExceptionDomains']
    
    # Set NSAllowsArbitraryLoads to false for better security
    ats['NSAllowsArbitraryLoads'] = False
    print_colored("✅ Set NSAllowsArbitraryLoads to false", 'green')
    
    # Domain configurations from plugin.xml
    domain_configs = {
        'carp.school': {
            'NSIncludesSubdomains': True,
            'NSExceptionAllowsInsecureHTTPLoads': True,
            'NSExceptionMinimumTLSVersion': 'TLSv1.0',
            'NSExceptionRequiresForwardSecrecy': False
        },
        'tileserver.carp.school': {
            'NSExceptionMinimumTLSVersion': 'TLSv1.2',
            'NSExceptionRequiresForwardSecrecy': True
        },
        'nominatim.carp.school': {
            'NSExceptionMinimumTLSVersion': 'TLSv1.2',
            'NSExceptionRequiresForwardSecrecy': True
        },
        'osrm.carp.school': {
            'NSExceptionMinimumTLSVersion': 'TLSv1.2',
            'NSExceptionRequiresForwardSecrecy': True
        },
        'codepush.carp.school': {
            'NSExceptionMinimumTLSVersion': 'TLSv1.2',
            'NSExceptionRequiresForwardSecrecy': True
        },
        'localhost': {
            'NSExceptionAllowsInsecureHTTPLoads': True,
            'NSExceptionMinimumTLSVersion': 'TLSv1.0',
            'NSExceptionRequiresForwardSecrecy': False
        },
        '127.0.0.1': {
            'NSExceptionAllowsInsecureHTTPLoads': True,
            'NSExceptionMinimumTLSVersion': 'TLSv1.0',
            'NSExceptionRequiresForwardSecrecy': False
        },
        'dev.carp.school': {
            'NSExceptionAllowsInsecureHTTPLoads': True,
            'NSExceptionMinimumTLSVersion': 'TLSv1.0',
            'NSExceptionRequiresForwardSecrecy': False
        }
    }
    
    # Process each domain
    for domain, config in domain_configs.items():
        print_colored(f"🌐 Configuring domain: {domain}", 'yellow')
        
        # Create domain entry
        exception_domains[domain] = config.copy()
        
        # Show what was configured
        for key, value in config.items():
            if key == 'NSIncludesSubdomains':
                print_colored(f"   ✓ NSIncludesSubdomains: {value}", 'green')
            elif key == 'NSExceptionAllowsInsecureHTTPLoads':
                print_colored(f"   ✓ NSExceptionAllowsInsecureHTTPLoads: {value}", 'green')
            elif key == 'NSExceptionMinimumTLSVersion':
                print_colored(f"   ✓ NSExceptionMinimumTLSVersion: {value}", 'green')
            elif key == 'NSExceptionRequiresForwardSecrecy':
                print_colored(f"   ✓ NSExceptionRequiresForwardSecrecy: {value}", 'green')
        
        print_colored(f"   ✅ Domain {domain} configured successfully", 'green')
    
    # Save the updated plist
    if save_plist(plist_data, plist_path):
        print_colored(f"✅ Info.plist updated successfully with {len(domain_configs)} CarpSchool domain(s)", 'green')
        
        # Show current ATS configuration
        print_colored("📋 Current ATS Exception Domains:", 'yellow')
        for domain in sorted(exception_domains.keys()):
            print_colored(f"  🌐 {domain}", 'blue')
            for key, value in exception_domains[domain].items():
                print_colored(f"    • {key}: {value}", 'white')
        
        # Remove backup since operation was successful
        os.remove(backup_path)
        print_colored("🗑️  Backup removed (operation successful)", 'green')
        return True
    else:
        # Restore backup on failure
        print_colored("❌ Failed to update Info.plist - restoring backup", 'red')
        shutil.copy2(backup_path, plist_path)
        return False


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='iOS App Transport Security (ATS) Configuration Tool',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python ios-ats-config.py ../build/ios/project/CarpSchool/CarpSchool-Info.plist
  python ios-ats-config.py --help
        '''
    )
    
    parser.add_argument(
        'plist_path',
        nargs='?',
        default='../build/ios/project/CarpSchool/CarpSchool-Info.plist',
        help='Path to the Info.plist file (default: ../build/ios/project/CarpSchool/CarpSchool-Info.plist)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose output'
    )
    
    args = parser.parse_args()
    
    # Add CarpSchool domains
    success = add_carpschool_domains(args.plist_path)
    
    if success:
        print_colored("🎉 ATS configuration completed successfully!", 'green')
        sys.exit(0)
    else:
        print_colored("💥 ATS configuration failed!", 'red')
        sys.exit(1)


if __name__ == '__main__':
    main()
