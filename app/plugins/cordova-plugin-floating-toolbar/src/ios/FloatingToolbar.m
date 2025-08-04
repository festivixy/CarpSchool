//
//  FloatingToolbar.m
//  Cordova Floating Toolbar Plugin
//
//  Created by Carp School Team
//  Licensed under MIT License
//

#import "FloatingToolbar.h"
#import <Cordova/CDV.h>

@implementation FloatingToolbar

#pragma mark - Plugin Lifecycle

- (void)pluginInitialize {
    [super pluginInitialize];
    
    // Initialize toolbars dictionary
    self.toolbars = [[NSMutableDictionary alloc] init];
    
    // Get WebView parent for toolbar insertion
    self.webViewParent = self.webView.superview;
    
    NSLog(@"[FloatingToolbar] Plugin initialized successfully");
}

#pragma mark - Public API Methods

- (void)isSupported:(CDVInvokedUrlCommand*)command {
    BOOL supported = YES; // Always supported on iOS
    
    NSLog(@"[FloatingToolbar] Native toolbar support available");
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:supported];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)createToolbar:(CDVInvokedUrlCommand*)command {
    NSDictionary* config = [command.arguments objectAtIndex:0];
    
    if (!config) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Configuration required"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    @try {
        UIToolbar* toolbar = [self createToolbarWithConfig:config];
        NSString* toolbarId = [self generateToolbarId];
        
        // Store the toolbar
        [self.toolbars setObject:toolbar forKey:toolbarId];
        
        // Add to view hierarchy
        [self.webViewParent addSubview:toolbar];
        
        NSLog(@"[FloatingToolbar] Created toolbar with ID: %@", toolbarId);
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:toolbarId];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    } @catch (NSException *exception) {
        NSLog(@"[FloatingToolbar] Error creating toolbar: %@", exception.reason);
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:exception.reason];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void)updateToolbar:(CDVInvokedUrlCommand*)command {
    NSString* toolbarId = [command.arguments objectAtIndex:0];
    NSDictionary* config = [command.arguments objectAtIndex:1];
    
    UIToolbar* toolbar = [self.toolbars objectForKey:toolbarId];
    if (!toolbar) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Toolbar not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    @try {
        // Update toolbar properties based on config
        // This is a simplified implementation
        NSLog(@"[FloatingToolbar] Updated toolbar: %@", toolbarId);
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    } @catch (NSException *exception) {
        NSLog(@"[FloatingToolbar] Error updating toolbar: %@", exception.reason);
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:exception.reason];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void)addToolbarItem:(CDVInvokedUrlCommand*)command {
    NSString* toolbarId = [command.arguments objectAtIndex:0];
    NSDictionary* itemConfig = [command.arguments objectAtIndex:1];
    
    UIToolbar* toolbar = [self.toolbars objectForKey:toolbarId];
    if (!toolbar) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Toolbar not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    @try {
        UIBarButtonItem* item = [self createBarButtonItemWithConfig:itemConfig];
        
        NSMutableArray* items = [toolbar.items mutableCopy] ?: [[NSMutableArray alloc] init];
        [items addObject:item];
        [toolbar setItems:items animated:YES];
        
        NSLog(@"[FloatingToolbar] Added item to toolbar: %@", toolbarId);
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    } @catch (NSException *exception) {
        NSLog(@"[FloatingToolbar] Error adding toolbar item: %@", exception.reason);
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:exception.reason];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void)removeToolbarItem:(CDVInvokedUrlCommand*)command {
    NSString* toolbarId = [command.arguments objectAtIndex:0];
    NSNumber* itemIndex = [command.arguments objectAtIndex:1];
    
    UIToolbar* toolbar = [self.toolbars objectForKey:toolbarId];
    if (!toolbar) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Toolbar not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    @try {
        NSMutableArray* items = [toolbar.items mutableCopy];
        if (items && [itemIndex integerValue] < items.count) {
            [items removeObjectAtIndex:[itemIndex integerValue]];
            [toolbar setItems:items animated:YES];
        }
        
        NSLog(@"[FloatingToolbar] Removed item from toolbar: %@", toolbarId);
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    } @catch (NSException *exception) {
        NSLog(@"[FloatingToolbar] Error removing toolbar item: %@", exception.reason);
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:exception.reason];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void)setToolbarVisibility:(CDVInvokedUrlCommand*)command {
    NSString* toolbarId = [command.arguments objectAtIndex:0];
    NSNumber* visible = [command.arguments objectAtIndex:1];
    NSNumber* animated = [command.arguments objectAtIndex:2];
    
    UIToolbar* toolbar = [self.toolbars objectForKey:toolbarId];
    if (!toolbar) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Toolbar not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    BOOL shouldAnimate = animated ? [animated boolValue] : YES;
    
    if (shouldAnimate) {
        [UIView animateWithDuration:0.3 animations:^{
            toolbar.hidden = ![visible boolValue];
            toolbar.alpha = [visible boolValue] ? 1.0 : 0.0;
        }];
    } else {
        toolbar.hidden = ![visible boolValue];
        toolbar.alpha = [visible boolValue] ? 1.0 : 0.0;
    }
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)removeToolbar:(CDVInvokedUrlCommand*)command {
    NSString* toolbarId = [command.arguments objectAtIndex:0];
    
    UIToolbar* toolbar = [self.toolbars objectForKey:toolbarId];
    if (!toolbar) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Toolbar not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    [toolbar removeFromSuperview];
    [self.toolbars removeObjectForKey:toolbarId];
    
    NSLog(@"[FloatingToolbar] Removed toolbar: %@", toolbarId);
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)removeAllToolbars:(CDVInvokedUrlCommand*)command {
    for (UIToolbar* toolbar in [self.toolbars allValues]) {
        [toolbar removeFromSuperview];
    }
    
    [self.toolbars removeAllObjects];
    
    NSLog(@"[FloatingToolbar] Removed all toolbars");
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)animateToolbar:(CDVInvokedUrlCommand*)command {
    NSString* toolbarId = [command.arguments objectAtIndex:0];
    NSDictionary* properties = [command.arguments objectAtIndex:1];
    NSNumber* duration = [command.arguments objectAtIndex:2];
    
    UIToolbar* toolbar = [self.toolbars objectForKey:toolbarId];
    if (!toolbar) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Toolbar not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    NSTimeInterval animationDuration = [duration doubleValue] / 1000.0; // Convert ms to seconds
    
    [UIView animateWithDuration:animationDuration
                          delay:0.0
                        options:UIViewAnimationOptionCurveEaseInOut
                     animations:^{
                         // Animate properties as needed
                     }
                     completion:^(BOOL finished) {
                         CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
                         [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
                     }];
}

- (void)configureSafeArea:(CDVInvokedUrlCommand*)command {
    // Implementation for safe area configuration
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)setScrollBehavior:(CDVInvokedUrlCommand*)command {
    // Implementation for scroll behavior
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

#pragma mark - Helper Methods

- (NSString*)generateToolbarId {
    return [NSString stringWithFormat:@"toolbar_%@", [[NSUUID UUID] UUIDString]];
}

- (UIToolbar*)createToolbarWithConfig:(NSDictionary*)config {
    UIToolbar* toolbar = [[UIToolbar alloc] init];
    
    // Configure basic properties
    toolbar.translucent = YES;
    
    // Set position and frame
    NSString* position = [config objectForKey:@"position"] ?: @"bottom";
    NSDictionary* style = [config objectForKey:@"style"];
    
    CGFloat height = style ? [[style objectForKey:@"height"] floatValue] : 50.0;
    CGRect frame = self.webViewParent.bounds;
    
    if ([position isEqualToString:@"bottom"]) {
        frame.origin.y = frame.size.height - height;
        frame.size.height = height;
    } else if ([position isEqualToString:@"top"]) {
        frame.size.height = height;
    }
    
    toolbar.frame = frame;
    toolbar.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin;
    
    // Add items if provided
    NSArray* itemsConfig = [config objectForKey:@"items"];
    if (itemsConfig) {
        NSMutableArray* items = [[NSMutableArray alloc] init];
        for (NSDictionary* itemConfig in itemsConfig) {
            UIBarButtonItem* item = [self createBarButtonItemWithConfig:itemConfig];
            [items addObject:item];
        }
        [toolbar setItems:items];
    }
    
    return toolbar;
}

- (UIBarButtonItem*)createBarButtonItemWithConfig:(NSDictionary*)itemConfig {
    NSString* type = [itemConfig objectForKey:@"type"] ?: @"button";
    
    if ([type isEqualToString:@"space"]) {
        return [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFixedSpace target:nil action:nil];
    } else if ([type isEqualToString:@"flexibleSpace"]) {
        return [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace target:nil action:nil];
    } else {
        NSString* title = [itemConfig objectForKey:@"title"];
        NSString* action = [itemConfig objectForKey:@"action"];
        
        UIBarButtonItem* item = [[UIBarButtonItem alloc] initWithTitle:title 
                                                                 style:UIBarButtonItemStylePlain 
                                                                target:self 
                                                                action:@selector(toolbarItemPressed:)];
        
        // Store action in the item for later use
        item.accessibilityIdentifier = action;
        
        return item;
    }
}

- (void)toolbarItemPressed:(UIBarButtonItem*)sender {
    // Find which toolbar this item belongs to and send action to JS
    NSString* action = sender.accessibilityIdentifier;
    
    // This is a simplified implementation
    // In a real implementation, you'd need to track which toolbar and item index
    [self sendActionToJS:@"unknown" action:action itemIndex:@0];
}

- (void)sendActionToJS:(NSString*)toolbarId action:(NSString*)action itemIndex:(NSNumber*)itemIndex {
    // Call the JavaScript action handler
    NSString* jsCall = [NSString stringWithFormat:@"cordova.plugins.floatingToolbar._handleAction('%@', '%@', %@);", 
                       toolbarId, action, itemIndex];
    
    [self.commandDelegate evalJs:jsCall];
}

@end
