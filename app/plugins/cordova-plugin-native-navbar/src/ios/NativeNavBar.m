#import "NativeNavBar.h"
#import <Cordova/CDVPluginResult.h>

@implementation NativeNavBar

- (void)pluginInitialize {
    NSLog(@"[NativeNavBar] Plugin initializing...");
    self.navBars = [[NSMutableDictionary alloc] init];
    self.actionHandlerCallbackId = nil;
}

- (void)isSupported:(CDVInvokedUrlCommand*)command {
    NSLog(@"[NativeNavBar] Checking native navbar support...");

    // Native navbar is supported on all iOS versions with UITabBar
    BOOL supported = YES;

    NSString *systemVersion = [[UIDevice currentDevice] systemVersion];
    NSLog(@"[NativeNavBar] iOS Version: %@ - Native navbar supported: %@", systemVersion, supported ? @"YES" : @"NO");

    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                          messageAsBool:supported];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)createNavBar:(CDVInvokedUrlCommand*)command {
    NSLog(@"[NativeNavBar] Creating native navbar...");

    NSDictionary *options = [command.arguments objectAtIndex:0];
    NSString *navBarId = [[NSUUID UUID] UUIDString];

    // Create the navbar on main thread
    dispatch_async(dispatch_get_main_queue(), ^{
        UITabBar *tabBar = [[UITabBar alloc] init];

        // Configure standard iOS appearance (no liquid glass)
        if (@available(iOS 15.0, *)) {
            UITabBarAppearance *appearance = [[UITabBarAppearance alloc] init];
            [appearance configureWithDefaultBackground];

            // Use standard system appearance
            NSLog(@"[NativeNavBar] Applying standard iOS appearance");
            // Keep default system styling - no custom background or effects

            tabBar.standardAppearance = appearance;
            tabBar.scrollEdgeAppearance = appearance;
        } else {
            // iOS 14 and below - use default appearance
            NSLog(@"[NativeNavBar] Using iOS 14 default appearance");
            tabBar.barStyle = UIBarStyleDefault;
        }

        // Position at bottom of screen
        CGRect frame = self.webView.superview.bounds;
        tabBar.frame = CGRectMake(0, frame.size.height - 83, frame.size.width, 83);
        tabBar.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin;

        // Add to view hierarchy
        [self.webView.superview addSubview:tabBar];

        // Store reference
        [self.navBars setObject:tabBar forKey:navBarId];

        NSLog(@"[NativeNavBar] Native navbar created with ID: %@", navBarId);

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                              messageAsString:navBarId];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

- (void)setNavBarItems:(CDVInvokedUrlCommand*)command {
    NSString *navBarId = [command.arguments objectAtIndex:0];
    NSArray *items = [command.arguments objectAtIndex:1];

    UITabBar *tabBar = [self.navBars objectForKey:navBarId];
    if (!tabBar) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                              messageAsString:@"NavBar not found"];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        NSMutableArray *tabBarItems = [[NSMutableArray alloc] init];

        for (int i = 0; i < [items count]; i++) {
            NSDictionary *item = [items objectAtIndex:i];
            NSString *title = [item objectForKey:@"label"];
            NSString *icon = [item objectForKey:@"icon"];

            UITabBarItem *tabBarItem = [[UITabBarItem alloc] initWithTitle:title
                                                                     image:nil
                                                                       tag:i];

            // Use SF Symbols for better iOS integration (available iOS 13+)
            if (@available(iOS 13.0, *)) {
                if ([icon isEqualToString:@"🏠"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"house"];
                } else if ([icon isEqualToString:@"🔍"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"magnifyingglass"];
                } else if ([icon isEqualToString:@"⚙️"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"gearshape"];
                } else if ([icon isEqualToString:@"➕"] || [icon isEqualToString:@"+"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"plus"];
                } else if ([icon isEqualToString:@"💬"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"message"];
                } else if ([icon isEqualToString:@"👤"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"person"];
                } else if ([icon isEqualToString:@"🚗"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"car"];
                } else if ([icon isEqualToString:@"📱"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"iphone"];
                } else if ([icon isEqualToString:@"🎒"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"backpack"];
                } else if ([icon isEqualToString:@"📍"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"location"];
                } else if ([icon isEqualToString:@"📋"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"clipboard"];
                } else if ([icon isEqualToString:@"🚪"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"rectangle.portrait.and.arrow.right"];
                } else if ([icon isEqualToString:@"🧪"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"testtube.2"];
                } else if ([icon isEqualToString:@"🚨"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"exclamationmark.triangle"];
                } else if ([icon isEqualToString:@"👥"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"person.2"];
                }
            }
            // For iOS 12 and below, no icon will be shown (just title)

            [tabBarItems addObject:tabBarItem];
        }

        tabBar.items = tabBarItems;

        // Set up target-action for item taps
        [tabBar setDelegate:(id<UITabBarDelegate>)self];

        NSLog(@"[NativeNavBar] Set %lu items for navbar: %@", (unsigned long)[items count], navBarId);

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

- (void)setActiveItem:(CDVInvokedUrlCommand*)command {
    NSString *navBarId = [command.arguments objectAtIndex:0];
    NSNumber *itemIndex = [command.arguments objectAtIndex:1];

    UITabBar *tabBar = [self.navBars objectForKey:navBarId];
    if (!tabBar) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                              messageAsString:@"NavBar not found"];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        if ([itemIndex intValue] < [tabBar.items count]) {
            tabBar.selectedItem = [tabBar.items objectAtIndex:[itemIndex intValue]];
            NSLog(@"[NativeNavBar] Set active item to index: %@", itemIndex);
        }

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

- (void)showNavBar:(CDVInvokedUrlCommand*)command {
    NSString *navBarId = [command.arguments objectAtIndex:0];

    UITabBar *tabBar = [self.navBars objectForKey:navBarId];
    if (!tabBar) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                              messageAsString:@"NavBar not found"];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        tabBar.hidden = NO;
        NSLog(@"[NativeNavBar] Showing navbar: %@", navBarId);

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

- (void)hideNavBar:(CDVInvokedUrlCommand*)command {
    NSString *navBarId = [command.arguments objectAtIndex:0];

    UITabBar *tabBar = [self.navBars objectForKey:navBarId];
    if (!tabBar) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                              messageAsString:@"NavBar not found"];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        tabBar.hidden = YES;
        NSLog(@"[NativeNavBar] Hiding navbar: %@", navBarId);

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

- (void)removeNavBar:(CDVInvokedUrlCommand*)command {
    NSString *navBarId = [command.arguments objectAtIndex:0];

    UITabBar *tabBar = [self.navBars objectForKey:navBarId];
    if (!tabBar) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                              messageAsString:@"NavBar not found"];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [tabBar removeFromSuperview];
        [self.navBars removeObjectForKey:navBarId];
        NSLog(@"[NativeNavBar] Removed navbar: %@", navBarId);

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

- (void)setActionHandler:(CDVInvokedUrlCommand*)command {
    self.actionHandlerCallbackId = command.callbackId;
    NSLog(@"[NativeNavBar] Action handler registered");

    // Keep callback for future use - don't send result yet
}

- (void)getIOSVersion:(CDVInvokedUrlCommand*)command {
    NSString *systemVersion = [[UIDevice currentDevice] systemVersion];
    NSLog(@"[NativeNavBar] iOS Version: %@", systemVersion);

    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                          messageAsString:systemVersion];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

// UITabBarDelegate method
- (void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item {
    NSLog(@"[NativeNavBar] Tab item selected: %ld", (long)item.tag);

    if (self.actionHandlerCallbackId) {
        // Find the navbar ID
        NSString *navBarId = nil;
        for (NSString *key in self.navBars) {
            if ([self.navBars objectForKey:key] == tabBar) {
                navBarId = key;
                break;
            }
        }

        // Call JavaScript action handler
        NSString *jsCallback = [NSString stringWithFormat:
            @"if (window.NativeNavBarActionHandler) { window.NativeNavBarActionHandler('%@', 'tap', %ld); }",
            navBarId, (long)item.tag];

        [self.commandDelegate evalJs:jsCallback];
    }
}

@end
