//
//  FloatingToolbar.h
//  Cordova Floating Toolbar Plugin
//
//  Created by Carp School Team
//  Licensed under MIT License
//

#import <Cordova/CDV.h>
#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

@interface FloatingToolbar : CDVPlugin

// Plugin lifecycle
- (void)pluginInitialize;

// Main API methods
- (void)isSupported:(CDVInvokedUrlCommand*)command;
- (void)createToolbar:(CDVInvokedUrlCommand*)command;
- (void)updateToolbar:(CDVInvokedUrlCommand*)command;
- (void)addToolbarItem:(CDVInvokedUrlCommand*)command;
- (void)removeToolbarItem:(CDVInvokedUrlCommand*)command;
- (void)setToolbarVisibility:(CDVInvokedUrlCommand*)command;
- (void)removeToolbar:(CDVInvokedUrlCommand*)command;
- (void)removeAllToolbars:(CDVInvokedUrlCommand*)command;
- (void)animateToolbar:(CDVInvokedUrlCommand*)command;
- (void)configureSafeArea:(CDVInvokedUrlCommand*)command;
- (void)setScrollBehavior:(CDVInvokedUrlCommand*)command;

// Internal properties
@property (nonatomic, strong) NSMutableDictionary *toolbars;
@property (nonatomic, weak) UIView *webViewParent;

// Internal helper methods
- (NSString*)generateToolbarId;
- (UIToolbar*)createToolbarWithConfig:(NSDictionary*)config;
- (UIBarButtonItem*)createBarButtonItemWithConfig:(NSDictionary*)itemConfig;
- (void)sendActionToJS:(NSString*)toolbarId action:(NSString*)action itemIndex:(NSNumber*)itemIndex;

@end
