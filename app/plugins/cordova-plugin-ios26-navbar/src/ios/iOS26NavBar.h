#import <Cordova/CDVPlugin.h>
#import <UIKit/UIKit.h>

@interface iOS26NavBar : CDVPlugin

// Plugin methods
- (void)isSupported:(CDVInvokedUrlCommand*)command;
- (void)createNavBar:(CDVInvokedUrlCommand*)command;
- (void)setNavBarItems:(CDVInvokedUrlCommand*)command;
- (void)setActiveItem:(CDVInvokedUrlCommand*)command;
- (void)showNavBar:(CDVInvokedUrlCommand*)command;
- (void)hideNavBar:(CDVInvokedUrlCommand*)command;
- (void)removeNavBar:(CDVInvokedUrlCommand*)command;
- (void)setActionHandler:(CDVInvokedUrlCommand*)command;
- (void)getIOSVersion:(CDVInvokedUrlCommand*)command;

// Internal properties
@property (nonatomic, strong) NSMutableDictionary *navBars;
@property (nonatomic, strong) NSString *actionHandlerCallbackId;

@end
