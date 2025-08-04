//
//  LiquidBlurHelper.swift
//  Cordova Liquid Blur Plugin
//
//  Created by Carp School Team
//  Licensed under MIT License
//  Swift helper for advanced iOS 26 Liquid Glass features
//

import UIKit
import Foundation

@objc class LiquidBlurHelper: NSObject {
    
    // MARK: - iOS 26 Liquid Glass Features
    
    @objc static func configureLiquidGlassAppearance(_ visualEffectView: UIVisualEffectView) {
        if #available(iOS 16.0, *) {
            // Apply iOS 26+ Liquid Glass enhancements
            visualEffectView.layer.allowsGroupOpacity = false
            visualEffectView.layer.shouldRasterize = false
            
            // Enhanced shadow for floating effect
            visualEffectView.layer.shadowColor = UIColor.black.cgColor
            visualEffectView.layer.shadowOffset = CGSize(width: 0, height: 8)
            visualEffectView.layer.shadowRadius = 24
            visualEffectView.layer.shadowOpacity = 0.15
            
            // Liquid Glass corner styling
            visualEffectView.layer.cornerRadius = 20
            visualEffectView.layer.cornerCurve = .continuous
            
            // Enhanced border for definition
            visualEffectView.layer.borderWidth = 0.5
            visualEffectView.layer.borderColor = UIColor.separator.cgColor
        }
    }
    
    @objc static func createScrollEdgeEffect(for blurView: UIVisualEffectView, in parentView: UIView) {
        if #available(iOS 15.0, *) {
            // Create gradient mask for scroll edge effects
            let gradientLayer = CAGradientLayer()
            gradientLayer.frame = blurView.bounds
            gradientLayer.colors = [
                UIColor.clear.cgColor,
                UIColor.black.cgColor,
                UIColor.black.cgColor,
                UIColor.clear.cgColor
            ]
            gradientLayer.locations = [0.0, 0.05, 0.95, 1.0]
            blurView.layer.mask = gradientLayer
        }
    }
    
    @objc static func applyDynamicMaterialBehavior(_ visualEffectView: UIVisualEffectView) {
        if #available(iOS 17.0, *) {
            // Enable dynamic material adjustment based on content
            visualEffectView.contentView.backgroundColor = .clear
            
            // Add vibrancy for content overlaid on blur
            let vibrancyEffect = UIVibrancyEffect(blurEffect: visualEffectView.effect as! UIBlurEffect, style: .fill)
            let vibrancyView = UIVisualEffectView(effect: vibrancyEffect)
            vibrancyView.frame = visualEffectView.bounds
            vibrancyView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            visualEffectView.contentView.addSubview(vibrancyView)
        }
    }
    
    // MARK: - Animation Helpers
    
    @objc static func animateBlurTransition(
        _ blurView: UIVisualEffectView,
        fromEffect: UIBlurEffect?,
        toEffect: UIBlurEffect,
        duration: TimeInterval,
        completion: @escaping (Bool) -> Void
    ) {
        // Smooth transition between blur effects
        UIView.transition(with: blurView, duration: duration, options: .transitionCrossDissolve, animations: {
            blurView.effect = toEffect
        }, completion: completion)
    }
    
    @objc static func createFloatingAnimation(for view: UIView) {
        // Subtle floating animation for Liquid Glass elements
        let animation = CAKeyframeAnimation(keyPath: "transform.translation.y")
        animation.values = [0, -2, 0, 2, 0]
        animation.keyTimes = [0, 0.25, 0.5, 0.75, 1.0]
        animation.duration = 4.0
        animation.repeatCount = .infinity
        animation.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        view.layer.add(animation, forKey: "floating")
    }
    
    // MARK: - Performance Optimization
    
    @objc static func optimizeBlurPerformance(_ visualEffectView: UIVisualEffectView) {
        // Optimize for better performance on older devices
        visualEffectView.layer.shouldRasterize = true
        visualEffectView.layer.rasterizationScale = UIScreen.main.scale
        
        // Reduce overdraw by setting appropriate opacity
        if visualEffectView.effect is UIBlurEffect {
            visualEffectView.alpha = 0.95
        }
    }
    
    @objc static func setupMemoryManagement(for blurViews: [UIVisualEffectView]) {
        // Setup proper memory management for multiple blur views
        for blurView in blurViews {
            blurView.layer.shouldRasterize = false // Prevent excessive memory usage
            
            // Add observer for memory warnings
            NotificationCenter.default.addObserver(
                forName: UIApplication.didReceiveMemoryWarningNotification,
                object: nil,
                queue: .main
            ) { _ in
                blurView.layer.shouldRasterize = false
                blurView.alpha = 0.8 // Reduce visual complexity temporarily
            }
        }
    }
    
    // MARK: - Device Capability Detection
    
    @objc static func supportsAdvancedBlur() -> Bool {
        // Check if device supports advanced blur features
        if #available(iOS 16.0, *) {
            let device = UIDevice.current
            
            // Check for sufficient processing power
            var systemInfo = utsname()
            uname(&systemInfo)
            let modelCode = String(cString: &systemInfo.machine.0)
            
            // A15 Bionic and later support full Liquid Glass
            let advancedDevices = ["iPhone14", "iPhone15", "iPhone16", "iPad13", "iPad14", "iPad15"]
            return advancedDevices.contains { modelCode.hasPrefix($0) }
        }
        return false
    }
    
    @objc static func recommendedBlurStyle() -> String {
        if supportsAdvancedBlur() {
            return "systemMaterial"
        } else if #available(iOS 13.0, *) {
            return "systemThinMaterial"
        } else {
            return "light"
        }
    }
    
    // MARK: - Accessibility Support
    
    @objc static func configureAccessibility(for blurView: UIVisualEffectView, label: String) {
        blurView.isAccessibilityElement = true
        blurView.accessibilityLabel = label
        blurView.accessibilityTraits = .staticText
        
        // Respect reduce transparency setting
        if UIAccessibility.isReduceTransparencyEnabled {
            blurView.effect = nil
            blurView.backgroundColor = UIColor.systemBackground.withAlphaComponent(0.9)
        }
    }
    
    // MARK: - Debug Helpers
    
    @objc static func logBlurViewHierarchy(_ rootView: UIView) {
        #if DEBUG
        func printViewHierarchy(_ view: UIView, indent: String = "") {
            if view is UIVisualEffectView {
                print("\(indent)🌀 UIVisualEffectView: \(view.frame)")
            }
            for subview in view.subviews {
                printViewHierarchy(subview, indent: indent + "  ")
            }
        }
        
        print("=== Blur View Hierarchy ===")
        printViewHierarchy(rootView)
        print("========================")
        #endif
    }
}

// MARK: - UIVisualEffectView Extensions

extension UIVisualEffectView {
    
    @objc func applyLiquidGlassStyle() {
        LiquidBlurHelper.configureLiquidGlassAppearance(self)
    }
    
    @objc func enableDynamicBehavior() {
        LiquidBlurHelper.applyDynamicMaterialBehavior(self)
    }
    
    @objc func optimizePerformance() {
        LiquidBlurHelper.optimizeBlurPerformance(self)
    }
}
