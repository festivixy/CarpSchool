from PIL import Image

# Icon

data = {
    "app_store.png": [1024, 1024],
    "iphone_2x.png": [120, 120],
    "iphone_3x.png": [180, 180],
    "ipad_2x.png": [152, 152],
    "ipad_pro.png": [167, 167],
    "ios_settings_2x.png": [58, 58],
    "ios_settings_3x.png": [87, 87],
    "ios_spotlight_2x.png": [80, 80],
    "ios_spotlight_3x.png": [120, 120],
    "ios_notification_2x.png": [40, 40],
    "ios_notification_3x.png": [60, 60],
    "ipad.png": [76, 76],
    "ios_settings.png": [29, 29],
    "ios_spotlight.png": [40, 40],
    "ios_notification.png": [20, 20],
    "iphone_legacy.png": [57, 57],
    "iphone_legacy_2x.png": [114, 114],
    "ipad_spotlight_legacy.png": [50, 50],
    "ipad_spotlight_legacy_2x.png": [100, 100],
    "ipad_app_legacy.png": [72, 72],
    "ipad_app_legacy_2x.png": [144, 144],
    "android_mdpi.png": [48, 48],
    "android_hdpi.png": [72, 72],
    "android_xhdpi.png": [96, 96],
    "android_xxhdpi.png": [144, 144],
    "android_xxxhdpi.png": [192, 192],
}

maxres = Image.open("resources/maxres.png")
maxres = maxres.convert("RGBA")

white = Image.new("RGBA", maxres.size, (255, 255, 255, 0))

maxres = Image.alpha_composite(white, maxres)

maxres = maxres.convert("RGBA")

for icon, size in data.items():
    print(f"Processing {icon} with size {size}")
    resized = maxres.resize(
        (min(size[0], size[1]), min(size[0], size[1])), Image.LANCZOS
    )
    newImage = Image.new("RGBA", size, (255, 255, 255, 0))
    # paste the resized image onto the new image in the center
    newImage.paste(
        resized, ((size[0] - resized.size[0]) // 2, (size[1] - resized.size[1]) // 2)
    )
    newImage.save(f"resources/icons/{icon}", "PNG")
    print(f"Saved {icon} with size {size[0]}x{size[1]}")
    print(f"  '{icon}': 'resources/icons/{icon}', // {size[0]}x{size[1]} pixels")

# Splash - Handle splash screens differently than icons

data = {
    "ios_universal.png": [2732, 2732],
    "android_universal.png": [288, 288],
}

maxres = Image.open("resources/maxres_splash.png")
maxres = maxres.convert("RGBA")

# Splash screen configuration
splash_logo_scale = 0.25  # Logo should be 25% of screen size
background_color = (255, 255, 255, 255)  # White background (RGBA)

for icon, size in data.items():
    # Calculate logo size (25% of the smallest dimension)
    logo_size = int(min(size[0], size[1]) * splash_logo_scale)

    # Resize logo to appropriate size for splash screen
    resized_logo = maxres.resize((logo_size, logo_size), Image.LANCZOS)

    # Create background with solid color
    newImage = Image.new("RGBA", size, background_color)

    # Center the logo on the background
    paste_x = (size[0] - logo_size) // 2
    paste_y = (size[1] - logo_size) // 2

    # Paste logo with transparency support
    newImage.paste(resized_logo, (paste_x, paste_y), resized_logo)

    newImage.save(f"resources/splash/{icon}", "PNG")
    print(f"Saved {icon} with size {size[0]}x{size[1]} (logo: {logo_size}x{logo_size})")
    print(f"  '{icon}': 'resources/splash/{icon}', // {size[0]}x{size[1]} pixels")

data = {
    "ios_universal_dark.png": [1024, 1024]
}

maxres = Image.open("resources/maxres_splash_dark.png")
maxres = maxres.convert("RGBA")

# Dark mode splash screen configuration
dark_background_color = (0, 0, 0, 255)  # Black background for dark mode (RGBA)

for icon, size in data.items():
    # Calculate logo size (25% of the smallest dimension)
    logo_size = int(min(size[0], size[1]) * splash_logo_scale)

    # Resize logo to appropriate size for splash screen
    resized_logo = maxres.resize((logo_size, logo_size), Image.LANCZOS)

    # Create dark background
    newImage = Image.new("RGBA", size, dark_background_color)

    # Center the logo on the background
    paste_x = (size[0] - logo_size) // 2
    paste_y = (size[1] - logo_size) // 2

    # Paste logo with transparency support
    newImage.paste(resized_logo, (paste_x, paste_y), resized_logo)

    newImage.save(f"resources/splash/{icon}", "PNG")
    print(f"Saved {icon} with size {size[0]}x{size[1]} (logo: {logo_size}x{logo_size})")
    print(f"  '{icon}': 'resources/splash/{icon}', // {size[0]}x{size[1]} pixels")

# Public PWA Icons - Copy from resources/icons to public/ directory

public_icon_mapping = {
    # Source file from resources/icons -> Target file in public/
    "app_store.png": "public/icon-1024x1024.png",
    "iphone_3x.png": ["public/icon-180x180.png", "public/apple-touch-icon.png"],
    "ipad_2x.png": "public/icon-152x152.png",
    "android_xxxhdpi.png": "public/icon-192x192.png",
    "iphone_2x.png": "public/icon-120x120.png",
    "android_xxhdpi.png": "public/icon-144x144.png",
    "android_xhdpi.png": "public/icon-96x96.png",
    "ios_spotlight_2x.png": "public/icon-80x80.png",
    "ipad_app_legacy.png": "public/icon-72x72.png",
    "ios_settings_2x.png": "public/icon-58x58.png",
    "iphone_legacy.png": "public/icon-57x57.png",
    "android_mdpi.png": "public/icon-48x48.png",
    "ios_spotlight.png": "public/icon-40x40.png",
    "ios_settings.png": "public/icon-29x29.png"
}

print("\n# Public PWA Icons")
for source_icon, target_path in public_icon_mapping.items():
    source_path = f"resources/icons/{source_icon}"

    # Handle multiple target files (like apple-touch-icon.png)
    target_paths = target_path if isinstance(target_path, list) else [target_path]

    for target in target_paths:
        try:
            # Copy file using PIL to ensure consistency
            img = Image.open(source_path)
            img.save(target, "PNG")
            print(f"Copied {source_icon} -> {target}")
        except Exception as e:
            print(f"Failed to copy {source_icon} -> {target}: {e}")

print(f"\n✅ Updated {len([t for targets in public_icon_mapping.values() for t in (targets if isinstance(targets, list) else [targets])])} public PWA icons")
