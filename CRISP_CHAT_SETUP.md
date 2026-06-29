# Crisp Live Chat Setup Guide (Shopify Inbox Alternative)
*How to set up a free live chat widget so users can message you without leaving your landing pages.*

We have integrated the official **Crisp.chat** widget into your funnel pages via `lead_capture.js`. By default, a demo chat widget will load on the bottom-right corner. Follow these steps to connect it to your own free account so you can chat with visitors directly from your phone or laptop!

---

## Step 1: Create a Free Crisp Account
1. Go to [Crisp.chat](https://crisp.chat) and click **Sign Up**.
2. Create your account and enter your website domain (e.g. `secretswapvaults.vercel.app`).
3. Complete the setup wizard. You will be redirected to the Crisp Dashboard.

---

## Step 2: Get Your Website ID
1. In the Crisp Dashboard, click the **Settings** gear icon in the bottom-left sidebar.
2. Select **Website Settings** (then click on your website name).
3. Click on **Setup Instructions**.
4. Copy the **Website ID** (it will look like a UUID, e.g. `e4a77059-e93d-4c3e-89a1-d85f8fb95b77`).

---

## Step 3: Insert Your Website ID
1. Open the file `lead_capture.js` in your workspace.
2. Go to **line 15** and replace the demo UUID with your new copied Website ID:
   ```javascript
   const CRISP_WEBSITE_ID = "PASTE_YOUR_CRISP_WEBSITE_ID_HERE";
   ```
3. Save, commit, and push the changes to GitHub. Vercel will rebuild automatically.

---

## Step 4: Download the Mobile App 📱
1. Go to the App Store (iOS) or Play Store (Android) and search for **Crisp - Live Chat**.
2. Log in using the credentials you created in Step 1.
3. Turn on Push Notifications!

Now, whenever a visitor lands on any page of your sales funnel, they will see a beautiful chat bubble. When they type a message, **your phone will ring instantly** via the Crisp app, and you can chat with them live on-the-go, just like Shopify Inbox! 🚀💬
