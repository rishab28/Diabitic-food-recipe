import re

with open("make_ads_pro.py", "r") as f:
    content = f.read()

# Replace price
content = content.replace("₹299", "₹499")

# Replace emojis
content = content.replace("⭐ ⭐ ⭐ ⭐ ⭐", "5-STAR:")
content = content.replace("⭐⭐⭐⭐⭐", "5-STAR:")
content = content.replace("❌", "WARNING:")
content = content.replace("✅", "SAFE:")
content = content.replace("👉", ">>")
content = content.replace("💚 ", "")
content = content.replace("🌾 ", "")
content = content.replace("⏱️ ", "")
content = content.replace("👩‍⚕️ ", "")
content = content.replace("🇮🇳 ", "")
content = content.replace("✔️", "-")
content = content.replace("🔥 ", "")

with open("make_ads_pro.py", "w") as f:
    f.write(content)

print("Fixed make_ads_pro.py")
