//
//  LiquidBlur.m
//  Cordova Liquid Blur Plugin
//
//  Created by Carp School Team
//  Licensed under MIT License
//

#import "LiquidBlur.h"
#import <Cordova/CDV.h>

@implementation LiquidBlur

#pragma mark - Plugin Lifecycle

- (void)pluginInitialize {
    [super pluginInitialize];
    
    // Initialize blur views dictionary
    self.blurViews = [[NSMutableDictionary alloc] init];
    self.scrollEdgeEffectsEnabled = YES;
    
    // Get WebView parent for blur insertion
    self.webViewParent = self.webView.superview;
    
    // Configure WebView for transparency to allow blur visibility
    [self configureWebViewTransparency];
    
    NSLog(@"[LiquidBlur] Plugin initialized successfully");
}

#pragma mark - Public API Methods

- (void)isSupported:(CDVInvokedUrlCommand*)command {
    BOOL supported = NO;
    
    // Check iOS version and device capabilities
    if (@available(iOS 13.0, *)) {
        supported = YES;
        NSLog(@"[LiquidBlur] Native blur support available");
    } else {
        NSLog(@"[LiquidBlur] Native blur requires iOS 13.0+");
    }
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:supported];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)createBlurView:(CDVInvokedUrlCommand*)command {
    NSDictionary* config = [command.arguments objectAtIndex:0];
    
    if (!config) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Configuration required"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    @try {
        UIVisualEffectView* blurView = [self createBlurViewWithConfig:config];
        NSString* blurId = [self generateBlurViewId];
        
        // Store the blur view
        [self.blurViews setObject:blurView forKey:blurId];
        
        // Add to view hierarchy
        [self.webViewParent addSubview:blurView];
        
        NSLog(@"[LiquidBlur] Created blur view with ID: %@", blurId);
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:blurId];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    } @catch (NSException *exception) {
        NSLog(@"[LiquidBlur] Error creating blur view: %@", exception.reason);
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:exception.reason];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void)updateBlurView:(CDVInvokedUrlCommand*)command {
    NSString* blurId = [command.arguments objectAtIndex:0];
    NSDictionary* config = [command.arguments objectAtIndex:1];
    
    UIVisualEffectView* blurView = [self.blurViews objectForKey:blurId];
    if (!blurView) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Blur view not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    @try {
        // Update blur style
        NSString* style = [config objectForKey:@"style"];
        if (style) {
            UIBlurEffect* effect = [self blurEffectFromString:style];
            blurView.effect = effect;
        }
        
        // Update frame
        NSDictionary* frameConfig = [config objectForKey:@"frame"];
        if (frameConfig) {
            CGRect newFrame = [self frameFromConfig:frameConfig parentView:self.webViewParent];
            blurView.frame = newFrame;
        }
        
        // Update alpha
        NSNumber* alpha = [config objectForKey:@"alpha"];
        if (alpha) {
            blurView.alpha = [alpha floatValue];
        }
        
        NSLog(@"[LiquidBlur] Updated blur view: %@", blurId);
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    } @catch (NSException *exception) {
        NSLog(@"[LiquidBlur] Error updating blur view: %@", exception.reason);
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:exception.reason];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void)removeBlurView:(CDVInvokedUrlCommand*)command {
    NSString* blurId = [command.arguments objectAtIndex:0];
    
    UIVisualEffectView* blurView = [self.blurViews objectForKey:blurId];
    if (!blurView) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Blur view not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    [blurView removeFromSuperview];
    [self.blurViews removeObjectForKey:blurId];
    
    NSLog(@"[LiquidBlur] Removed blur view: %@", blurId);
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)removeAllBlurViews:(CDVInvokedUrlCommand*)command {
    for (UIVisualEffectView* blurView in [self.blurViews allValues]) {
        [blurView removeFromSuperview];
    }
    
    [self.blurViews removeAllObjects];
    
    NSLog(@"[LiquidBlur] Removed all blur views");
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)setBlurViewVisibility:(CDVInvokedUrlCommand*)command {
    NSString* blurId = [command.arguments objectAtIndex:0];
    NSNumber* visible = [command.arguments objectAtIndex:1];
    
    UIVisualEffectView* blurView = [self.blurViews objectForKey:blurId];
    if (!blurView) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Blur view not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    blurView.hidden = ![visible boolValue];
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)animateBlurView:(CDVInvokedUrlCommand*)command {
    NSString* blurId = [command.arguments objectAtIndex:0];
    NSDictionary* properties = [command.arguments objectAtIndex:1];
    NSNumber* duration = [command.arguments objectAtIndex:2];
    
    UIVisualEffectView* blurView = [self.blurViews objectForKey:blurId];
    if (!blurView) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Blur view not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    NSTimeInterval animationDuration = [duration doubleValue] / 1000.0; // Convert ms to seconds
    
    [UIView animateWithDuration:animationDuration
                          delay:0.0
                        options:UIViewAnimationOptionCurveEaseInOut
                     animations:^{
                         // Animate alpha
                         NSNumber* alpha = [properties objectForKey:@"alpha"];
                         if (alpha) {
                             blurView.alpha = [alpha floatValue];
                         }
                         
                         // Animate frame
                         NSDictionary* frameConfig = [properties objectForKey:@"frame"];
                         if (frameConfig) {
                             CGRect newFrame = [self frameFromConfig:frameConfig parentView:self.webViewParent];
                             blurView.frame = newFrame;
                         }
                     }
                     completion:^(BOOL finished) {
                         CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
                         [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
                     }];
}

- (void)getAvailableBlurStyles:(CDVInvokedUrlCommand*)command {
    NSMutableArray* styles = [[NSMutableArray alloc] init];
    
    // Add available styles based on iOS version
    [styles addObject:@"systemMaterial"];
    [styles addObject:@"systemThinMaterial"];
    [styles addObject:@"systemThickMaterial"];
    [styles addObject:@"systemChromeMaterial"];
    
    if (@available(iOS 13.0, *)) {
        [styles addObject:@"systemUltraThinMaterial"];
    }
    
    // Legacy styles for older iOS versions
    [styles addObject:@"light"];
    [styles addObject:@"dark"];
    [styles addObject:@"extraLight"];
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:styles];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)setScrollEdgeEffects:(CDVInvokedUrlCommand*)command {
    NSNumber* enabled = [command.arguments objectAtIndex:0];
    self.scrollEdgeEffectsEnabled = [enabled boolValue];
    
    NSLog(@"[LiquidBlur] Scroll edge effects: %@", self.scrollEdgeEffectsEnabled ? @"enabled" : @"disabled");
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

#pragma mark - Helper Methods

- (UIBlurEffect*)blurEffectFromString:(NSString*)styleName {
    if (@available(iOS 13.0, *)) {
        if ([styleName isEqualToString:@"systemMaterial"]) {
            return [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemMaterial];
        } else if ([styleName isEqualToString:@"systemThinMaterial"]) {
            return [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemThinMaterial];
        } else if ([styleName isEqualToString:@"systemThickMaterial"]) {
            return [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemThickMaterial];
        } else if ([styleName isEqualToString:@"systemChromeMaterial"]) {
            return [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemChromeMaterial];
        } else if ([styleName isEqualToString:@"systemUltraThinMaterial"]) {
            return [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemUltraThinMaterial];
        }
    }
    
    // Fallback to legacy styles
    if ([styleName isEqualToString:@"light"]) {
        return [UIBlurEffect effectWithStyle:UIBlurEffectStyleLight];
    } else if ([styleName isEqualToString:@"dark"]) {
        return [UIBlurEffect effectWithStyle:UIBlurEffectStyleDark];
    } else if ([styleName isEqualToString:@"extraLight"]) {
        return [UIBlurEffect effectWithStyle:UIBlurEffectStyleExtraLight];
    }
    
    // Default to system material
    if (@available(iOS 13.0, *)) {
        return [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemMaterial];
    } else {
        return [UIBlurEffect effectWithStyle:UIBlurEffectStyleLight];
    }
}

- (NSString*)generateBlurViewId {
    return [NSString stringWithFormat:@"blur_%@", [[NSUUID UUID] UUIDString]];
}

- (UIVisualEffectView*)createBlurViewWithConfig:(NSDictionary*)config {
    // Get blur style
    NSString* style = [config objectForKey:@"style"] ?: @"systemMaterial";
    UIBlurEffect* effect = [self blurEffectFromString:style];
    
    // Create blur view
    UIVisualEffectView* blurView = [[UIVisualEffectView alloc] initWithEffect:effect];
    
    // Configure frame
    NSDictionary* frameConfig = [config objectForKey:@"frame"];
    CGRect frame = [self frameFromConfig:frameConfig parentView:self.webViewParent];
    blurView.frame = frame;
    
    // Configure properties
    NSNumber* alpha = [config objectForKey:@"alpha"];
    if (alpha) {
        blurView.alpha = [alpha floatValue];
    }
    
    NSNumber* floating = [config objectForKey:@"floating"];
    if (floating && [floating boolValue]) {
        blurView.layer.cornerRadius = 16.0;
        blurView.layer.masksToBounds = YES;
        blurView.layer.shadowColor = [[UIColor blackColor] CGColor];
        blurView.layer.shadowOffset = CGSizeMake(0, 4);
        blurView.layer.shadowRadius = 12.0;
        blurView.layer.shadowOpacity = 0.3;
        blurView.layer.masksToBounds = NO;
    }
    
    // Configure auto-resizing if needed
    blurView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    
    return blurView;
}

- (void)configureWebViewTransparency {
    // Configure WebView for transparency
    if ([self.webView respondsToSelector:@selector(setOpaque:)]) {
        [self.webView setOpaque:NO];
    }
    
    if ([self.webView respondsToSelector:@selector(setBackgroundColor:)]) {
        [self.webView setBackgroundColor:[UIColor clearColor]];
    }
    
    NSLog(@"[LiquidBlur] Configured WebView transparency");
}

- (CGRect)frameFromConfig:(NSDictionary*)frameConfig parentView:(UIView*)parentView {
    if (!frameConfig || !parentView) {
        return parentView.bounds;
    }
    
    CGRect parentBounds = parentView.bounds;
    
    // Handle percentage or pixel values
    id xValue = [frameConfig objectForKey:@"x"];
    id yValue = [frameConfig objectForKey:@"y"];
    id widthValue = [frameConfig objectForKey:@"width"];
    id heightValue = [frameConfig objectForKey:@"height"];
    
    CGFloat x = 0, y = 0, width = parentBounds.size.width, height = parentBounds.size.height;
    
    if ([xValue isKindOfClass:[NSNumber class]]) {
        x = [xValue floatValue];
    } else if ([xValue isKindOfClass:[NSString class]] && [xValue hasSuffix:@"%"]) {
        CGFloat percentage = [[xValue substringToIndex:[xValue length] - 1] floatValue] / 100.0;
        x = parentBounds.size.width * percentage;
    }
    
    if ([yValue isKindOfClass:[NSNumber class]]) {
        y = [yValue floatValue];
    } else if ([yValue isKindOfClass:[NSString class]] && [yValue hasSuffix:@"%"]) {
        CGFloat percentage = [[yValue substringToIndex:[yValue length] - 1] floatValue] / 100.0;
        y = parentBounds.size.height * percentage;
    }
    
    if ([widthValue isKindOfClass:[NSNumber class]]) {
        width = [widthValue floatValue];
    } else if ([widthValue isKindOfClass:[NSString class]]) {
        if ([widthValue isEqualToString:@"100%"]) {
            width = parentBounds.size.width;
        } else if ([widthValue hasSuffix:@"%"]) {
            CGFloat percentage = [[widthValue substringToIndex:[widthValue length] - 1] floatValue] / 100.0;
            width = parentBounds.size.width * percentage;
        }
    }
    
    if ([heightValue isKindOfClass:[NSNumber class]]) {
        height = [heightValue floatValue];
    } else if ([heightValue isKindOfClass:[NSString class]]) {
        if ([heightValue isEqualToString:@"100%"]) {
            height = parentBounds.size.height;
        } else if ([heightValue hasSuffix:@"%"]) {
            CGFloat percentage = [[heightValue substringToIndex:[heightValue length] - 1] floatValue] / 100.0;
            height = parentBounds.size.height * percentage;
        }
    }
    
    return CGRectMake(x, y, width, height);
}

@end
