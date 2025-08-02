from PIL import Image

# Icon

data = {'app_store.png': (1024, 1024), 'iphone_2x.png': (120, 120), 'iphone_3x.png': (180, 180), 'ipad_2x.png': (152, 152), 'ipad_pro.png': (167, 167), 'ios_settings_2x.png': (58, 58), 'ios_settings_3x.png': (87, 87), 'ios_spotlight_2x.png': (80, 80), 'ios_spotlight_3x.png': (120, 120), 'ios_notification_2x.png': (40, 40), 'ios_notification_3x.png': (60, 60), 'ipad.png': (76, 76), 'ios_settings.png': (29, 29), 'ios_spotlight.png': (40, 40), 'ios_notification.png': (20, 20), 'iphone_legacy.png': (57, 57), 'iphone_legacy_2x.png': (114, 114), 'ipad_spotlight_legacy.png': (50, 50), 'ipad_spotlight_legacy_2x.png': (100, 100), 'ipad_app_legacy.png': (72, 72), 'ipad_app_legacy_2x.png': (144, 144), 'android_mdpi.png': (48, 48), 'android_hdpi.png': (72, 72), 'android_xhdpi.png': (96, 96), 'android_xxhdpi.png': (144, 144), 'android_xxxhdpi.png': (192, 192)}

maxres = Image.open('resources/maxres.png')
maxres = maxres.convert('RGBA')

white = Image.new('RGBA', maxres.size, (255, 255, 255, 0))

maxres = Image.alpha_composite(white, maxres)

maxres = maxres.convert('RGBA')

for icon, size in data.items():
    print(f"Processing {icon} with size {size}")
    resized = maxres.resize((min(size[0], size[1]), min(size[0], size[1])), Image.ANTIALIAS)
    newImage = Image.new('RGBA', size, (255, 255, 255, 0))
    # paste the resized image onto the new image in the center
    newImage.paste(resized, ((size[0] - resized.size[0]) // 2, (size[1] - resized.size[1]) // 2))
    newImage.save(f'resources/icons/{icon}', 'PNG')
    print(f"Saved {icon} with size {size[0]}x{size[1]}")
    print(f"  '{icon}': 'resources/icons/{icon}', // {size[0]}x{size[1]} pixels")

# Splash

data = {"ios_universal.png": (2732, 2732), "ios_universal_3x.png": (2208, 2208), "android_universal.png": (320, 480)}

maxres = Image.open('resources/maxres_splash.png')
maxres = maxres.convert('RGBA')

for icon, size in data.items():
    resized = maxres.resize((min(size[0], size[1]), min(size[0], size[1])), Image.ANTIALIAS)
    newImage = Image.new('RGBA', size, (255, 255, 255, 0))
    # paste the resized image onto the new image in the center
    newImage.paste(resized, ((size[0] - resized.size[0]) // 2, (size[1] - resized.size[1]) // 2))
    newImage.save(f'resources/splash/{icon}', 'PNG')
    print(f"Saved {icon} with size {size[0]}x{size[1]}")
    print(f"  '{icon}': 'resources/splash/{icon}', // {size[0]}x{size[1]} pixels")