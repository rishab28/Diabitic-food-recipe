import os
from PIL import Image, ImageDraw, ImageFont

images = [
    "/Users/rishabsayrta/.gemini/antigravity/brain/1630c167-8422-4888-a921-b3afed0e1a98/ad_thali_premium_1781771853282.png",
    "/Users/rishabsayrta/.gemini/antigravity/brain/1630c167-8422-4888-a921-b3afed0e1a98/ad_sweet_guiltfree_1781771893831.png",
    "/Users/rishabsayrta/.gemini/antigravity/brain/1630c167-8422-4888-a921-b3afed0e1a98/ad_trust_woman_1781771926884.png"
]

output_dir = "/Users/rishabsayrta/Downloads/Diabetes and healthy Food/Final_Ads"
os.makedirs(output_dir, exist_ok=True)

# Find bold font
font_paths = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial Bold.ttf"
]
font_path = None
for p in font_paths:
    if os.path.exists(p):
        font_path = p
        break

def get_fit_font(text, max_width, initial_size, font_path):
    size = initial_size
    font = ImageFont.truetype(font_path, size)
    # create dummy draw
    dummy_img = Image.new('RGB', (10, 10))
    d = ImageDraw.Draw(dummy_img)
    
    while size > 10:
        bbox = d.textbbox((0, 0), text, font=font)
        w = bbox[2] - bbox[0]
        if w <= max_width:
            return font
        size -= 2
        font = ImageFont.truetype(font_path, size)
    return font

for i, img_path in enumerate(images):
    if not os.path.exists(img_path):
        continue
        
    original = Image.open(img_path)
    w, h = original.size
    
    # We will CREATE A FRAME around the image so we don't cover the photo!
    # Top banner height: 200px, Bottom banner height: 150px
    top_h = int(h * 0.20)
    bot_h = int(h * 0.15)
    
    new_h = h + top_h + bot_h
    new_img = Image.new('RGB', (w, new_h), color=(255, 255, 255))
    
    # Paste original in the middle
    new_img.paste(original, (0, top_h))
    
    draw = ImageDraw.Draw(new_img)
    
    # Draw Top Banner Background
    draw.rectangle([0, 0, w, top_h], fill=(220, 38, 38)) # Red
    
    # Draw Bottom Banner Background
    draw.rectangle([0, new_h - bot_h, w, new_h], fill=(234, 179, 8)) # Yellow
    
    if i == 1:
        text1 = "DIABETIC FRIENDLY? YES."
        text2 = "100+ GUILT-FREE RECIPES"
    else:
        text1 = "100+ DIABETIC-FRIENDLY"
        text2 = "INDIAN RECIPES"
        
    # Draw Text 1 (Top Banner Line 1)
    f1 = get_fit_font(text1, w * 0.9, 100, font_path)
    bb1 = draw.textbbox((0,0), text1, font=f1)
    w1 = bb1[2] - bb1[0]
    h1 = bb1[3] - bb1[1]
    
    # Draw Text 2 (Top Banner Line 2)
    f2 = get_fit_font(text2, w * 0.9, 80, font_path)
    bb2 = draw.textbbox((0,0), text2, font=f2)
    w2 = bb2[2] - bb2[0]
    h2 = bb2[3] - bb2[1]
    
    # Center text vertically in the top banner
    total_text_h = h1 + h2 + 20
    start_y = (top_h - total_text_h) / 2
    
    draw.text(((w - w1) / 2, start_y), text1, font=f1, fill=(255,255,255))
    draw.text(((w - w2) / 2, start_y + h1 + 20), text2, font=f2, fill=(255,255,255))
    
    # Draw Bottom Text
    text_bot = "80% OFF - OFFER ENDS TONIGHT"
    fb = get_fit_font(text_bot, w * 0.9, 90, font_path)
    bbb = draw.textbbox((0,0), text_bot, font=fb)
    wb = bbb[2] - bbb[0]
    hb = bbb[3] - bbb[1]
    
    draw.text(((w - wb) / 2, new_h - bot_h + (bot_h - hb) / 2 - 10), text_bot, font=fb, fill=(0,0,0))
    
    # Save
    name = os.path.basename(img_path).replace(".png", "_pro.jpg")
    output_path = os.path.join(output_dir, name)
    new_img.save(output_path, quality=95)

print("Professional Ads generated in", output_dir)
