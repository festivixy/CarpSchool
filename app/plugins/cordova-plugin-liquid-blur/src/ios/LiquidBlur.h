//
//  LiquidBlur.h
//  Cordova Liquid Blur Plugin
//
//  Created by Carp School Team
//  Licensed under MIT License
//

#import <Cordova/CDV.h>
#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

@interface LiquidBlur : CDVPlugin

// Plugin lifecycle
- (void)pluginInitialize;

// Main API methods
- (void)isSupported:(CDVInvokedUrlCommand*)command;
- (void)createBlurView:(CDVInvokedUrlCommand*)command;
- (void)updateBlurView:(CDVInvokedUrlCommand*)command;
- (void)removeBlurView:(CDVInvokedUrlCommand*)command;
- (void)removeAllBlurViews:(CDVInvokedUrlCommand*)command;
- (void)setBlurViewVisibility:(CDVInvokedUrlCommand*)command;
- (void)animateBlurView:(CDVInvokedUrlCommand*)command;
- (void)getAvailableBlurStyles:(CDVInvokedUrlCommand*)command;
- (void)setScrollEdgeEffects:(CDVInvokedUrlCommand*)command;

// Internal properties
@property (nonatomic, strong) NSMutableDictionary *blurViews;
@property (nonatomic, weak) UIView *webViewParent;
@property (nonatomic, assign) BOOL scrollEdgeEffectsEnabled;

// Internal helper methods
- (UIBlurEffect*)blurEffectFromString:(NSString*)styleName;
- (NSString*)generateBlurViewId;
- (UIVisualEffectView*)createBlurViewWithConfig:(NSDictionary*)config;
- (void)configureWebViewTransparency;
- (CGRect)frameFromConfig:(NSDictionary*)frameConfig parentView:(UIView*)parentView;

@end
