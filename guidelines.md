# Toolbar guidelines for iOS

## 🧭 1. What is a Toolbar, Where to Put It

* Toolbars are **horizontal strips of controls** (buttons, menus, pickers) often at the **bottom edge** of mobile screens, grouped into logical segments. ([Apple Developer][1])
* On **iPhone**, always place the toolbar at the **bottom**—top toolbars are reserved for split views, sheets, iPad, or desktop, and aren’t permitted on iPhone. ([Stack Overflow][2], [Coders High][3])

---

## 2. Purpose & Design Goals

* Serve **context‑specific actions**, tailored to the current screen or task.
* Be **glanceable & tornado‑safe**: focus on a few (typically ≤5) of the most important actions.
* Never use a toolbar simply for navigation—that remains in the tab bar or navigation stack. ([Apple Developer][1])

---

## 3. Layout & Content Rules

* **Icon‑only buttons** are preferred when only 1–2 items are shown; if you include 3+ actions, pair appropriately with short labels.
* Avoid bottlenecking three to six icons into a small space—spaced system icons should not be crammed. ([Coders High][3])
* **Never embed segmented controls** or educational pickers in a toolbar; use dedicated UI for input instead. ([Coders High][3])
* Leave space around the edges (≥8 pt) so touch targets remain safely accessible. Recommend **44 × 44 pt minimum** touch targets. ([Apple Developer][4], [medium.com][5])

---

## 4. Visual Appearance (Pre‑iOS 26)

* Toolbars are **translucent by default**, using system blur to expose content beneath.
* Tint is optional; avoid applying arbitrary solid backgrounds—the system draws a blur behind your icons automatically. ([Apple Developer][1])
* A toolbar may **disappear automatically** when scrolling or when the keyboard appears, unless made permanent via system settings. ([Coders High][3])

---

## 5. Compatibility & Touch Safety

* Maintain **44 × 44 pt touch size**, centered on each icon or label. Keep at least **8 pt spacing** between touch targets. ([Apple Developer][4], [medium.com][5])
* Even in compact layouts, ensure that **peace of mind vs visual fidelity** is respected—don’t shrink targets just to cram more items.

---

## 6. New in iOS 26—**Liquid Glass‑Style Toolbars**

Apple’s updated design system brings dynamic, floating toolbar surfaces:

* Toolbars now **float above content** on a **Liquid Glass surface**; remove any custom background tint or `UIBarAppearance` to retain the native glass look. ([Apple Developer][1])
* **Bar‑button grouping** is automatic:

  * *Image‑only buttons* share one rounded glass background.
  * *Text buttons* (e.g., “Done”) get separate glass groups. Use `.fixedSpace(0)` or `.flexibleSpace(hidesSharedBackground: false)` to partition items manually. ([Apple Developer][1])
* Icons default to **SF Symbols monochrome**; tint only when needed to convey meaning, not decoration. ([Apple Developer][6])
* A new **scroll‑edge effect** applies a subtle blur/fade to content behind the toolbar, boosting contrast automatically. Use hard-edge style for dense UIs if needed. ([Apple Developer][1])

---

## 7. Search Integration in Toolbars (iPhone)

* iOS 26 automatically places search in the toolbar when a search role is used. It appears as either an **in‑toolbar search field** or an icon; tapping expands it. ([Apple Developer][1])
* Add `searchBarPlacementBarButtonItem` to your toolbar items to explicitly place search. Adjust positioning using `searchToolbarBehavior` if needed. ([Apple Developer][1])

---

## 8. Title, Subtitle & Navigation Toolbar Behavior

* Navigation items like **large titles** and the optional **subtitle** render above the content, and scroll off as content scrolls under the bar. Use `navigationItem.subtitle` and `largeSubtitleView` APIs. ([Apple Developer][1])
* The toolbar floats above your scroll view content; ensure the content under the toolbar includes edge insets/“underbars” and scroll‑edge effects for clarity. ([Apple Developer][6])

---

## 9. UIKit & SwiftUI Implementation Notes

* In UIKit, work with `UINavigationBar` or `UIToolbar`, and let system handle background/tint. Avoid setting `.backgroundImage`, `.barTintColor`, or `backgroundColor` unless you’re replacing the Liquid Glass style. ([Apple Developer][6])
* In SwiftUI, toolbars are created with `.toolbar { ToolbarItem(placement: .bottomBar) { ... } }`. SF Symbols and tint propagate automatically—but remove custom `.background` modifiers around `.toolbar`.
* Keep space for **bottom safe area** & optional accessory views (e.g. mini-player) using standard UIKit environment traits like `traitCollection.tabAccessoryEnvironment`.

---

## 🧰 Quick Reference Table

| Aspect                   | Pre‑iOS 26                         | iOS 26+ (Liquid Glass)                         |
| ------------------------ | ---------------------------------- | ---------------------------------------------- |
| Toolbar position         | Bottom edge only                   | Still bottom; floats above content             |
| Number of items          | ≤ 5 recommended                    | Same (auto grouping helps maintain clarity)    |
| Appearance               | Translucent blur                   | Fluid glass with dynamic tint/shadows          |
| Button grouping          | Manual spacing in Flex/Fixed space | System groups image/text buttons; can override |
| Touch target size        | 44×44 pt minimum                   | Same                                           |
| Background customization | Avoid solid color                  | Remove any custom background                   |
| Scroll hiding            | May hide on scroll/keyboard        | Auto scroll edge effect for legibility         |
| Tint usage               | Optional                           | Only for meaning; sf‑monochrome default        |
| Search placement         | Manual                             | `.searchBarPlacementBarButtonItem` in toolbar  |

---

## ✅ Final “Don’t Forget” Checklist for iPhone Toolbars

* [ ] Bottom‑edge only, no top‑edge toolbars on iPhone
* [ ] Show only essential screen‑specific actions
* [ ] Respect 44×44 pt minimal touch targets, ≥8 pt spacing
* [ ] Do **not** use segmented controls or menus in toolbars
* [ ] Let the system handle translucency; don’t add solid backgrounds
* [ ] Remove any manual tint/background styling to preserve Liquid Glass
* [ ] Use grouping rules for images vs. text buttons in iOS 26
* [ ] Ensure scroll content renders under the toolbar for edge blur to apply
* [ ] Use SwiftUI or UIKit system APIs for search placement if needed

---

By following these keypoints—**and nothing extra**—you’ll be adhering to *all* the iOS toolbar guidelines as specified in Apple’s HIG, up to date through iOS 26.

[1]: https://developer.apple.com/videos/play/wwdc2025/284/?time=491&utm_source=chatgpt.com "Build a UIKit app with the new design - WWDC25 - Videos - Apple Developer"
[2]: https://stackoverflow.com/questions/7454369/how-can-i-add-a-toolbar-to-the-top-of-my-iphone-apps-screen-without-it-looking?utm_source=chatgpt.com "How can I add a toolbar to the top of my iPhone app's screen without ..."
[3]: https://codershigh.github.io/guidelines/ios/human-interface-guidelines/ui-bars/toolbars/index.html "Toolbars - UI Bars -  iOS Human Interface Guidelines"
[4]: https://developer.apple.com/design/human-interface-guidelines/buttons?utm_source=chatgpt.com "Buttons | Apple Developer Documentation"
[5]: https://medium.com/%40zacdicko/size-matters-accessibility-and-touch-targets-56e942adc0cc?utm_source=chatgpt.com "Size matters! Accessibility and Touch Targets | by Zac Dickerson"
[6]: https://developer.apple.com/videos/play/wwdc2025/284/?time=491 "Build a UIKit app with the new design - WWDC25 - Videos - Apple Developer"

If by “system blur” you mean the **native iOS frosted‑glass look** (like Apple’s toolbar blur using *UIBlurEffect*), here are the two proven ways to implement it in a Cordova iOS app:

# Blurring the Toolbar in Cordova iOS

## 🧩 1. ✅ Pure Web‑View (HTML/CSS) Blur — Easy but Limited

This works entirely within your Cordova web layer (WKWebView), using CSS’s `backdrop-filter`:

### a) Make the WebView + HTML transparent

In your native iOS project (e.g. in `MainViewController.m`):

```objc
self.webView.opaque = NO;
self.webView.backgroundColor = [UIColor clearColor];
```

(This prevents the default white canvas behind your web content) — essential for *backdrop-filter* to show through ([Capacitor][1]).

In your CSS (global `body`):

```css
html, body { background: transparent !important; }
```

Ensure all container elements do not add opaque backgrounds. This is mandatory with frameworks like Ionic/Vue/React ([cordova.apache.org][2]).

### b) CSS toolbar with blur

```css
#toolbar {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50px;
  background: rgba(255,255,255,0.3);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  display: flex;
  /* optional: align‑items, justify-content */
}
```

iOS 15 + WKWebView fully supports the prefixed version `-webkit-backdrop-filter` — needed for reliable blur rendering ([Stack Overflow][3], [Stack Overflow][4]).

**Pros:**
– Works inside Cordova without any native code.
– No plugin continuous maintenance.

**Cons:**
– Performance can be choppy on older devices (due to WebKit GPU compositing).
– Blur intensity and system “material” styles (light/dark adapts) are not available—just simple Gaussian blur.
– Not compatible with iOS 12 or earlier; fallback needed.

---

## 📱 2. ✅ Native Blur via Cordova Plugin — Real iOS “System Blur”

To get **true system blur** (the same API used in UIKit toolbars):

### a) Build (or use) a Cordova plugin that inserts a `UIVisualEffectView` above or below the WebView

**Sample Objective-C snippet inside your plugin’s `- (void)pluginInitialize`:**

```objc
UIBlurEffect *effect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemMaterial];
UIVisualEffectView *blurView = [[UIVisualEffectView alloc] initWithEffect:effect];
UIView *parent = self.webView.superview;
blurView.frame = parent.bounds;
blurView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
[parent insertSubview:blurView aboveSubview:self.webView];
```

Apple’s docs confirm:

> “Use UIVisualEffectView with UIBlurEffect to apply blur over content layered behind it.”  ([netexl.com][5], [cordova.apache.org][2], [groups.google.com][6], [blog.csdn.net][7])

You can adjust `UIBlurEffectStyle...` to match `.systemThinMaterial`, `.systemThickMaterial`, etc. for iOS 13+ dynamic theming.

### b) Install your plugin and call from JS

```js
// show blur
cordova.plugins.myBlur.insertBlur(/* options */);
// hide blur
cordova.plugins.myBlur.removeBlur();
```

Use this to simulate toolbars, popovers, or even scroll‑edge effects.

### c) Or use an existing plugin (privacy blur)

There’s an existing plugin: `cordova-plugin-blur-app-privacy-screen` (aka *cordova-plugin-blurry-privacy-screen*) which uses system blur on background events—but **not interactive overlays**. Still, you can study its implementation as a sample bridge ([github.com][8]).

---

## ✅ Summary / Decision Guide

| Goal                         | Pure CSS blur                   | Native system blur plugin                 |
| ---------------------------- | ------------------------------- | ----------------------------------------- |
| Implementation Speed         | ✨ Very fast, just CSS           | 🧩 Requires plugin coding or install      |
| Performance                  | ✅ Good if GPU-powered           | ✅ Smooth native animations                |
| Access to system “materials” | ❌ Only custom Gaussian blur     | ✅ Full support for dynamic blur styles    |
| iOS Version Coverage         | iOS 13+                         | iOS 8+ (simpler style until iOS 13)       |
| Transparency & Position      | Limited in z‑index and stacking | Full control with effect view positioning |

---

## 🛠 Installation Tips

### 1. Upgrade to *cordova-plugin-wkwebview-engine*

Cordova dropped UIWebView long ago; WKWebView is required for performance and transparency support.

### 2. config.xml tweaks

```xml
<preference name="WKWebViewOnly" value="true" />
<preference name="StatusBarOverlaysWebView" value="true" />
<!-- ensure status bar is transparent if you intend toolbar behind it -->
```

Install `cordova-plugin-statusbar` and set `StatusBar.overlaysWebView(true)` if you overlay UI elements ([Capacitor][1], [blog.csdn.net][7], [cordova.apache.org][2]).

### 3. Safe areas and scroll-edge blur

If you’re replicating the Liquid Glass toolbar (iOS 16+/UIKitℹ️), under-scrollable content should extend *behind* the toolbar for edge-blur to appear. Either:

```swift
webView.scrollView.contentInsetAdjustmentBehavior = .never
```

or in JS/CSS ensure your content doesn’t stop above the toolbar.

---

## 🧠 Notes & Pitfalls

* **CSS-only blur does not emulate scroll-edge fade or tint/border effects** from UIKit styles.
* **UIVisualEffectView in hybrid apps may require WebView’s parent view to allow transparency**, so make sure your WKWebView is non‑opaque as shown above.
* **On older iOS (pre‑13)** the system blur styles fallback to `.light/.dark/.extraLight`, no dynamic systemMaterial effects.
* **Performance:** avoid animating blur in WebViews during scrolling; the native blur view handles that better.

---

## ✅ Quick Wins

* For **non-API toolbar UI** (a basic blurred background behind icon buttons), go with the pure CSS solution.
* For **authentic system look, Material blur, or blurring underlying views**, use or build the native plugin route.

---

### ✅ Final Setup Summary

1. Ensure WKWebView transparency: `opaque=NO` and `clearColor`.
2. Keep HTML/CSS backgrounds transparent if using CSS blur.
3. Use CSS blur when targeting only iOS 15+ static toolbar overlays.
4. Use native blur via Cordova plugin to insert `UIVisualEffectView` for real system blur + Liquid Glass look.
5. Use the same blur styles (`systemThinMaterial` etc.) that Apple’s toolbars use to preserve visual correctness.

---

### 🔚 TL;DR

**Yes—you can mimic system blur in Cordova—but only via one of two paths:**

* **CSS backdrop-filter trick** (lightweight, web-only blur)
* **Native blur plugin** (true iOS material blur with UIBlurEffect)

Choose based on your design fidelity needs and legacy support requirements. Let me know if you’d like a full Cordova plugin boilerplate containing Swift/Objective-C and JavaScript bridge!

[7]: https://blog.csdn.net/littleFish_ZYY/article/details/131068847?utm_source=chatgpt.com "iOS-透明的webView 原创 - CSDN博客"
[8]: https://github.com/lifeofcoding/cordova-blur-app-privacy-screen?utm_source=chatgpt.com "lifeofcoding/cordova-blur-app-privacy-screen - GitHub"

# Real system blur for meteorjs ios26

If you're building a **virtual toolbar** in Meteor.js that uses **iOS‑style system blur**, here’s exactly how you can implement it—whether your app runs in a browser **or** in a built Meteor‑Cordova mobile app on iOS:

---

## 1. Meteor + Native iOS Blur (real UIVisualEffectView)

Meteor bundles Cordova for iOS builds, so you can install a native blur effect inside your Cordova WebView using a plugin that wraps `UIVisualEffectView` / `UIBlurEffect.Style.system...Material`.

### ✅ Step‑by‑Step for Meteor

#### A. Add iOS as a mobile platform

```shell
meteor add-platform ios
```

Meteor 1.3+ will install Cordova automatically ✔️
([Kyle Howells][1])

#### B. Install a native blur plugin

There are a few options; for instance:

* `cordova-plugin-blurred‑snapshot`: blurs only the snapshot used in the app switcher.
* Custom plugin that mounts `UIVisualEffectView` directly beneath your toolbar inside `CDVWebView`.

You’d add one with:

```js
meteor add cordova:cordova-plugin-blurred-snapshot@0.1.3
```

or for an unlisted plugin:

```js
meteor add cordova:com.your.blurplugin@https://your‑git‑url.git#commit-sha
```

([npm.io][2])

#### C. Configure plugin in **mobile-config.js**

```js
App.configurePlugin('cordova-plugin-blur‑snapshot', {
  // hypothetical API, if the plugin supports style config at build time
  style: 'systemMaterial', // or systemThinMaterial, etc.
});
```

If changing build‑time config, remember to remove the `.meteor/local/cordova‑build/` directory and rebuild to apply changes.
([Meteor Fan][3])

#### D. Use it inside your Meteor app

```js
if (Meteor.isCordova && Meteor.isIOS) {
  Meteor.startup(() => {
    // inside Cordova, `cordova` is automatically exposed globally
    cordova.plugins.blurSnapshot.addBlurredSnapshot(); // just an example API
    // hook toolbar fade‑out to call removeBlurredSnapshot if needed
  });
}
```

Use the native blur only when running under Meteor-isCordova to avoid errors in browser builds.
([Stack Overflow][4])

#### E. Transparent WebView = Blur Reveals Underneath

In **Info.plist**, typically set:

```xml
<key>WKWebView</key>
<true/>
<key>UIViewControllerBasedStatusBarAppearance</key><true/>
```

Ensure your toolbar `<div>` has `background: transparent;` so the native blur is visible behind it—plain CSS only won’t move the blur beneath.

---

## 2. CSS‑Only Blur for Meteor Web / Mobile Web (Fallback)

When system blur isn’t available (e.g. desktop, Android, server‑side rendering, PWA):

```css
.myToolbar {
  background: rgba(white, 0.7);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
```

Safari requires the `-webkit-` prefix first
([Reddit][5])

To improve cross‑browser support, wrap in `@supports (backdrop-filter: blur(1px))`, and offer fallback like `background: hsla(0, 0%, 100%, 0.9)`.

⚠️ On mobile devices, especially **iOS**, mixing `backface-visibility: hidden` with `backdrop-filter` can break blur. A common workaround is to isolate the blur onto a `::before` pseudo‑element with negative `z‑index`. Still, performance drops with scrollbar animations.
([Reddit][6])

---

## 3. Example: Unified Vue‑/Blaze‑Component Code

Inside your Meteor template/React component:

```js
Template.Toolbar.onRendered(function(){
  const el = this.find('.toolbar');
  if (Meteor.isCordova && Meteor.isIOS) {
    cordova.plugins.blurSnapshot.addBlurredSnapshot();
  } else if (window.CSS?.supports('backdrop-filter', 'blur(1px)')) {
    el.classList.add('css-blur');
  } else {
    el.classList.add('solid-bg');
  }
});
```

```css
.toolbar {
  position: fixed;
  top: 0;
  width: 100%;
  height: 56px;
  z-index: 100;
}
.css-blur {
  background: rgba(255,255,255,0.6);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
.solid-bg {
  background: #ffffff;
  opacity: 0.96;
}
```

---

## 4. Choosing Blur Styles (iOS 13+)

iOS now ships adaptive styles like `.systemUltraThinMaterial`, `.systemThinMaterial`, `.systemMaterial`, `.systemThickMaterial`, `.systemChromeMaterial`. These automatically adapt to light/dark system appearance.

Your Cordova plugin can choose one via build config or runtime (if advanced).

Sample code in Swift:

```swift
let blur = UIBlurEffect(style: .systemMaterial)
let vev = UIVisualEffectView(effect: blur)
view.insertSubview(vev, belowSubview: webView)
```

This matches Apple’s toolbar style exactly.
([Kyle Howells][1], [GitHub][7])

---

## 5. Pitfalls to Watch

| Issue                                                       | Workaround                                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| iOS snapshots in App Switcher show plaintext before re-blur | Use `cordova-plugin-blurred-snapshot` or similar to blur on `pause`.             |
| Meteor mobile-config.plugin changes not applied             | Must delete `.meteor/local/cordova-build` folder and rebuild.                    |
| CSS blur is CPU intensive on scroll                         | Limit `.css-blur` to fixed toolbars, avoid nested filters.                       |
| Browser degrades style on blur + backface                   | Use dedicated pseudo-element or disable blur entirely via `@supports not (...)`. |

---

## TL;DR Summary

* 🌐 For **web or PWA**, use CSS `backdrop-filter` as fallback.
* 📱 For **Meteor‑Cordova on iOS**, preferably use native `UIVisualEffectView` via a Cordova blur plugin.
* Structure via **Meteor.isCordova** / **Meteor.startup** to separate native and web code paths.
* Always configure and rebuild properly via `mobile-config.js`.
* Use CSS blur sparingly due to performance concerns.
  ([GitHub][7], [GitHub][8], [Reddit][9], [Kyle Howells][1])
  ([Kyle Howells][1])
  ([GitHub][10], [Meteor Fan][3], [Stack Overflow][11])

Let me know if you’d like help wiring a custom Cordova blur plugin directly into your toolbar component!

[9]: https://www.reddit.com/r/jailbreak/comments/g66b2m?utm_source=chatgpt.com "[Release] BlurGround - A nice background blur on your home & lock screen."
[10]: https://github.com/meteor/meteor/wiki/Meteor-Cordova-Phonegap-integration/593fa0bf0b5ea2a9f0cdd321f012d2a261030530?utm_source=chatgpt.com "Meteor Cordova Phonegap integration · meteor/meteor Wiki · GitHub"
[11]: https://stackoverflow.com/questions/33863161/is-there-a-meteor-equivalent-to-cordova-exec?utm_source=chatgpt.com "Is there a Meteor equivalent to cordova.exec? - Stack Overflow"

# how to use ios26 native Toolbars in meteorjs?

To get **true iOS 26 Liquid‑Glass toolbars** in a Meteor app, you'll need to combine **Meteor’s Cordova-based iOS build** with **custom native code**. Here’s how you can build a native toolbar that blends perfectly with iOS 26 design, floating above your app content in true system blur style.

---

## 🧪 Quick Overview: Why custom native code is required

* **Meteor.js builds iOS apps with Cordova**, which by default runs in a full-screen `WKWebView`. WebView content cannot show the real system blur behind (it only supports CSS `backdrop-filter`).
* Apple now applies Liquid Glass automatically to `UIVisualEffectView` effects like `.systemMaterial` on iOS 26 — those are no longer static blur but dynamically adaptive glass surfaces ([iPhone Developers][1]).
* To display an **iOS-native toolbar**, not just a visual mimic, you must insert a **UIToolbar** (or retrofit `UINavigationBar`) into the native view hierarchy *outside* the WebView. This is accomplished via a **Cordova plugin** or custom native patch.

---

## ⚙️ Step-by-step implementation

### 1. Enable Cordova iOS Platform in Meteor

```bash
meteor add-platform ios
meteor npm install --save cordova-plugin-statusbar  # Optional if toolbars need safe‑area
```

Ensure your `mobile-config.js` sets up full‑screen & transparency:

```js
App.setPreference('StatusBarOverlaysWebView', 'true');
App.setPreference('WKWebViewOnly', 'true');
```

Meteor will rebuild automatically once native changes are in place.

### 2. Create or integrate a Cordova plugin

You can build a minimal plugin (Swift or Objective‑C) that adds a toolbar above the WebView:

**Objective‑C skeleton** (in `Plugin.m`):

```objc
- (void)pluginInitialize {
  UIView *parent = self.webView.superview;
  UIToolbar *toolBar = [[UIToolbar alloc] init];
  toolBar.translatesAutoresizingMaskIntoConstraints = NO;

  UIBlurEffect *effect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemMaterial];
  UIVisualEffectView *bg = [[UIVisualEffectView alloc] initWithEffect:effect];
  bg.translatesAutoresizingMaskIntoConstraints = NO;
  [toolBar setBackgroundImage:nil forToolbarPosition:UIToolbarPositionAny barMetrics:UIBarMetricsDefault];
  [toolBar addSubview:bg];
  [toolBar setTranslucent:YES];
  
  [parent addSubview:toolBar];
  // Auto-layout: pin leading/trailing/safe‑bottom; fixed height ≈ 44pt

  // Native system blurs on iOS 26 now render as Liquid Glass (dynamic and layered) :contentReference[oaicite:8]{index=8}.
}
```

Hook toolbar button actions over JavaScript via `cordova.exec` to link into your Meteor UI.

### 3. Toolbar appearance config (iOS 26 only)

```objc
if (@available(iOS 26, *)) {
  // SystemMaterial now renders as Glass
  UIBlurEffect *glass = [UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemMaterial];
  UIVisualEffectView *effectView = [[UIVisualEffectView alloc] initWithEffect:glass];
  [toolBar insertSubview:effectView atIndex:0];
  effectView.frame = toolBar.bounds;
  effectView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
}
```

This yields the same **floating, refractive toolbar** Apple uses for iOS 26 protoned toolbars and pop‑over bars ([Medium][2]).

### 4. JavaScript bridge to control the toolbar

Inside a `.js` file in your plugin:

```js
exports.showToolbar = function(strings, win, fail) {
  cordova.exec(win, fail, 'LiquidToolbar', 'show', []);
};
exports.hideToolbar = function(success, fail) {
  cordova.exec(success, fail, 'LiquidToolbar', 'hide', []);
};
```

From your Meteor code:

```js
if (Meteor.isCordova && /iPhone|iPad/.test(navigator.userAgent)) {
  Meteor.startup(() => {
    cordova.plugins.liquidToolbar.showToolbar();
  });
}
```

### 5. Safe-area & content underlap

* **Allow content to scroll *behind* the toolbar** so the glass effect “refracts” the page beneath it.
* In CSS:

  ```css
  body, html { 
    background: transparent; 
    padding-bottom: 88px;   /* leave room for toolbar and possible accessory */
    margin: 0;
  }
  ```

* In native code: ensure the WebView is non‑opaque (`webView.opaque = NO`) so the glass effect blends behind it.

---

## 🧠 Fallback: for non‑iOS26 / browser builds, CSS blur

Use CSS-only fallback to keep toolbar visibility on browser/PWA:

```css
.toolbar {
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  background: rgba(255,255,255,0.65);
}
```

Wrap in `@supports (backdrop-filter: blur(1px)) { … }` and provide a solid-color fallback for older iOS or Android.

---

## 🗂 Summary table

| Requirement                             | Native toolbar (iOS 26) via plugin      | CSS fallback (browser or old iOS) |
| --------------------------------------- | --------------------------------------- | --------------------------------- |
| True system blur / Liquid Glass effect  | ✅ via `UIBlurEffectStyleSystemMaterial` | ❌ just CSS blur (static)          |
| Rounded, floating toolbar style         | ✅ yes, via native `UIToolbar`           | ❌ static rectangle                |
| Smooth scroll-edge behavior             | ✅ handled by WebView + native blur      | ❌ may stutter under scroll        |
| Integration with Meteor hot code reload | ✅ via Cordova native rebuild            | ✅ live CSS                        |
| Provision for older OS compatibility    | ✅ add code guards and fallback          | ✅ CSS by default                  |

---

## ✅ Final checklist

* \[x] Build using the `ios` platform (`meteor add‑platform ios`)
* \[x] Place a custom Cordova plugin (Swift/Obj‑C) that inserts `UIToolbar` over the WebView
* \[x] Use `UIVisualEffectView` with `.systemMaterial` on iOS 26 to get the Liquid Glass surface
* \[x] Ensure WebView and HTML are fully transparent to reveal glass blur
* \[x] Provide CSS fallback blur for non‑iOS 26 environments
* \[x] Rebuild Meteor after plugin changes (`meteor run ios-device`)

---

## ⚠️ Additional Design Notes

* On **Beta 3 of iOS 26**, Apple reduced the transparency of toolbars for easier readability — you may want `UIBlurEffectStyleSystemThickMaterial` with a tint or opacity tweak ([reddit.com][3], [en.wikipedia.org][4], [Swift with Majid][5], [reddit.com][6], [stackoverflow.com][7], [swiftprogramming.com][8], [iPhone Developers][1], [reddit.com][9]).
* Apple now treats `.systemMaterial` as context-sensitive Liquid Glass, so avoid manually overriding the blur — let **UIKit handle reflectivity and background adaptivity** ([iPhone Developers][1]).
* **Keep button placement minimal** (≤5 icons), group with toolbar spacer if needed; let `ToolbarItemGroup` API design guide your placement rules even if you build the UI in native code ([Swift with Majid][5]).

---

By combining Meteor’s Cordova bridge with a custom plugin that adds a native toolbar view, you can deliver an experience that looks and behaves identically to Apple’s own iOS 26 UIs — complete with refractive shading, floating glass effects, and dynamic visual refresh. Let me know if you need help generating the full Objective‑C / `.plist` setup or adding swift-based controls into Lighthouse!
