import os
import glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Setup paths
workspace_dir = "/Users/rishabsayrta/Downloads/Diabetes and healthy Food"
output_dir = os.path.join(workspace_dir, "Final_Ads")
os.makedirs(output_dir, exist_ok=True)

# Image paths
thali_img_path = "/Users/rishabsayrta/.gemini/antigravity/brain/1630c167-8422-4888-a921-b3afed0e1a98/ad_thali_premium_1781771853282.png"
sweet_img_path = "/Users/rishabsayrta/.gemini/antigravity/brain/1630c167-8422-4888-a921-b3afed0e1a98/ad_sweet_guiltfree_1781771893831.png"
woman_img_path = "/Users/rishabsayrta/.gemini/antigravity/brain/1630c167-8422-4888-a921-b3afed0e1a98/ad_trust_woman_1781771926884.png"
mockup_img_path = os.path.join(workspace_dir, "ebook_mockup.png")

# Font paths
heading_font_path = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
body_font_path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
body_reg_font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"

def add_drop_shadow(image, offset=(10, 10), background_color=(0,0,0,0), shadow_color=(0,0,0,100), iterations=3):
    """Creates a beautiful soft drop shadow around an image."""
    # Create a shadow canvas
    shadow = Image.new('RGBA', (image.size[0] + offset[0] * 2, image.size[1] + offset[1] * 2), background_color)
    # Draw solid shadow shape
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rectangle([offset[0], offset[1], offset[0] + image.size[0], offset[1] + image.size[1]], fill=shadow_color)
    # Blur the shadow
    for _ in range(iterations):
        shadow = shadow.filter(ImageFilter.BLUR)
    # Paste image on top
    shadow.paste(image, (offset[0] - 5, offset[1] - 5), image.convert('RGBA') if image.mode == 'RGBA' else None)
    return shadow

def draw_rounded_rectangle(draw, xy, corner_radius, fill=None, outline=None, width=1):
    """Draws a rounded rectangle on the image."""
    draw.rounded_rectangle(xy, radius=corner_radius, fill=fill, outline=outline, width=width)

def generate_ad_1():
    """Ad 1: Split Screen/Guilt-Free Sweet Concept"""
    if not os.path.exists(sweet_img_path):
        print("Sweet image not found!")
        return
    
    # Load base sweet image (1024x1024)
    base = Image.open(sweet_img_path).convert("RGBA")
    w, h = base.size
    
    # Create drawing layer
    overlay = Image.new("RGBA", (w, h), (0,0,0,0))
    draw = ImageDraw.Draw(overlay)
    
    # Draw top glassmorphic banner for headline
    # Top 220px banner with 80% opacity dark slate
    draw_rounded_rectangle(draw, [20, 20, w - 20, 220], 16, fill=(15, 23, 42, 225), outline=(249, 115, 22, 100), width=2)
    
    # Fonts
    f_title = ImageFont.truetype(heading_font_path, 46)
    f_subtitle = ImageFont.truetype(body_reg_font_path, 22)
    f_badge = ImageFont.truetype(body_font_path, 18)
    
    # Title Text
    title_text = "YES, YOU CAN EAT SWEETS!"
    t_w = draw.textbbox((0,0), title_text, font=f_title)[2]
    draw.text(((w - t_w)//2, 45), title_text, font=f_title, fill=(255, 255, 255))
    
    # Subtitle Text
    sub_text = "100+ Low-GI, Diabetic-Friendly Indian Dessert & Meal Recipes"
    s_w = draw.textbbox((0,0), sub_text, font=f_subtitle)[2]
    draw.text(((w - s_w)//2, 105), sub_text, font=f_subtitle, fill=(203, 213, 225))
    
    # Stars and trust rating
    stars_text = "⭐ ⭐ ⭐ ⭐ ⭐  4.9/5 Rating (14,200+ Indian Families)"
    st_w = draw.textbbox((0,0), stars_text, font=f_badge)[2]
    draw.text(((w - st_w)//2, 155), stars_text, font=f_badge, fill=(250, 204, 21)) # Yellow gold
    
    # Danger vs Solution Badges in the center of the image
    # We will draw a Comparison Box overlay in the middle-bottom
    box_y = 650
    draw_rounded_rectangle(draw, [40, box_y, w - 40, box_y + 200], 16, fill=(15, 23, 42, 235), outline=(255, 255, 255, 40), width=2)
    
    f_comp = ImageFont.truetype(body_font_path, 26)
    f_comp_desc = ImageFont.truetype(body_reg_font_path, 18)
    
    # Left Column: Unhealthy
    draw.text((80, box_y + 40), "❌ Regular Sweets", font=f_comp, fill=(239, 68, 68))
    draw.text((80, box_y + 90), "• Spikes Blood Sugar (250+)\n• Loaded with Refined Sugar\n• Post-meal guilt & fatigue", font=f_comp_desc, fill=(241, 245, 249))
    
    # Vertical line separator
    draw.line([w//2, box_y + 20, w//2, box_y + 180], fill=(255, 255, 255, 40), width=2)
    
    # Right Column: Healthy
    draw.text((w//2 + 60, box_y + 40), "✅ Our Guilt-Free Recipes", font=f_comp, fill=(16, 185, 129))
    draw.text((w//2 + 60, box_y + 90), "• Under 110 Sugar (Low GI)\n• Made with Natural Sweeteners\n• 100% Home-Cooked & Safe", font=f_comp_desc, fill=(241, 245, 249))
    
    # Bottom Action Bar (Bright Red/Yellow urgency banner)
    bot_y = 900
    draw_rounded_rectangle(draw, [20, bot_y, w - 20, bot_y + 100], 16, fill=(220, 38, 38, 255))
    
    f_btn = ImageFont.truetype(body_font_path, 30)
    btn_text = "GET INSTANT ACCESS @ ₹299 (80% OFF) 👉"
    btn_w = draw.textbbox((0,0), btn_text, font=f_btn)[2]
    draw.text(((w - btn_w)//2, bot_y + 32), btn_text, font=f_btn, fill=(255, 255, 255))
    
    # Add Book Mockup in the lower corner of the image
    # Let's scale and paste ebook mockup
    if os.path.exists(mockup_img_path):
        mockup = Image.open(mockup_img_path).convert("RGBA")
        mockup = mockup.resize((220, 220))
        # Rotate slightly
        mockup_rot = mockup.rotate(12, expand=True, resample=Image.BICUBIC)
        # Paste it
        base.paste(mockup_rot, (w - 240, box_y - 150), mockup_rot)
        
    # Combine base and overlays
    final_img = Image.alpha_composite(base, overlay).convert("RGB")
    final_img.save(os.path.join(output_dir, "ad_sweet_pro.jpg"), "JPEG", quality=95)
    print("Generated Ad 1: Guilt-Free Sweet Concept")

def generate_ad_2():
    """Ad 2: Thali Showcase with Floating Ebook & Social Proof"""
    if not os.path.exists(thali_img_path):
        print("Thali image not found!")
        return
        
    base = Image.open(thali_img_path).convert("RGBA")
    w, h = base.size
    
    overlay = Image.new("RGBA", (w, h), (0,0,0,0))
    draw = ImageDraw.Draw(overlay)
    
    # Top Banner
    draw_rounded_rectangle(draw, [20, 20, w - 20, 200], 16, fill=(15, 23, 42, 230), outline=(249, 115, 22, 120), width=2)
    
    f_title = ImageFont.truetype(heading_font_path, 40)
    f_sub = ImageFont.truetype(body_reg_font_path, 22)
    
    title_text = "STOP COOKING SEPARATE MEALS!"
    t_w = draw.textbbox((0,0), title_text, font=f_title)[2]
    draw.text(((w - t_w)//2, 45), title_text, font=f_title, fill=(249, 115, 22)) # Orange title
    
    sub_text = "100+ Delicious Low-GI Indian Recipes The Whole Family Can Eat Together"
    s_w = draw.textbbox((0,0), sub_text, font=f_sub)[2]
    draw.text(((w - s_w)//2, 115), sub_text, font=f_sub, fill=(241, 245, 249))
    
    # Left side: Key Benefit Pills
    f_pill = ImageFont.truetype(body_font_path, 20)
    benefits = [
        ("💚 100% Diabetic-Friendly", (16, 185, 129)),
        ("🌾 Made with Low-GI Grains", (16, 185, 129)),
        ("⏱️ Ready in under 30 Mins", (16, 185, 129)),
        ("👩‍⚕️ Clinically Approved Guidelines", (16, 185, 129))
    ]
    
    p_y = 260
    for text, color in benefits:
        # Draw pill container
        t_w = draw.textbbox((0,0), text, font=f_pill)[2]
        draw_rounded_rectangle(draw, [40, p_y, 40 + t_w + 40, p_y + 50], 25, fill=(15, 23, 42, 230), outline=(255, 255, 255, 40), width=1)
        draw.text((60, p_y + 12), text, font=f_pill, fill=(255, 255, 255))
        p_y += 70
        
    # Right side: Floating 3D Mockup
    if os.path.exists(mockup_img_path):
        mockup = Image.open(mockup_img_path).convert("RGBA")
        mockup = mockup.resize((380, 380))
        mockup_rot = mockup.rotate(-8, expand=True, resample=Image.BICUBIC)
        
        # Draw a subtle circular glow behind the mockup
        glow = Image.new("RGBA", (500, 500), (0,0,0,0))
        glow_draw = ImageDraw.Draw(glow)
        glow_draw.ellipse([50, 50, 450, 450], fill=(249, 115, 22, 40))
        glow = glow.filter(ImageFilter.BLUR).filter(ImageFilter.BLUR)
        base.paste(glow, (w - 520, 240), glow)
        
        # Paste the mockup
        base.paste(mockup_rot, (w - 420, 280), mockup_rot)
        
    # Social Proof box in the bottom left
    sp_y = 750
    draw_rounded_rectangle(draw, [40, sp_y, 480, sp_y + 110], 16, fill=(15, 23, 42, 235), outline=(250, 204, 21, 100), width=2)
    f_sp_title = ImageFont.truetype(body_font_path, 20)
    f_sp_sub = ImageFont.truetype(body_reg_font_path, 16)
    
    draw.text((60, sp_y + 20), "⭐⭐⭐⭐⭐  5-Star Reviewed", font=f_sp_title, fill=(250, 204, 21))
    draw.text((60, sp_y + 55), "\"HbA1c levels went down from 8.2 to 6.4!\"\n- Ramesh K., New Delhi", font=f_sp_sub, fill=(226, 232, 240))
    
    # Bottom Call to Action
    bot_y = 900
    draw_rounded_rectangle(draw, [20, bot_y, w - 20, bot_y + 100], 16, fill=(234, 179, 8, 255)) # Yellow CTA
    f_btn = ImageFont.truetype(body_font_path, 30)
    btn_text = "DOWNLOAD DIABETIC RECIPE BOOK - ₹299"
    btn_w = draw.textbbox((0,0), btn_text, font=f_btn)[2]
    # Draw dark slate text on yellow button
    draw.text(((w - btn_w)//2, bot_y + 32), btn_text, font=f_btn, fill=(15, 23, 42))
    
    # Save
    final_img = Image.alpha_composite(base, overlay).convert("RGB")
    final_img.save(os.path.join(output_dir, "ad_thali_pro.jpg"), "JPEG", quality=95)
    print("Generated Ad 2: Premium Thali Showcase")

def generate_ad_3():
    """Ad 3: Trust & Mother/Woman Portrait with Ebook Bundle"""
    if not os.path.exists(woman_img_path):
        print("Woman image not found!")
        return
        
    base = Image.open(woman_img_path).convert("RGBA")
    w, h = base.size
    
    overlay = Image.new("RGBA", (w, h), (0,0,0,0))
    draw = ImageDraw.Draw(overlay)
    
    # Top header banner
    draw_rounded_rectangle(draw, [20, 20, w - 20, 190], 16, fill=(15, 23, 42, 225), outline=(16, 185, 129, 100), width=2)
    
    f_title = ImageFont.truetype(heading_font_path, 42)
    f_sub = ImageFont.truetype(body_font_path, 20)
    
    title_text = "Healthy Indian Food For Diabetics"
    t_w = draw.textbbox((0,0), title_text, font=f_title)[2]
    draw.text(((w - t_w)//2, 45), title_text, font=f_title, fill=(255, 255, 255))
    
    sub_text = "🇮🇳 CLINICALLY APPROVED LOW-GI RECIPES FOR INDIAN FAMILIES"
    s_w = draw.textbbox((0,0), sub_text, font=f_sub)[2]
    draw.text(((w - s_w)//2, 115), sub_text, font=f_sub, fill=(16, 185, 129)) # Trust green
    
    # Overlay Box with benefits on the left side
    box_y = 540
    draw_rounded_rectangle(draw, [40, box_y, 500, box_y + 320], 16, fill=(15, 23, 42, 235), outline=(255, 255, 255, 40), width=2)
    
    f_list_title = ImageFont.truetype(body_font_path, 24)
    f_list_item = ImageFont.truetype(body_reg_font_path, 20)
    
    draw.text((60, box_y + 30), "What You Are Getting:", font=f_list_title, fill=(250, 204, 21))
    
    items = [
        "✔️ 100+ Easy, Tasty Recipes",
        "✔️ No Bland Food or Starvation",
        "✔️ Multi-grain Rotis & Curries",
        "✔️ Guilt-Free Sweets & Snacks",
        "✔️ 20-Year Expert Guided Nutrition"
    ]
    
    item_y = box_y + 85
    for item in items:
        draw.text((60, item_y), item, font=f_list_item, fill=(241, 245, 249))
        item_y += 42
        
    # Right side: Ebook Mockup
    if os.path.exists(mockup_img_path):
        mockup = Image.open(mockup_img_path).convert("RGBA")
        mockup = mockup.resize((350, 350))
        mockup_rot = mockup.rotate(6, expand=True, resample=Image.BICUBIC)
        base.paste(mockup_rot, (w - 410, 480), mockup_rot)
        
    # Urgent Call to Action Banner
    bot_y = 900
    draw_rounded_rectangle(draw, [20, bot_y, w - 20, bot_y + 100], 16, fill=(220, 38, 38, 255))
    
    f_btn = ImageFont.truetype(body_font_path, 28)
    btn_text = "🔥 GET THE BUNDLE FOR ₹299 (SAVE 80% TODAY)"
    btn_w = draw.textbbox((0,0), btn_text, font=f_btn)[2]
    draw.text(((w - btn_w)//2, bot_y + 32), btn_text, font=f_btn, fill=(255, 255, 255))
    
    # Save
    final_img = Image.alpha_composite(base, overlay).convert("RGB")
    final_img.save(os.path.join(output_dir, "ad_trust_pro.jpg"), "JPEG", quality=95)
    print("Generated Ad 3: Trust Concept")

# Execute
generate_ad_1()
generate_ad_2()
generate_ad_3()
print("All professional ads generated successfully!")
