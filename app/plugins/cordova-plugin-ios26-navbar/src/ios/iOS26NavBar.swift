import UIKit
import Foundation

@objc public class iOS26NavBarHelper: NSObject {
    
    @objc public static func isIOS26OrLater() -> Bool {
        if #available(iOS 26.0, *) {
            return true
        } else {
            return false
        }
    }
    
    @objc public static func createLiquidGlassAppearance() -> UITabBarAppearance? {
        if #available(iOS 26.0, *) {
            let appearance = UITabBarAppearance()
            
            // Configure liquid glass effect for iOS 26
            appearance.configureWithDefaultBackground()
            appearance.backgroundColor = UIColor.clear
            appearance.backgroundEffect = UIBlurEffect(style: .systemMaterial)
            
            // Configure item appearance for liquid glass
            appearance.stackedLayoutAppearance.normal.iconColor = UIColor.systemBlue
            appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
                .foregroundColor: UIColor.systemBlue
            ]
            
            appearance.stackedLayoutAppearance.selected.iconColor = UIColor.systemBlue
            appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
                .foregroundColor: UIColor.systemBlue
            ]
            
            return appearance
        } else if #available(iOS 15.0, *) {
            // Fallback for iOS 15-25
            let appearance = UITabBarAppearance()
            appearance.configureWithDefaultBackground()
            appearance.backgroundColor = UIColor.systemBackground.withAlphaComponent(0.8)
            appearance.backgroundEffect = UIBlurEffect(style: .systemMaterial)
            
            return appearance
        }
        
        return nil
    }
    
    @objc public static func setupLiquidGlassTabBar(_ tabBar: UITabBar) {
        if let appearance = createLiquidGlassAppearance() {
            tabBar.standardAppearance = appearance
            
            if #available(iOS 15.0, *) {
                tabBar.scrollEdgeAppearance = appearance
            }
        }
        
        // Additional iOS 26 specific configurations
        if #available(iOS 26.0, *) {
            tabBar.layer.cornerRadius = 16
            tabBar.layer.maskedCorners = [.layerMinXMinYCorner, .layerMaxXMinYCorner]
            tabBar.clipsToBounds = true
        }
    }
}
