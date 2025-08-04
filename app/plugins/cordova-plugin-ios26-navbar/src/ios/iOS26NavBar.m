#import "iOS26NavBar.h"
#import <Cordova/CDVPluginResult.h>

@implementation iOS26NavBar

- (void)pluginInitialize {
    NSLog(@"[iOS26NavBar] Plugin initializing...");
    self.navBars = [[NSMutableDictionary alloc] init];
    self.actionHandlerCallbackId = nil;
}

- (void)isSupported:(CDVInvokedUrlCommand*)command {
    NSLog(@"[iOS26NavBar] Checking iOS 26 support...");
    
    // Check iOS version
    NSString *systemVersion = [[UIDevice currentDevice] systemVersion];
    float version = [systemVersion floatValue];
    
    NSLog(@"[iOS26NavBar] iOS Version: %@", systemVersion);
    
    // iOS 26+ supports native liquid glass
    BOOL supported = version >= 26.0;
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK 
                                                          messageAsBool:supported];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)createNavBar:(CDVInvokedUrlCommand*)command {
    NSLog(@"[iOS26NavBar] Creating native navbar...");
    
    NSDictionary *options = [command.arguments objectAtIndex:0];
    NSString *navBarId = [[NSUUID UUID] UUIDString];
    
    // Create the navbar on main thread
    dispatch_async(dispatch_get_main_queue(), ^{
        UITabBar *tabBar = [[UITabBar alloc] init];
        
        // Configure iOS 26 liquid glass appearance
        if (@available(iOS 15.0, *)) {
            UITabBarAppearance *appearance = [[UITabBarAppearance alloc] init];
            [appearance configureWithDefaultBackground];
            
            // iOS 26 liquid glass styling
            if (@available(iOS 26.0, *)) {
                NSLog(@"[iOS26NavBar] Applying iOS 26 liquid glass style");
                // Use system materials for liquid glass effect
                appearance.backgroundColor = [UIColor clearColor];
                appearance.backgroundEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemMaterial];
            } else {
                NSLog(@"[iOS26NavBar] Applying iOS 15+ translucent style");
                appearance.backgroundColor = [[UIColor systemBackgroundColor] colorWithAlphaComponent:0.8];
                appearance.backgroundEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemMaterial];
            }
            
            tabBar.standardAppearance = appearance;
            if (@available(iOS 15.0, *)) {
                tabBar.scrollEdgeAppearance = appearance;
            }
        }
        
        // Position at bottom of screen
        CGRect frame = self.webView.superview.bounds;
        tabBar.frame = CGRectMake(0, frame.size.height - 83, frame.size.width, 83);
        tabBar.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin;
        
        // Add to view hierarchy
        [self.webView.superview addSubview:tabBar];
        
        // Store reference
        [self.navBars setObject:tabBar forKey:navBarId];
        
        NSLog(@"[iOS26NavBar] Native navbar created with ID: %@", navBarId);
        
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
            
            // Configure for iOS 26 if available
            if (@available(iOS 26.0, *)) {
                // Use SF Symbols for better iOS 26 integration
                if ([icon isEqualToString:@"🏠"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"house"];
                } else if ([icon isEqualToString:@"🔍"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"magnifyingglass"];
                } else if ([icon isEqualToString:@"⚙️"]) {
                    tabBarItem.image = [UIImage systemImageNamed:@"gearshape"];
                }
            }
            
            [tabBarItems addObject:tabBarItem];
        }
        
        tabBar.items = tabBarItems;
        
        // Set up target-action for item taps
        [tabBar setDelegate:(id<UITabBarDelegate>)self];
        
        NSLog(@"[iOS26NavBar] Set %lu items for navbar: %@", (unsigned long)[items count], navBarId);
        
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
            NSLog(@"[iOS26NavBar] Set active item to index: %@", itemIndex);
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
        NSLog(@"[iOS26NavBar] Showing navbar: %@", navBarId);
        
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
        NSLog(@"[iOS26NavBar] Hiding navbar: %@", navBarId);
        
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
        NSLog(@"[iOS26NavBar] Removed navbar: %@", navBarId);
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

- (void)setActionHandler:(CDVInvokedUrlCommand*)command {
    self.actionHandlerCallbackId = command.callbackId;
    NSLog(@"[iOS26NavBar] Action handler registered");
    
    // Keep callback for future use - don't send result yet
}

- (void)getIOSVersion:(CDVInvokedUrlCommand*)command {
    NSString *systemVersion = [[UIDevice currentDevice] systemVersion];
    NSLog(@"[iOS26NavBar] iOS Version: %@", systemVersion);
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK 
                                                          messageAsString:systemVersion];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

// UITabBarDelegate method
- (void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item {
    NSLog(@"[iOS26NavBar] Tab item selected: %ld", (long)item.tag);
    
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
            @"if (window.iOS26NavBarActionHandler) { window.iOS26NavBarActionHandler('%@', 'tap', %ld); }",
            navBarId, (long)item.tag];
        
        [self.commandDelegate evalJs:jsCallback];
    }
}

@end
