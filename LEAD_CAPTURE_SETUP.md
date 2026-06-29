# Google Sheets Lead Capture Setup Guide
*How to automatically capture checkout leads and exit-intent signups in real-time (100% Free)*

Our landing pages now capture the **Name, WhatsApp, and Email** of users when they click checkout or try to exit the page. Follow these simple steps to save these leads automatically to a Google Sheet:

---

## Step 1: Create Your Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a **Blank Spreadsheet**.
2. Add these headers to the first row (A1 to E1):
   *   **Column A:** `Timestamp`
   *   **Column B:** `Name`
   *   **Column C:** `WhatsApp`
   *   **Column D:** `Email`
   *   **Column E:** `Page URL`

---

## Step 2: Add the Webhook Script
1. In your Google Sheet menu, click **Extensions ➔ Apps Script**.
2. Delete any code in the editor and paste the following Google Apps Script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse form parameters
    var name = e.parameter.name || "";
    var phone = e.parameter.phone || "";
    var email = e.parameter.email || "";
    var url = e.parameter.url || "";
    
    // Append a new row with lead details
    sheet.appendRow([
      new Date(),
      name,
      "'" + phone, // Prepended quote prevents scientific number formatting
      email,
      url
    ]);
    
    return ContentService.createTextOutput("Success");
  } catch(err) {
    // Fail-safe: Log error to Sheet so you know it failed
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      sheet.appendRow([new Date(), "ERROR: " + err.message]);
    } catch(sheetErr) {}
    
    return ContentService.createTextOutput("Error: " + err.message);
  }
}
```

---

## Step 3: Deploy the Script as a Web App
1. At the top right of the Apps Script page, click **Deploy ➔ New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Configure the settings exactly like this:
   *   **Description:** `Secret Swap Lead Capture`
   *   **Execute as:** `Me (your email address)`
   *   **Who has access:** `Anyone` *(Crucial: This must be 'Anyone' so the website can post leads without needing Google login!)*
4. Click **Deploy**.
5. Google will ask you to authorize access. Click **Authorize Access**, select your Gmail account, click **Advanced**, and then click **Go to Untitled project (unsafe)** to grant permissions.
6. Copy the **Web app URL** generated (it will look like `https://script.google.com/macros/s/XXXXX/exec`).

---

## Step 4: Link It to Your Website
1. Open the file `lead_capture.js` in your workspace.
2. Go to line 9 and replace the placeholder `WEBHOOK_URL` with your new Google Web app URL:
   ```javascript
   const WEBHOOK_URL = "PASTE_YOUR_COPIED_URL_HERE";
   ```
3. Commit and push the changes to GitHub. Vercel will auto-update.

Now, whenever anyone enters details on the checkout popup or the exit intent discount popup, their data will pop up inside your Google Sheet in real-time! 🚀📈
