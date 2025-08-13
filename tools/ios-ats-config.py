#!/usr/bin/env python3
"""
Generic iOS App Transport Security (ATS) Domain Configuration Tool
Adds individual ATS exception domains to iOS Info.plist files
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


def add_domain(plist_path, domain, subdomains=False, tls_version=None, 
               forward_secrecy=None, insecure=False, verbose=False):
    """Add a single ATS domain exception to Info.plist"""
    
    # Check if plist file exists
    if not os.path.exists(plist_path):
        print_colored(f"❌ Info.plist not found at: {plist_path}", 'red')
        return False
    
    # Load plist
    plist_data = load_plist(plist_path)
    if plist_data is None:
        return False
    
    # Ensure ATS structure exists
    ats = ensure_ats_structure(plist_data)
    exception_domains = ats['NSExceptionDomains']
    
    # Set NSAllowsArbitraryLoads to false for better security
    if 'NSAllowsArbitraryLoads' not in ats:
        ats['NSAllowsArbitraryLoads'] = False
        if verbose:
            print_colored("✅ Set NSAllowsArbitraryLoads to false", 'green')
    
    print_colored(f"🌐 Configuring domain: {domain}", 'yellow')
    
    # Create domain configuration
    domain_config = {}
    
    if subdomains:
        domain_config['NSIncludesSubdomains'] = True
        print_colored(f"   ✓ NSIncludesSubdomains: True", 'green')
    
    if insecure:
        domain_config['NSExceptionAllowsInsecureHTTPLoads'] = True
        print_colored(f"   ✓ NSExceptionAllowsInsecureHTTPLoads: True", 'green')
    
    if tls_version:
        domain_config['NSExceptionMinimumTLSVersion'] = f"TLSv{tls_version}"
        print_colored(f"   ✓ NSExceptionMinimumTLSVersion: TLSv{tls_version}", 'green')
    
    if forward_secrecy is not None:
        domain_config['NSExceptionRequiresForwardSecrecy'] = forward_secrecy
        print_colored(f"   ✓ NSExceptionRequiresForwardSecrecy: {forward_secrecy}", 'green')
    
    # Add domain to exception domains
    exception_domains[domain] = domain_config
    
    # Save the updated plist
    if save_plist(plist_data, plist_path):
        print_colored(f"   ✅ Domain {domain} configured successfully", 'green')
        return True
    else:
        print_colored(f"   ❌ Failed to configure domain {domain}", 'red')
        return False


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='Generic iOS App Transport Security (ATS) Domain Configuration Tool',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Add basic domain
  python ios-ats-config.py /path/to/Info.plist example.com
  
  # Add domain with subdomains and insecure HTTP
  python ios-ats-config.py /path/to/Info.plist api.example.com --subdomains --insecure
  
  # Add domain with specific TLS version and forward secrecy
  python ios-ats-config.py /path/to/Info.plist secure.example.com --tls-version 1.2 --forward-secrecy
        '''
    )
    
    parser.add_argument(
        'plist_path',
        help='Path to the Info.plist file'
    )
    
    parser.add_argument(
        'domain',
        help='Domain name to add as ATS exception'
    )
    
    parser.add_argument(
        '--subdomains',
        action='store_true',
        help='Include subdomains (NSIncludesSubdomains)'
    )
    
    parser.add_argument(
        '--tls-version',
        choices=['1.0', '1.1', '1.2', '1.3'],
        help='Minimum TLS version (NSExceptionMinimumTLSVersion)'
    )
    
    parser.add_argument(
        '--forward-secrecy',
        action='store_true',
        help='Require forward secrecy (NSExceptionRequiresForwardSecrecy=true)'
    )
    
    parser.add_argument(
        '--no-forward-secrecy',
        action='store_true',
        help='Disable forward secrecy (NSExceptionRequiresForwardSecrecy=false)'
    )
    
    parser.add_argument(
        '--insecure',
        action='store_true',
        help='Allow insecure HTTP loads (NSExceptionAllowsInsecureHTTPLoads)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose output'
    )
    
    args = parser.parse_args()
    
    # Handle forward secrecy logic
    forward_secrecy = None
    if args.forward_secrecy:
        forward_secrecy = True
    elif args.no_forward_secrecy:
        forward_secrecy = False
    
    # Add domain
    success = add_domain(
        args.plist_path,
        args.domain,
        subdomains=args.subdomains,
        tls_version=args.tls_version,
        forward_secrecy=forward_secrecy,
        insecure=args.insecure,
        verbose=args.verbose
    )
    
    if success:
        if args.verbose:
            print_colored("🎉 Domain configuration completed successfully!", 'green')
        sys.exit(0)
    else:
        print_colored("💥 Domain configuration failed!", 'red')
        sys.exit(1)


if __name__ == '__main__':
    main()
