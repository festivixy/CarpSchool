//
//  ToolbarManager.swift
//  Cordova Floating Toolbar Plugin
//
//  Created by Carp School Team
//  Licensed under MIT License
//  Swift helper for advanced iOS 26 toolbar features
//

import UIKit
import Foundation

@objc class ToolbarManager: NSObject {
    
    // MARK: - iOS 26 Liquid Glass Toolbar Features
    
    @objc static func configureFloatingToolbar(_ toolbar: UIToolbar, config: [String: Any]) {
        if #available(iOS 16.0, *) {
            // Apply iOS 26+ Liquid Glass enhancements
            toolbar.layer.cornerRadius = 20
            toolbar.layer.cornerCurve = .continuous
            toolbar.layer.masksToBounds = false
            
            // Enhanced shadow for floating effect
            toolbar.layer.shadowColor = UIColor.black.cgColor
            toolbar.layer.shadowOffset = CGSize(width: 0, height: 8)
            toolbar.layer.shadowRadius = 24
            toolbar.layer.shadowOpacity = 0.15
            
            // Enhanced border for definition
            toolbar.layer.borderWidth = 0.5
            toolbar.layer.borderColor = UIColor.separator.cgColor
            
            // Position for floating
            if let floating = config["floating"] as? Bool, floating {
                positionFloatingToolbar(toolbar, in: toolbar.superview!)
            }
        }
    }
    
    @objc static func positionFloatingToolbar(_ toolbar: UIToolbar, in parentView: UIView) {
        toolbar.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            toolbar.leadingAnchor.constraint(equalTo: parentView.leadingAnchor, constant: 16),
            toolbar.trailingAnchor.constraint(equalTo: parentView.trailingAnchor, constant: -16),
            toolbar.bottomAnchor.constraint(equalTo: parentView.safeAreaLayoutGuide.bottomAnchor, constant: -16),
            toolbar.heightAnchor.constraint(equalToConstant: 60)
        ])
    }
    
    @objc static func applyBlurEffect(_ toolbar: UIToolbar, style: String) {
        // Get blur effect style
        var blurEffect: UIBlurEffect
        
        if #available(iOS 13.0, *) {
            switch style {
            case "systemMaterial":
                blurEffect = UIBlurEffect(style: .systemMaterial)
            case "systemThinMaterial":
                blurEffect = UIBlurEffect(style: .systemThinMaterial)
            case "systemThickMaterial":
                blurEffect = UIBlurEffect(style: .systemThickMaterial)
            case "systemChromeMaterial":
                blurEffect = UIBlurEffect(style: .systemChromeMaterial)
            case "systemUltraThinMaterial":
                blurEffect = UIBlurEffect(style: .systemUltraThinMaterial)
            default:
                blurEffect = UIBlurEffect(style: .systemMaterial)
            }
        } else {
            // Fallback for older iOS versions
            blurEffect = UIBlurEffect(style: .light)
        }
        
        // Apply blur background
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.frame = toolbar.bounds
        blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        // Insert blur view as background
        toolbar.insertSubview(blurView, at: 0)
        
        // Make toolbar background transparent to show blur
        toolbar.setBackgroundImage(UIImage(), forToolbarPosition: .any, barMetrics: .default)
        toolbar.setShadowImage(UIImage(), forToolbarPosition: .any)
    }
    
    // MARK: - Animation Helpers
    
    @objc static func animateToolbarAppearance(
        _ toolbar: UIToolbar,
        show: Bool,
        duration: TimeInterval = 0.3,
        completion: @escaping (Bool) -> Void
    ) {
        let targetAlpha: CGFloat = show ? 1.0 : 0.0
        let targetTransform = show ? CGAffineTransform.identity : CGAffineTransform(translationX: 0, y: 100)
        
        UIView.animate(withDuration: duration, delay: 0, usingSpringWithDamping: 0.8, initialSpringVelocity: 0.2, options: .curveEaseInOut, animations: {
            toolbar.alpha = targetAlpha
            toolbar.transform = targetTransform
        }, completion: completion)
    }
    
    @objc static func animateToolbarItems(_ toolbar: UIToolbar, show: Bool) {
        guard let items = toolbar.items else { return }
        
        for (index, item) in items.enumerated() {
            let delay = Double(index) * 0.05
            
            UIView.animate(withDuration: 0.3, delay: delay, options: .curveEaseOut, animations: {
                // Animate individual items if needed
            })
        }
    }
    
    // MARK: - Safe Area Handling
    
    @objc static func configureSafeAreaInsets(_ toolbar: UIToolbar, respectSafeArea: Bool) {
        if #available(iOS 11.0, *), respectSafeArea {
            toolbar.translatesAutoresizingMaskIntoConstraints = false
            
            if let superview = toolbar.superview {
                NSLayoutConstraint.activate([
                    toolbar.leadingAnchor.constraint(equalTo: superview.safeAreaLayoutGuide.leadingAnchor),
                    toolbar.trailingAnchor.constraint(equalTo: superview.safeAreaLayoutGuide.trailingAnchor),
                    toolbar.bottomAnchor.constraint(equalTo: superview.safeAreaLayoutGuide.bottomAnchor)
                ])
            }
        }
    }
    
    // MARK: - Touch Target Validation
    
    @objc static func validateTouchTargets(_ toolbar: UIToolbar) -> Bool {
        let minimumTouchTarget: CGFloat = 44.0
        
        guard let items = toolbar.items else { return true }
        
        for item in items {
            if let view = item.value(forKey: "view") as? UIView {
                if view.frame.width < minimumTouchTarget || view.frame.height < minimumTouchTarget {
                    print("⚠️ Touch target too small: \(view.frame.size)")
                    return false
                }
            }
        }
        
        return true
    }
    
    // MARK: - Accessibility Support
    
    @objc static func configureAccessibility(_ toolbar: UIToolbar) {
        toolbar.isAccessibilityElement = false
        toolbar.accessibilityTraits = .none
        
        // Ensure individual items are accessible
        if let items = toolbar.items {
            for (index, item) in items.enumerated() {
                if item.title == nil && item.accessibilityLabel == nil {
                    item.accessibilityLabel = "Toolbar button \(index + 1)"
                }
            }
        }
    }
    
    // MARK: - Performance Optimization
    
    @objc static func optimizeToolbarPerformance(_ toolbar: UIToolbar) {
        // Optimize for better performance
        toolbar.layer.shouldRasterize = true
        toolbar.layer.rasterizationScale = UIScreen.main.scale
        
        // Reduce overdraw
        toolbar.isOpaque = false
        toolbar.backgroundColor = .clear
    }
    
    @objc static func setupMemoryManagement(for toolbars: [UIToolbar]) {
        // Setup proper memory management for multiple toolbars
        for toolbar in toolbars {
            toolbar.layer.shouldRasterize = false // Prevent excessive memory usage
            
            // Add observer for memory warnings
            NotificationCenter.default.addObserver(
                forName: UIApplication.didReceiveMemoryWarningNotification,
                object: nil,
                queue: .main
            ) { _ in
                toolbar.layer.shouldRasterize = false
                toolbar.alpha = 0.9 // Reduce visual complexity temporarily
            }
        }
    }
}

// MARK: - UIToolbar Extensions

extension UIToolbar {
    
    @objc func applyLiquidGlassStyle(config: [String: Any] = [:]) {
        ToolbarManager.configureFloatingToolbar(self, config: config)
    }
    
    @objc func setFloatingPosition(in parentView: UIView) {
        ToolbarManager.positionFloatingToolbar(self, in: parentView)
    }
    
    @objc func animateAppearance(show: Bool, completion: @escaping (Bool) -> Void = { _ in }) {
        ToolbarManager.animateToolbarAppearance(self, show: show, completion: completion)
    }
    
    @objc func validateAccessibility() -> Bool {
        ToolbarManager.validateTouchTargets(self)
    }
}
