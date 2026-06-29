/**
 * Secret Swap Funnel - Lead Capture & Exit Intent System
 * Author: Priya & KhaduFarm Tech Team
 * Description: Captures names, WhatsApp numbers, and emails of abandoning users
 * and checkout clickers before redirecting them to payment.
 */

(function() {
  // CONFIGURATION: Set your webhook URL here (e.g. Google Sheets web app, Make.com, or Zapier)
  const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzS-uN0X4Y-Yq56p0a-G7dYfU_1-WwP2x4t_YtK-k2XgK5R2zG-m94n_TqQ3G0k_w/exec"; // Placeholder/Default
  
  let targetPaymentUrl = "";
  let leadModalInjected = false;

  // Injected CSS Styles
  const style = document.createElement('style');
  style.innerHTML = `
    .lead-backdrop {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      padding: 15px;
    }
    .lead-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }
    .lead-modal {
      background: #FFFFFF;
      width: 100%;
      max-width: 480px;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
      overflow: hidden;
      transform: scale(0.9);
      transition: transform 0.3s ease;
      position: relative;
      border: 1px solid rgba(255, 112, 32, 0.1);
    }
    .lead-backdrop.active .lead-modal {
      transform: scale(1);
    }
    .lead-header {
      background: linear-gradient(135deg, #FF7020, #FF5500);
      color: #FFFFFF;
      padding: 25px 20px;
      text-align: center;
      position: relative;
    }
    .lead-header.exit-theme {
      background: linear-gradient(135deg, #10B981, #059669);
    }
    .lead-header h3 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 800;
      font-family: 'Outfit', 'Inter', sans-serif;
    }
    .lead-header p {
      margin: 5px 0 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }
    .lead-close {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(0,0,0,0.15);
      border: none;
      color: white;
      font-size: 1.2rem;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: background 0.2s;
    }
    .lead-close:hover {
      background: rgba(0,0,0,0.3);
    }
    .lead-body {
      padding: 30px 25px;
    }
    .lead-form-group {
      margin-bottom: 20px;
      text-align: left;
    }
    .lead-form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
      margin-bottom: 6px;
    }
    .lead-input {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid #CBD5E1;
      border-radius: 10px;
      font-size: 0.95rem;
      transition: border-color 0.2s;
      outline: none;
      color: #1E293B;
    }
    .lead-input:focus {
      border-color: #FF7020;
    }
    .lead-header.exit-theme ~ .lead-body .lead-input:focus {
      border-color: #10B981;
    }
    .lead-submit-btn {
      width: 100%;
      background: #FF7020;
      color: white;
      border: none;
      padding: 14px;
      font-size: 1.1rem;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(255, 112, 32, 0.3);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .lead-submit-btn:hover {
      background: #E05300;
      transform: translateY(-2px);
    }
    .lead-header.exit-theme ~ .lead-body .lead-submit-btn {
      background: #10B981;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
    }
    .lead-header.exit-theme ~ .lead-body .lead-submit-btn:hover {
      background: #059669;
    }
    .lead-trust {
      text-align: center;
      font-size: 0.75rem;
      color: #64748B;
      margin-top: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
  `;
  document.head.appendChild(style);

  // Injects Modal Elements to DOM
  function injectModal() {
    if (leadModalInjected) return;
    
    const modalHtml = `
      <div class="lead-backdrop" id="leadBackdrop">
        <div class="lead-modal">
          <div class="lead-header" id="leadHeader">
            <button class="lead-close" id="leadCloseBtn">&times;</button>
            <h3 id="leadTitle">⚡ Complete Your Order</h3>
            <p id="leadSubtitle">Enter details to proceed to secure payment gateway</p>
          </div>
          <div class="lead-body">
            <form id="leadForm">
              <div class="lead-form-group">
                <label>Your Name / Aapka Naam</label>
                <input type="text" id="leadName" class="lead-input" placeholder="e.g. Neha Sharma" required />
              </div>
              <div class="lead-form-group">
                <label>WhatsApp Number (10 digits)</label>
                <input type="tel" id="leadPhone" class="lead-input" placeholder="e.g. 9876543210" pattern="[6-9][0-9]{9}" required />
              </div>
              <div class="lead-form-group">
                <label>Email Address</label>
                <input type="email" id="leadEmail" class="lead-input" placeholder="e.g. name@email.com" required />
              </div>
              
              <button type="submit" class="lead-submit-btn" id="leadSubmitBtn">
                Proceed to Secure Payment →
              </button>
              
              <div class="lead-trust">
                🔒 Protected by Indian DPDP Act 2023. We never share your data.
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div);
    
    // Bind Events
    document.getElementById('leadCloseBtn').addEventListener('click', closeLeadModal);
    document.getElementById('leadBackdrop').addEventListener('click', function(e) {
      if (e.target === this) closeLeadModal();
    });
    document.getElementById('leadForm').addEventListener('submit', handleLeadSubmit);
    
    leadModalInjected = true;
  }

  function openLeadModal(destinationUrl, isExitIntent = false) {
    injectModal();
    targetPaymentUrl = destinationUrl;
    
    const backdrop = document.getElementById('leadBackdrop');
    const header = document.getElementById('leadHeader');
    const title = document.getElementById('leadTitle');
    const subtitle = document.getElementById('leadSubtitle');
    const submitBtn = document.getElementById('leadSubmitBtn');
    
    if (isExitIntent) {
      header.classList.add('exit-theme');
      title.innerHTML = "🎁 Wait! Get 1 Free Guide + ₹100 Off!";
      subtitle.innerHTML = "Enter details to grab this discount code immediately!";
      submitBtn.innerHTML = "Claim My Gift & Proceed →";
    } else {
      header.classList.remove('exit-theme');
      title.innerHTML = "⚡ Complete Your Order";
      subtitle.innerHTML = "Enter details to proceed to secure payment gateway";
      submitBtn.innerHTML = "Proceed to Secure Payment →";
    }
    
    backdrop.classList.add('active');
    
    // Facebook Lead Event Tracking (Optional placeholder)
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout');
    }
  }

  function closeLeadModal() {
    const backdrop = document.getElementById('leadBackdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
    }
  }

  function handleLeadSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('leadName').value.strip ? document.getElementById('leadName').value.strip() : document.getElementById('leadName').value;
    const phone = document.getElementById('leadPhone').value;
    const email = document.getElementById('leadEmail').value;
    
    const payload = {
      name: name,
      phone: phone,
      email: email,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Save lead locally as fallback
    localStorage.setItem('funnel_lead', JSON.stringify(payload));
    
    // Post to Google Sheet / Webhook asynchronously
    if (WEBHOOK_URL && !WEBHOOK_URL.includes("placeholder")) {
      fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors", // Bypasses CORS blocks
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }).catch(err => console.log("Webhook fail:", err));
    }
    
    // Facebook Lead Capture Event
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_name: 'Funnel Checkout Click',
        value: 0.00,
        currency: 'INR'
      });
    }

    closeLeadModal();

    // Proceed to payment after brief timeout (to allow asynchronous fetch call to fire)
    setTimeout(function() {
      window.location.href = targetPaymentUrl;
    }, 150);
  }

  // --- EXIT INTENT TRIGGER LOGIC ---
  let exitIntentTriggered = false;
  
  function triggerExitIntent() {
    if (exitIntentTriggered) return;
    
    // Check if user already submitted lead
    if (localStorage.getItem('funnel_lead')) return;
    
    exitIntentTriggered = true;
    
    // Define discount link based on page
    let exitUrl = "https://superprofile.bio/vp/FUIMWaYB?checkout=true"; // default
    if (window.location.href.includes("kids/index-en.html")) {
      exitUrl = "https://superprofile.bio/vp/FUIMWaYB?discountCode=KIDS50";
    } else if (window.location.href.includes("kids")) {
      exitUrl = "https://superprofile.bio/vp/FUIMWaYB?discountCode=KIDS50";
    } else {
      exitUrl = "https://superprofile.bio/vp/FUIMWaYB?discountCode=KHADU50";
    }
    
    openLeadModal(exitUrl, true);
  }

  // 1. Desktop Exit Intent (Mouse leaves top of window)
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 20) {
      triggerExitIntent();
    }
  });

  // 2. Mobile Exit Intent (Back button intercept hack)
  // Push state so we can catch popstate (back click)
  window.addEventListener('load', function() {
    setTimeout(function() {
      history.pushState({ exitIntent: true }, "", window.location.href);
    }, 1000);
  });
  
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.exitIntent) {
      // User is clicking back, intercept and show exit modal
      triggerExitIntent();
      // Push state again so they can exit next time
      history.pushState(null, "", window.location.href);
    }
  });

  // 3. Mobile/Tablet Inactivity Timer (18 seconds)
  let idleTime = 0;
  const idleInterval = setInterval(function() {
    idleTime += 1;
    if (idleTime >= 18) {
      triggerExitIntent();
      clearInterval(idleInterval);
    }
  }, 1000);

  // Reset idle timer on user activity
  const resetTimer = () => { idleTime = 0; };
  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('keypress', resetTimer);
  document.addEventListener('touchstart', resetTimer);
  document.addEventListener('scroll', resetTimer);

  // --- INTERCEPT ALL CHECKOUT CTA BUTTONS ---
  function hookCheckoutButtons() {
    const buttons = document.querySelectorAll('a');
    buttons.forEach(function(btn) {
      const href = btn.getAttribute('href') || "";
      if (href.includes("superprofile.bio") && !btn.id.includes("exitCTA")) {
        // Change click behavior
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          openLeadModal(href, false);
        });
      }
    });
  }

  // Hook buttons immediately and periodically (to catch dynamic buttons)
  window.addEventListener('DOMContentLoaded', hookCheckoutButtons);
  setTimeout(hookCheckoutButtons, 1000);
  setTimeout(hookCheckoutButtons, 3000);

})();
