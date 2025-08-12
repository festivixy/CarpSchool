import UIKit
import Foundation

@objc public class NativeNavBarHelper: NSObject {
    
    @objc public static func isNativeNavBarSupported() -> Bool {
        // Native navbar is supported on all iOS versions
        return true
    }
    
    @objc public static func createStandardAppearance() -> UITabBarAppearance? {
        if #available(iOS 15.0, *) {
            let appearance = UITabBarAppearance()
            
            // Configure standard iOS appearance
            appearance.configureWithDefaultBackground()
            
            // Use system default colors and styling
            appearance.stackedLayoutAppearance.normal.iconColor = UIColor.systemBlue
            appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
                .foregroundColor: UIColor.label
            ]
            
            appearance.stackedLayoutAppearance.selected.iconColor = UIColor.systemBlue
            appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
                .foregroundColor: UIColor.systemBlue
            ]
            
            return appearance
        }
        
        return nil
    }
    
    @objc public static func setupStandardTabBar(_ tabBar: UITabBar) {
        if let appearance = createStandardAppearance() {
            tabBar.standardAppearance = appearance
            
            if #available(iOS 15.0, *) {
                tabBar.scrollEdgeAppearance = appearance
            }
        } else {
            // Fallback for iOS 14 and below
            tabBar.barStyle = UIBarStyle.default
            tabBar.tintColor = UIColor.systemBlue
        }
    }
}
