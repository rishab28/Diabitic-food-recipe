"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// FAQ data mapping
const faqs = [
  {
    q: 'Why is this guide called "diabetic-friendly"?',
    a: 'Every recipe in this guide systematically replaces high-GI (Glycemic Index) ingredients with nutrient-dense, fiber-rich, low-GI alternatives. This means glucose is released slowly into your bloodstream instead of causing sudden spikes. For example, we replace white rice with cauliflower rice or brown rice, maida with almond flour or ragi, and white sugar with stevia or monk fruit sweetener.'
  },
  {
    q: 'Are these recipes safe for the whole family — including children?',
    a: 'Absolutely yes! These are wholesome, nutritious Indian meals that are healthy for everyone — including children, teenagers, and elderly family members. There are no harmful ingredients. In fact, many families tell us their kids prefer these recipes because they taste great while being more nutritious than regular versions.'
  },
  {
    q: 'I don\'t know how to cook fancy food. Are these recipes simple?',
    a: 'Very simple! Every recipe is designed for regular Indian home kitchens. We use ordinary ingredients available at your local sabzi mandi or grocery store. Each recipe has step-by-step instructions with photos, exact measurements, prep time (most are under 30 minutes), and difficulty rating. If you can make basic dal-chawal, you can make every recipe in this book.'
  },
  {
    q: 'Will this replace my diabetes medication?',
    a: 'This recipe guide is NOT a replacement for medical treatment or prescribed medication. It is a dietary support tool designed to help you make better food choices. Many users report improved blood sugar readings which may lead to medication adjustments — but any changes to your medication must be discussed with your doctor. Always consult your physician before making dietary changes.'
  },
  {
    q: 'What format is the recipe book in? Can I read it on my phone?',
    a: 'The recipe book is delivered as a high-quality PDF file that you can read on any device — smartphone, tablet, laptop, or desktop computer. It\'s optimized for mobile reading so you can use it in your kitchen while cooking. You can also print specific recipes if you prefer a physical copy.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes! We offer a 100% money-back guarantee for 7 days from the date of purchase. If you\'re not completely satisfied with the recipe bundle, simply send us a message on WhatsApp and we\'ll process your complete refund within 24-48 hours. No questions asked, no hassle.'
  },
  {
    q: 'What is the difference between the Starter, Pro, and Premium plans?',
    a: 'The Starter plan (₹299) includes the core 100+ recipe eBook with full nutrition details. The Pro Bundle (₹499) adds the 30-Day Meal Planner, Smart Grocery Lists, GI Food Cheat Sheet, Dining Out Guide, and Herbal Drinks recipes — everything you need for a complete lifestyle change. The Premium Masterclass (₹999) is the ultimate package, adding Private WhatsApp Community access, Lifetime Free Recipe Updates, a Sugar-Free Indian Sweets eBook, a Custom Macro Calculator, and the 15-Minute Fast Cooking Guide. It is by far the highest value package for serious transformations.'
  },
  {
    q: 'How quickly will I receive the recipes after payment?',
    a: 'Instantly! Within 60 seconds of your payment, you will receive the complete PDF bundle on both your WhatsApp number and email address. You can start reading and cooking immediately.'
  },
  {
    q: 'Is this guide suitable for Type 1 Diabetes?',
    a: 'While the recipes are designed primarily for Type 2 Diabetes and Pre-diabetes management, the low-GI, nutrient-dense meals are beneficial for anyone with blood sugar concerns. Always consult your endocrinologist for Type 1 specific dietary guidance.'
  },
  {
    q: 'Can I get a physical printed copy?',
    a: 'Currently, this is available as a digital PDF only. However, you can easily print it at home or at any local print shop. Many of our customers print their favorite recipe pages and keep them in the kitchen for quick reference.'
  }
];

// FOMO data arrays
const fomoNames = ['Priya S.', 'Sunita R.', 'Arvind K.', 'Anjali M.', 'Deepak J.', 'Manish T.', 'Kiran P.', 'Preeti D.', 'Suresh V.', 'Vikas G.', 'Amit S.', 'Neha B.', 'Rajesh N.', 'Meena L.', 'Pooja C.'];
const fomoCities = ['Mumbai', 'Delhi NCR', 'Pune', 'Jaipur', 'Bangalore', 'Ludhiana', 'Ahmedabad', 'Indore', 'Hyderabad', 'Chennai', 'Kolkata', 'Gurugram', 'Noida', 'Lucknow', 'Chandigarh'];
const fomoPlans = ['Pro Bundle', 'Starter plan', 'Premium Masterclass'];

export default function Home() {
  const [countdown, setCountdown] = useState('23:59:59');
  const [viewerCount, setViewerCount] = useState(47);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [exitOverlayVisible, setExitOverlayVisible] = useState(false);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  
  // Scroll progress state
  const [scrollWidth, setScrollWidth] = useState(0);

  // FOMO state
  const [fomoVisible, setFomoVisible] = useState(false);
  const [fomoData, setFomoData] = useState({ name: 'Priya S.', city: 'Mumbai', plan: 'Pro Bundle', time: '2 minutes ago' });

  // Countup stats
  const [stats, setStats] = useState({ families: 2847, states: 15, stable: 94, rating: 4.9 });
  const [problemStats, setProblemStats] = useState({ diabetes: 101, spikes: 70, change: 1 });

  const heroRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  // Scroll & Timer & Viewers & Exit Intent
  useEffect(() => {
    // 1. Countdown timer
    let endTime = localStorage.getItem('offerEndTime');
    if (!endTime || Number(endTime) <= Date.now()) {
      const newEnd = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('offerEndTime', newEnd.toString());
      endTime = newEnd.toString();
    }

    const timerInterval = setInterval(() => {
      let diff = Number(endTime) - Date.now();
      if (diff <= 0) {
        const newEnd = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('offerEndTime', newEnd.toString());
        diff = newEnd - Date.now();
      }
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    }, 1000);

    // 2. Viewer count fluctuation
    const viewerInterval = setInterval(() => {
      setViewerCount(Math.floor(Math.random() * (67 - 34 + 1)) + 34);
    }, 4000);

    // 3. Scroll listener for sticky CTA & scroll progress
    const handleScroll = () => {
      // Scroll Progress calculation
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollWidth(progress);

      if (!heroRef.current) return;
      const heroRect = heroRef.current.getBoundingClientRect();
      const pricingRect = pricingRef.current?.getBoundingClientRect();

      const pastHero = heroRect.bottom < 0;
      const pricingVisible = pricingRect && pricingRect.top < window.innerHeight && pricingRect.bottom > 0;

      setStickyBarVisible(pastHero && !pricingVisible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 4. Exit Intent handler (desktop only)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0 && !sessionStorage.getItem('exitShown')) {
        setExitOverlayVisible(true);
        sessionStorage.setItem('exitShown', '1');
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    // 5. FOMO notifications loop
    const triggerFomo = () => {
      const name = fomoNames[Math.floor(Math.random() * fomoNames.length)];
      const city = fomoCities[Math.floor(Math.random() * fomoCities.length)];
      const plan = fomoPlans[Math.floor(Math.random() * fomoPlans.length)];
      const mins = Math.floor(Math.random() * 8) + 1;

      setFomoData({
        name,
        city,
        plan,
        time: `${mins} minute${mins > 1 ? 's' : ''} ago`
      });
      setFomoVisible(true);

      setTimeout(() => {
        setFomoVisible(false);
      }, 5000);
    };

    const fomoTimeout = setTimeout(() => {
      triggerFomo();
      const fomoInterval = setInterval(triggerFomo, 22000);
      return () => clearInterval(fomoInterval);
    }, 10000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(viewerInterval);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(fomoTimeout);
    };
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(prev => (prev === index ? null : index));
  };

  const closeExitModal = () => {
    setExitOverlayVisible(false);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setExitOverlayVisible(false);
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-[#060608] text-[#f1f5f9] font-sans selection:bg-[#f97316] selection:text-white antialiased">
      
      {/* 1. SCROLL PROGRESS BAR */}
      <div 
        className="fixed top-0 left-0 h-1 bg-[#f97316] z-[1000] transition-all duration-100" 
        style={{ width: `${scrollWidth}%` }} 
      />

      {/* 2. EXIT INTENT MODAL */}
      {exitOverlayVisible && (
        <>
          <div className="exit-intent-overlay show" onClick={closeExitModal} />
          <div className="exit-intent-modal show">
            <button className="exit-modal-close" onClick={closeExitModal}>&times;</button>
            <div className="exit-modal-emoji">🛑</div>
            <h3>Ruk Jaiye! Apne Pariwaar Ki Sehat Mat Chhodiye</h3>
            <p>Don't leave your family's health to chance. Use this special code for an exclusive discount:</p>
            <div className="exit-modal-discount">
              <span className="discount-label">Your Exclusive Code:</span>
              <span className="discount-code">HEALTHYFAMILY</span>
              <span className="discount-value">Extra 15% OFF on any plan</span>
            </div>
            <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="btn btn-primary btn-lg btn-pulse">
              Claim My Discount Now →
            </a>
            <p className="exit-modal-subtext">⏰ This code expires in 10 minutes</p>
          </div>
        </>
      )}

      {/* 3. TOP ANNOUNCEMENT BAR */}
      <div className="top-bar-alert">
        🚨 LAST CHANCE: 50% OFF launch price expires in <span className="countdown-timer">{countdown}</span>. Price increases to ₹999 tomorrow.
      </div>

      {/* 4. HERO SECTION */}
      <section className="hero" id="hero" ref={heroRef}>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">⚡ Trusted by 2,847+ Diabetic Families Across India</div>

            <h1 className="hero-title">
              End the Days of Cooking <span>"Separate Meals"</span> for the Diabetic in Your Family.
            </h1>

            <p className="hero-subtitle">
              Now, your entire family can sit at the same table and enjoy the exact same <strong>delicious Indian food</strong> — using <strong>100+ recipes</strong> designed to keep blood sugar completely stable. Ready in under 30 minutes. <strong>2,847+ families have already switched.</strong> It's your turn.
            </p>

            <div className="hero-cta-row">
              <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="btn btn-primary btn-lg btn-pulse" id="heroCTA">
                Get My Recipe Bundle — ₹499
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '8px', display: 'inline' }}>
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </a>
              <a href="#inside" onClick={(e) => handleSmoothScroll(e, '#inside')} className="btn btn-secondary">See What's Inside</a>
            </div>

            <div className="hero-trust">
              <div className="hero-trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline', marginRight: '4px' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Instant WhatsApp Delivery
              </div>
              <div className="hero-trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline', marginRight: '4px' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                UPI, Cards & Paytm Accepted
              </div>
              <div className="hero-trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline', marginRight: '4px' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                7-Day Money-Back Guarantee
              </div>
            </div>

            <div className="hero-social-proof">
              <div className="avatar-stack">
                <span style={{ background: '#f97316' }}>R</span>
                <span style={{ background: '#10b981' }}>S</span>
                <span style={{ background: '#3b82f6' }}>A</span>
                <span style={{ background: '#f59e0b' }}>K</span>
                <span style={{ background: '#ef4444' }}>M</span>
              </div>
              <div className="proof-text"><strong>2,847+</strong> families already cooking healthier</div>
            </div>
          </div>

          <div className="hero-image">
            <Image src="/ebook_mockup.png" alt="100+ Diabetic Friendly Indian Recipes eBook" width={420} height={525} priority className="object-contain" />
            <div className="hero-float-card card-1">
              <span className="emoji">🩸</span>
              <div>
                <strong>Diabetic Friendly</strong>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Low GI Ingredients</div>
              </div>
            </div>
            <div className="hero-float-card card-2">
              <span className="emoji">🛡️</span>
              <div>
                <strong>7-Day Guarantee</strong>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>100% Money Back</div>
              </div>
            </div>
            <div className="hero-guarantee-badge">✅ Risk-Free Purchase</div>
          </div>
        </div>
      </section>

      {/* 5. CREDIBILITY BAR */}
      <div className="credibility-bar">
        <div className="container">
          <div className="credibility-row">
            <div className="cred-item">🩸 <span>100%</span> Diabetic-Friendly</div>
            <div className="cred-item">👨‍⚕️ Reviewed by <span>Certified Dietitians</span></div>
            <div className="cred-item">⏱️ Prep Under <span>30 Minutes</span></div>
            <div className="cred-item">🛡️ <span>7-Day</span> Money-Back Guarantee</div>
          </div>
        </div>
      </div>

      {/* 6. HOW IT WORKS */}
      <section className="how-it-works" id="howItWorks">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>Simple Process</span>
          <h2 className="section-title-center font-bold">Start Cooking Healthier in 3 Simple Steps</h2>
          <p className="section-desc-center">No complicated diet plans. No expensive ingredients. Just pick, cook, and enjoy.</p>

          <div className="steps-grid">
            <div className="step-card revealed">
              <div className="step-number">1</div>
              <h4 className="font-bold">Choose Your Bundle</h4>
              <p>Pick the Starter, Pro, or Premium plan based on your family's health goals. All plans include the full recipe eBook.</p>
            </div>
            <div className="step-card revealed">
              <div className="step-number">2</div>
              <h4 className="font-bold">Get Instant Delivery</h4>
              <p>Receive your complete recipe bundle on WhatsApp & Email within 60 seconds of payment. Open on any device.</p>
            </div>
            <div className="step-card revealed">
              <div className="step-number">3</div>
              <h4 className="font-bold">Cook Your First Meal Tonight</h4>
              <p>Follow the simple step-by-step instructions and cook a delicious, blood-sugar-friendly meal for your entire family.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FUTURE PACING */}
      <section className="future-pacing" id="futurePacing">
        <div className="container">
          <div className="pacing-box revealed">
            <div className="pacing-content">
              <span className="section-tag">Imagine This...</span>
              <h2 className="font-bold">Picture This: It's 30 Days From Now...</h2>
              <p>Your morning fasting sugar reads <strong>110 mg/dL</strong> instead of 200+. Your family is eating the same dal, roti, and sabzi — but cooked with smart substitutions that keep glucose stable.</p>
              <p>Your doctor looks at your HbA1c report and says, <em>"Whatever you're doing, keep doing it."</em></p>
              <p>You didn't give up Indian food. You didn't spend thousands on exotic ingredients. You simply <strong>cooked it differently</strong> — and everything changed.</p>
              <div className="pacing-quote">
                "The best medicine is the food that doesn't feel like medicine." — Every happy family using this guide
              </div>
              <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="btn btn-primary btn-pulse" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                Start My Transformation →
              </a>
            </div>
            <div className="pacing-img">
              <Image src="/hero_thali.png" alt="Healthy diabetic-friendly Indian thali with balanced nutrition" width={480} height={360} loading="lazy" className="rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. PROBLEM SECTION */}
      <section className="problem-sec" id="problem">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>The Silent Crisis</span>
          <h2 className="section-title-center font-bold">Diabetes Is Stealing the Joy of Indian Food</h2>
          <p className="section-desc-center">India is the diabetes capital of the world. But the real tragedy? Most families don't realize their everyday cooking is making it worse.</p>

          <div className="problem-stat-bar revealed">
            <div className="problem-stat">
              <div className="stat-number">{problemStats.diabetes}</div>
              <div className="stat-label">Million Indians Have Diabetes</div>
            </div>
            <div className="problem-stat">
              <div className="stat-number">{problemStats.spikes}%</div>
              <div className="stat-label">Don't Know Their Food Causes Spikes</div>
            </div>
            <div className="problem-stat">
              <div className="stat-number">{problemStats.change}</div>
              <div className="stat-label">Simple Change Can Transform Your Health</div>
            </div>
          </div>

          <div className="problem-grid">
            <div className="problem-card revealed">
              <div className="problem-icon">💔</div>
              <h4 className="font-bold">Silent Health Risks</h4>
              <p>Every high-GI meal silently damages your blood vessels, kidneys, and nerves. By the time symptoms show, the damage is often irreversible. Regular white rice and maida-based rotis spike your sugar within minutes.</p>
            </div>
            <div className="problem-card revealed">
              <div className="problem-icon">💉</div>
              <h4 className="font-bold">Dread of Daily Injections</h4>
              <p>The fear of increasing insulin doses haunts every diabetic. Each time you eat food that spikes your sugar, you move closer to higher medication. What if your kitchen could be your pharmacy?</p>
            </div>
            <div className="problem-card revealed">
              <div className="problem-icon">😢</div>
              <h4 className="font-bold">Sadness of Separate Plates</h4>
              <p>Watching your family enjoy parathas, sweets, and festive dishes while you eat bland "diet food" on a separate plate. The loneliness of being the only one eating differently at the table.</p>
            </div>
            <div className="problem-card revealed">
              <div className="problem-icon">😰</div>
              <h4 className="font-bold">Stress of Not Knowing</h4>
              <p>Is this fruit safe? Can I eat this dal? Will this chutney spike my sugar? The constant mental stress of guessing what's safe to eat is exhausting and soul-draining.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA INTERRUPT #1 */}
      <div className="cta-interrupt revealed">
        <div className="container" style={{ textAlign: 'center' }}>
          <h3>Still Cooking Meals That Spike Blood Sugar?</h3>
          <p>Join <strong className="highlight">2,847+ Indian families</strong> who already switched to diabetic-friendly cooking.</p>
          <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="btn btn-primary btn-pulse">Yes, I Want Stable Sugar →</a>
        </div>
      </div>

      {/* 10. TRANSFORMATION SECTION */}
      <section className="transformation" id="transformation">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>The Transformation</span>
          <h2 className="section-title-center font-bold">Before vs. After This Recipe Guide</h2>
          <p className="section-desc-center">See how one simple shift in your kitchen changes everything — from sugar levels to family happiness.</p>

          <div className="trans-grid">
            <div className="trans-panel before revealed">
              <div className="trans-label">❌ Before</div>
              <ul>
                <li>White rice causing sugar spikes after every meal</li>
                <li>Eating bland, tasteless "diet food" alone</li>
                <li>Constantly guessing which foods are safe</li>
                <li>Increasing medication doses every few months</li>
                <li>Missing out on festival sweets and family meals</li>
                <li>Feeling guilty after every meal</li>
              </ul>
            </div>
            <div className="trans-panel after revealed">
              <div className="trans-label">✅ After</div>
              <ul>
                <li>Low-GI grains keeping sugar stable all day</li>
                <li>Entire family enjoying the same delicious meals</li>
                <li>Clear, simple guidance on every ingredient</li>
                <li>Doctor noticing improved HbA1c reports</li>
                <li>Sugar-free sweets for every festival and celebration</li>
                <li>Eating confidently with zero guilt</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 11. WHAT'S INSIDE */}
      <section className="inside-sec" id="inside">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>What's Inside</span>
          <h2 className="section-title-center font-bold">100+ Recipes Across 5 Delicious Categories</h2>
          <p className="section-desc-center">Every recipe includes exact measurements, nutrition info, GI rating, prep time, and step-by-step photos.</p>

          <div className="inside-grid">
            <div className="inside-card revealed">
              <div className="inside-icon">🌅</div>
              <h4 className="font-bold">30+ Breakfasts</h4>
              <p>Poha, Upma, Dosa, Idli, Paratha — all redesigned with low-GI ingredients. Start your morning without sugar spikes.</p>
              <span className="inside-tag">Most Popular</span>
            </div>
            <div className="inside-card revealed">
              <div className="inside-icon">🍛</div>
              <h4 className="font-bold">25+ Lunch & Dinner</h4>
              <p>Dal, Sabzi, Biryani, Pulao, Rajma, Chole — complete meals your whole family will love. No separate cooking needed.</p>
              <span className="inside-tag">Family Favorite</span>
            </div>
            <div className="inside-card revealed">
              <div className="inside-icon">🥜</div>
              <h4 className="font-bold">15+ Low-GI Snacks</h4>
              <p>Mathri, Namkeen, Chaat, Dhokla — guilt-free snacking between meals without worrying about sugar crashes.</p>
              <span className="inside-tag">Tea-Time Hits</span>
            </div>
            <div className="inside-card revealed">
              <div className="inside-icon">🥣</div>
              <h4 className="font-bold">15+ Soups & Salads</h4>
              <p>High-fiber, low-calorie soups and Indian salads that keep you fill for hours and stabilize your blood sugar naturally.</p>
              <span className="inside-tag">Super Healthy</span>
            </div>
            <div className="inside-card revealed">
              <div className="inside-icon">🫓</div>
              <h4 className="font-bold">15+ Rotis & Chutneys</h4>
              <p>Multi-grain rotis, bajra roti, ragi chapati, and healing chutneys that complement every meal and add nutrition.</p>
              <span className="inside-tag">Daily Essentials</span>
            </div>
          </div>

          <div className="recipe-preview revealed" style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Image src="/recipe_grid.png" alt="Preview of diabetic-friendly Indian recipes with nutrition info" width={800} height={450} loading="lazy" className="rounded-xl shadow-lg mx-auto" />
            <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>📸 Actual recipe pages from the eBook — every recipe includes step-by-step photos</p>
          </div>
        </div>
      </section>

      {/* 12. CTA INTERRUPT #2 */}
      <div className="cta-interrupt revealed">
        <div className="container" style={{ textAlign: 'center' }}>
          <h3>100+ Recipes Waiting for Your Kitchen 🍳</h3>
          <p>Every recipe uses <strong>ordinary ingredients</strong> from your local sabzi mandi. No fancy imports needed.</p>
          <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="btn btn-green btn-pulse">Get All 100+ Recipes Now →</a>
        </div>
      </div>

      {/* 13. AUDIENCE SECTION */}
      <section className="audience-sec" id="audience">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>Is This For You?</span>
          <h2 className="section-title-center font-bold">Who This Recipe Bundle Is For</h2>

          <div className="audience-grid">
            <div className="audience-box for-box revealed">
              <h4 className="font-bold">✅ This Is Perfect For You If...</h4>
              <ul>
                <li>You or a family member has Type 2 Diabetes or Pre-diabetes</li>
                <li>You want to cook Indian food that keeps blood sugar stable</li>
                <li>You're tired of eating bland, tasteless "diet food"</li>
                <li>You want the whole family to eat the same healthy meals</li>
                <li>You want recipes using ordinary Indian kitchen ingredients</li>
                <li>You prefer home cooking over expensive meal delivery plans</li>
              </ul>
            </div>
            <div className="audience-box not-for-box revealed">
              <h4 className="font-bold">❌ This Is NOT For You If...</h4>
              <ul>
                <li>You're looking for a medical treatment or cure for diabetes</li>
                <li>You want Western or non-Indian cuisine recipes</li>
                <li>You expect results without actually cooking the recipes</li>
                <li>You're not willing to make small changes in your kitchen</li>
                <li>You think managing diabetes doesn't involve food choices</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 14. VALUE STACK */}
      <section className="value-stack-sec" id="valueStack">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>Total Value</span>
          <h2 className="section-title-center font-bold">Look at Everything You're Getting Today</h2>

          <div className="value-stack-box revealed">
            <div className="value-item">
              <span className="value-name">📘 100+ Diabetic-Friendly Indian Recipe eBook</span>
              <span className="value-price">₹1,999</span>
            </div>
            <div className="value-item">
              <span className="value-name">📅 30-Day Diabetic Meal Planner</span>
              <span className="value-price">₹799</span>
            </div>
            <div className="value-item">
              <span className="value-name">🛒 Smart Grocery Shopping Lists</span>
              <span className="value-price">₹499</span>
            </div>
            <div className="value-item">
              <span className="value-name">📊 GI Food Cheat Sheet</span>
              <span className="value-price">₹399</span>
            </div>
            <div className="value-item">
              <span className="value-name">🍽️ Dining Out Survival Guide</span>
              <span className="value-price">₹299</span>
            </div>
            <div className="value-item">
              <span className="value-name">🍵 Herbal Drinks & Kadha Recipes</span>
              <span className="value-price">₹299</span>
            </div>
            <div className="value-item">
              <span className="value-name">⚡ 15-Minute Fast Cooking Guide</span>
              <span className="value-price">₹499</span>
            </div>
            <div className="value-item total">
              <span className="value-name">Total Value</span>
              <span className="value-price">₹4,793</span>
            </div>
            <div className="value-item today">
              <span className="value-name">🔥 Today's Launch Price (Pro Bundle)</span>
              <span className="value-price today-price">Just ₹499</span>
            </div>
          </div>
        </div>
      </section>

      {/* 14.5 FAST ACTION BONUSES */}
      <section className="bonuses-sec" id="bonuses">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>Fast-Action Bonuses</span>
          <h2 className="section-title-center font-bold">Order Now & Get These FREE Bonuses</h2>
          <p className="section-desc-center" style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>We want to make sure you have absolutely everything you need to succeed. When you upgrade to the Pro or Premium plan, you'll unlock these exclusive bonuses.</p>
          
          <div className="bonuses-grid">
            <div className="bonus-card revealed">
              <div className="bonus-icon">📅</div>
              <div className="bonus-content">
                <div className="bonus-value">Value: ₹999</div>
                <h3 className="font-bold">Bonus #1: 30-Day Meal Planner</h3>
                <p>Takes away the stress of "What should I cook today?" Complete breakfast, lunch, and dinner plans. <em>(Available in Pro & Premium)</em></p>
              </div>
            </div>
            
            <div className="bonus-card revealed">
              <div className="bonus-icon">🥘</div>
              <div className="bonus-content">
                <div className="bonus-value">Value: ₹499</div>
                <h3 className="font-bold">Bonus #2: Sugar-Free Sweets eBook</h3>
                <p>Satisfy your sweet tooth safely without spiking your blood sugar. <em>(Exclusive to Premium)</em></p>
              </div>
            </div>

            <div className="bonus-card revealed">
              <div className="bonus-icon">🛒</div>
              <div className="bonus-content">
                <div className="bonus-value">Value: ₹299</div>
                <h3 className="font-bold">Bonus #3: Smart Grocery Lists</h3>
                <p>Never buy the wrong ingredients again. Print this list and take it to the market. <em>(Available in Pro & Premium)</em></p>
              </div>
            </div>
            
            <div className="bonus-card revealed">
              <div className="bonus-icon">⚡</div>
              <div className="bonus-content">
                <div className="bonus-value">Value: ₹499</div>
                <h3 className="font-bold">Bonus #4: 15-Min Fast Cooking Guide</h3>
                <p>Short on time? Quick recipes and meal prep hacks for busy professionals. <em>(Exclusive to Premium)</em></p>
              </div>
            </div>

            <div className="bonus-card revealed">
              <div className="bonus-icon">📊</div>
              <div className="bonus-content">
                <div className="bonus-value">Value: ₹299</div>
                <h3 className="font-bold">Bonus #5: GI Food Cheat Sheet</h3>
                <p>Know exactly which Indian foods spike your sugar and which are safe. <em>(Available in Pro & Premium)</em></p>
              </div>
            </div>
            
            <div className="bonus-card revealed">
              <div className="bonus-icon">🍽️</div>
              <div className="bonus-content">
                <div className="bonus-value">Value: ₹399</div>
                <h3 className="font-bold">Bonus #6: Dining Out Survival Guide</h3>
                <p>How to order at Indian restaurants without ruining your blood sugar goals. <em>(Available in Pro & Premium)</em></p>
              </div>
            </div>

            <div className="bonus-card revealed">
              <div className="bonus-icon">🍵</div>
              <div className="bonus-content">
                <div className="bonus-value">Value: ₹299</div>
                <h3 className="font-bold">Bonus #7: Herbal Drinks & Kadha Recipes</h3>
                <p>Ancient Ayurvedic morning drinks to naturally stabilize fasting sugar. <em>(Available in Pro & Premium)</em></p>
              </div>
            </div>

            <div className="bonus-card revealed">
              <div className="bonus-icon">💬</div>
              <div className="bonus-content">
                <div className="bonus-value">Value: ₹999</div>
                <h3 className="font-bold">Bonus #8: Private WhatsApp Community</h3>
                <p>Get direct access, ask questions, and share progress with other members. <em>(Exclusive to Premium)</em></p>
              </div>
            </div>

            <div className="bonus-card revealed">
              <div className="bonus-icon">♾️</div>
              <div className="bonus-content">
                <div className="bonus-value">Value: ₹1,499</div>
                <h3 className="font-bold">Bonus #9: Lifetime Free Updates</h3>
                <p>Whenever we add new recipes or guides, you get them for free forever. <em>(Exclusive to Premium)</em></p>
              </div>
            </div>

            <div className="bonus-card revealed">
              <div className="bonus-icon">📱</div>
              <div className="bonus-content">
                <div className="bonus-value">Value: ₹799</div>
                <h3 className="font-bold">Bonus #10: Custom Macro Calculator</h3>
                <p>Easily calculate your exact daily carb, protein, and fat requirements. <em>(Exclusive to Premium)</em></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 15. PRICING SECTION */}
      <section className="pricing-sec">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>Choose Your Plan</span>
          <h2 className="section-title-center font-bold">Invest in Your Family's Health Today</h2>
          <p className="section-desc-center">Every plan comes with instant WhatsApp & Email delivery. 7-Day Money-Back Guarantee on all plans.</p>

          <div className="pricing-grid" id="pricing" ref={pricingRef}>
            {/* STARTER */}
            <div className="price-card revealed">
              <div className="plan-name">🌱 Starter</div>
              <div className="plan-original">₹599</div>
              <div className="plan-price-row">
                <span className="plan-price">₹299</span>
                <span style={{ fontSize: '0.9rem', color: '#64748b', marginLeft: '8px' }}>one-time</span>
              </div>
              <ul className="plan-features">
                <li className="included">✓ 100+ Diabetic-Friendly Recipe eBook</li>
                <li className="included">✓ Complete Nutrition & Carb Details</li>
                <li className="included">✓ Instant WhatsApp + Email Delivery</li>
                <li className="excluded">✗ 30-Day Meal Planner</li>
                <li className="excluded">✗ Smart Grocery Lists</li>
                <li className="excluded">✗ GI Food Cheat Sheet</li>
                <li className="excluded">✗ Dining Out Survival Guide</li>
                <li className="excluded">✗ Herbal Drinks Recipes</li>
                <li className="excluded">✗ 15-Minute Fast Cooking Guide</li>
                <li className="excluded">✗ Private WhatsApp Community Access</li>
                <li className="excluded">✗ Lifetime Free Recipe Updates</li>
                <li className="excluded">✗ Sugar-Free Indian Sweets eBook</li>
                <li className="excluded">✗ Diabetic Custom Macro Calculator</li>
              </ul>
              <Link href="/checkout?plan=starter" className="btn btn-secondary btn-lg plan-cta">Get Starter — ₹299</Link>
              <div className="payment-trust">
                <span>💳</span> <span>📱 UPI</span> <span>🏦 Net Banking</span>
              </div>
            </div>

            {/* PRO (FEATURED) */}
            <div className="price-card featured revealed">
              <div className="plan-badge">🏆 MOST POPULAR — 73% Choose This</div>
              <div className="plan-name">🏆 Pro Bundle</div>
              <div className="plan-original">₹1,299</div>
              <div className="plan-price-row">
                <span className="plan-price discounted">₹499</span>
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1', marginLeft: '8px' }}>one-time</span>
              </div>
              <div className="plan-savings">You save ₹800!</div>
              <ul className="plan-features">
                <li className="included">✓ 100+ Diabetic-Friendly Recipe eBook</li>
                <li className="included">✓ Complete Nutrition & Carb Details</li>
                <li className="included">✓ Instant WhatsApp + Email Delivery</li>
                <li className="included">✓ 30-Day Diabetic Meal Planner</li>
                <li className="included">✓ Smart Grocery Shopping Lists</li>
                <li className="included">✓ GI Food Cheat Sheet</li>
                <li className="included">✓ Dining Out Survival Guide</li>
                <li className="included">✓ Herbal Drinks & Kadha Recipes</li>
                <li className="excluded">✗ 15-Minute Fast Cooking Guide</li>
                <li className="excluded">✗ Private WhatsApp Community Access</li>
                <li className="excluded">✗ Lifetime Free Recipe Updates</li>
                <li className="excluded">✗ Sugar-Free Indian Sweets eBook</li>
                <li className="excluded">✗ Diabetic Custom Macro Calculator</li>
              </ul>
              <Link href="/checkout?plan=pro" className="btn btn-primary btn-lg btn-pulse plan-cta">Get Pro Bundle — ₹499</Link>
              <div className="payment-trust">
                <span>💳</span> <span>📱 UPI</span> <span>🏦 Net Banking</span>
              </div>
            </div>

            {/* PREMIUM */}
            <div className="price-card revealed">
              <div className="plan-name">💎 Premium Masterclass</div>
              <div className="plan-original">₹2,499</div>
              <div className="plan-price-row">
                <span className="plan-price">₹999</span>
                <span style={{ fontSize: '0.9rem', color: '#64748b', marginLeft: '8px' }}>one-time</span>
              </div>
              <div className="plan-savings">You save ₹4,500!</div>
              <ul className="plan-features">
                <li className="included">✓ 100+ Diabetic-Friendly Recipe eBook</li>
                <li className="included">✓ Complete Nutrition & Carb Details</li>
                <li className="included">✓ Instant WhatsApp + Email Delivery</li>
                <li className="included">✓ 30-Day Diabetic Meal Planner</li>
                <li className="included">✓ Smart Grocery Shopping Lists</li>
                <li className="included">✓ GI Food Cheat Sheet</li>
                <li className="included">✓ Dining Out Survival Guide</li>
                <li className="included">✓ Herbal Drinks & Kadha Recipes</li>
                <li className="included">✓ 15-Minute Fast Cooking Guide</li>
                <li className="included">✓ Private WhatsApp Community Access</li>
                <li className="included">✓ Lifetime Free Recipe Updates</li>
                <li className="included">✓ Sugar-Free Indian Sweets eBook</li>
                <li className="included">✓ Diabetic Custom Macro Calculator</li>
              </ul>
              <Link href="/checkout?plan=premium" className="btn btn-secondary btn-lg plan-cta">Get Premium — ₹999</Link>
              <div className="payment-trust">
                <span>💳</span> <span>📱 UPI</span> <span>🏦 Net Banking</span>
              </div>
            </div>
          </div>

          {/* COMPARISON TABLE */}
          <div className="comparison-table-wrap revealed">
            <h3 style={{ textAlign: 'center', margin: '3rem 0 1.5rem', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Quick Comparison</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>🌱 Starter</th>
                    <th className="featured-col">🏆 Pro</th>
                    <th>💎 Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>100+ Recipe eBook</td><td className="check-icon">✓</td><td className="check-icon featured-col">✓</td><td className="check-icon">✓</td></tr>
                  <tr><td>Nutrition & Carb Details</td><td className="check-icon">✓</td><td className="check-icon featured-col">✓</td><td className="check-icon">✓</td></tr>
                  <tr><td>30-Day Meal Planner</td><td className="cross-icon">✗</td><td className="check-icon featured-col">✓</td><td className="check-icon">✓</td></tr>
                  <tr><td>Smart Grocery Lists</td><td className="cross-icon">✗</td><td className="check-icon featured-col">✓</td><td className="check-icon">✓</td></tr>
                  <tr><td>GI Food Cheat Sheet</td><td className="cross-icon">✗</td><td className="check-icon featured-col">✓</td><td className="check-icon">✓</td></tr>
                  <tr><td>Dining Out Survival Guide</td><td className="cross-icon">✗</td><td className="check-icon featured-col">✓</td><td className="check-icon">✓</td></tr>
                  <tr><td>Herbal Drinks Recipes</td><td className="cross-icon">✗</td><td className="check-icon featured-col">✓</td><td className="check-icon">✓</td></tr>
                  <tr><td>15-Min Fast Cooking Guide</td><td className="cross-icon">✗</td><td className="cross-icon featured-col">✗</td><td className="check-icon">✓</td></tr>
                  <tr><td>Private WhatsApp Community</td><td className="cross-icon">✗</td><td className="cross-icon featured-col">✗</td><td className="check-icon">✓</td></tr>
                  <tr><td>Lifetime Free Updates</td><td className="cross-icon">✗</td><td className="cross-icon featured-col">✗</td><td className="check-icon">✓</td></tr>
                  <tr><td>Sugar-Free Sweets eBook</td><td className="cross-icon">✗</td><td className="cross-icon featured-col">✗</td><td className="check-icon">✓</td></tr>
                  <tr><td>Custom Macro Calculator</td><td className="cross-icon">✗</td><td className="cross-icon featured-col">✗</td><td className="check-icon">✓</td></tr>
                  <tr>
                    <td><strong>Price</strong></td>
                    <td><strong>₹299</strong></td>
                    <td className="featured-col"><strong style={{ color: '#f97316', fontSize: '1.1rem' }}>₹499</strong></td>
                    <td><strong>₹999</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 16. RESULTS DASHBOARD */}
      <section className="results-dashboard" id="results">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>Real Impact</span>
          <h2 className="section-title-center font-bold">Our Recipes Are Changing Lives Across India</h2>
          <div className="results-grid">
            <div className="result-item revealed">
              <div className="result-number">{stats.families.toLocaleString('en-IN')}</div>
              <div className="result-label">Happy Families Cooking Healthier</div>
            </div>
            <div className="result-item revealed">
              <div className="result-number">{stats.states}</div>
              <div className="result-label">Indian States Covered</div>
            </div>
            <div className="result-item revealed">
              <div className="result-number">{stats.stable}%</div>
              <div className="result-label">Reported Stable Sugar Levels</div>
            </div>
            <div className="result-item revealed">
              <div className="result-number">{stats.rating} ★</div>
              <div className="result-label">Average Rating from Buyers</div>
            </div>
          </div>
        </div>
      </section>

      {/* 17. TESTIMONIALS SECTION */}
      <section className="testimonials-sec" id="testimonials">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>What Families Say</span>
          <h2 className="section-title-center font-bold">Real Stories from Real Indian Families</h2>

          <div className="review-aggregate revealed">
            <span className="aggregate-rating">4.9</span>
            <span className="aggregate-stars">★★★★★</span>
            <span className="aggregate-count">from 247+ verified reviews</span>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card revealed">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"My husband's fasting sugar dropped from 240 to 115 in just 6 weeks! The recipes are so tasty that my kids also eat the same food. No more cooking separately. This book changed our life."</p>
              <div className="testimonial-result">Fasting Sugar: 240 → 115</div>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#f97316' }}>A</div>
                <div>
                  <strong>Arvind K.</strong>
                  <span className="testimonial-location">Jaipur, Rajasthan</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card revealed">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"As a working mother, I needed quick recipes that are also diabetic-friendly for my father-in-law. These recipes take under 30 minutes and he actually enjoys eating them. Best investment!"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#10b981' }}>S</div>
                <div>
                  <strong>Sunita M.</strong>
                  <span className="testimonial-location">Pune, Maharashtra</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card revealed">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"I was diagnosed pre-diabetic last year. My doctor said 'change your diet or start medication.' I chose this recipe book instead. 4 months later, my HbA1c is back to normal. Doctor is impressed!"</p>
              <div className="testimonial-result">HbA1c: 8.2 → 6.8</div>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#3b82f6' }}>N</div>
                <div>
                  <strong>Neha Sen</strong>
                  <span className="testimonial-location">Delhi NCR</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card revealed">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"The sugar-free sweets section is a game-changer! We made gulab jamun for Diwali and nobody could tell the difference. My mother finally doesn't feel left out during festivals."</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#f59e0b' }}>D</div>
                <div>
                  <strong>Deepak R.</strong>
                  <span className="testimonial-location">Ahmedabad, Gujarat</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card revealed">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"I bought the Pro Bundle and it's worth every rupee. The meal planner saved me so much time. The grocery list feature means I buy exactly what I need — no waste, no confusion."</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#8b5cf6' }}>K</div>
                <div>
                  <strong>Kiran P.</strong>
                  <span className="testimonial-location">Bangalore, Karnataka</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card whatsapp-review revealed">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"Meri mummy ko diabetes hai 10 saal se. Unhone yeh recipes try ki aur unka sugar level pehli baar stable aaya. Bahut bahut shukriya! Poora family ab yahi khana khata hai. 🙏"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#25d366' }}>📱</div>
                <div>
                  <strong>WhatsApp Review</strong>
                  <span className="testimonial-location">Verified Buyer, Lucknow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 18. CTA INTERRUPT #3 */}
      <div className="cta-interrupt revealed">
        <div className="container" style={{ textAlign: 'center' }}>
          <h3>247+ Families Gave Us 4.9 Stars ⭐</h3>
          <p>There's a reason this is India's most loved diabetic recipe guide. <strong className="highlight">See for yourself.</strong></p>
          <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="btn btn-primary btn-pulse">Get My Recipe Bundle →</a>
        </div>
      </div>

      {/* 19. GUARANTEE SECTION */}
      <section className="guarantee-sec" id="guarantee">
        <div className="container">
          <div className="guarantee-box revealed">
            <div className="guarantee-icon">🛡️</div>
            <h2 className="font-bold text-xl md:text-2xl">100% Risk-Free — 7-Day Money-Back Guarantee</h2>
            <p>We're so confident this recipe bundle will transform your family's health that we offer a <strong>complete 7-day money-back guarantee</strong>. If you try the recipes and don't see a difference in your blood sugar readings, or if you're not satisfied for any reason whatsoever — simply message us on WhatsApp and we'll refund every single rupee. No questions asked. No fine print.</p>
            <p><strong>Your risk? Absolutely zero. Your potential gain? A healthier, happier family.</strong></p>
          </div>
        </div>
      </section>

      {/* 20. FAQ SECTION */}
      <section className="faq-sec" id="faq">
        <div className="container">
          <span className="section-tag" style={{ justifyContent: 'center' }}>Common Questions</span>
          <h2 className="section-title-center font-bold">Frequently Asked Questions</h2>

          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(i)}>
                  {faq.q} <span className="faq-icon">{activeFaq === i ? '−' : '+'}</span>
                </button>
                <div className="faq-answer" style={{ maxHeight: activeFaq === i ? '300px' : '0', paddingBottom: activeFaq === i ? '1rem' : '0' }}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 21. FINAL CTA SECTION */}
      <section className="final-cta-sec">
        <div className="container">
          <div className="final-cta-card revealed">
            <h2 className="font-bold text-xl md:text-3xl">Your Family's Health Transformation Starts With One Decision</h2>
            <p>Give yourself and your loved ones the gift of healthy, diabetic-friendly Indian cooking. Start tonight.</p>

            <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="btn btn-primary btn-lg btn-pulse" id="finalCTA">
              Yes, I Want My Family Healthy!
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '8px', display: 'inline' }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>

            <div className="final-urgency">
              ⏳ Launch price from ₹299 — ending tonight. <span className="countdown-timer">{countdown}</span>
            </div>

            <div className="final-scarcity">
              🔥 <span>{viewerCount}</span> people are viewing this page right now
            </div>
          </div>
        </div>
      </section>

      {/* 22. FOOTER */}
      <footer>
        <div className="container">
          <div className="payment-methods">
            <span>💳 Visa</span>
            <span>💳 Mastercard</span>
            <span>📱 UPI</span>
            <span>📱 Paytm</span>
            <span>📱 GPay</span>
            <span>📱 PhonePe</span>
            <span>🏦 Net Banking</span>
          </div>

          <p style={{ marginTop: '1.5rem' }}>© 2026 Diabetic Recipe Bundle. All rights reserved.</p>

          <p className="disclaimer" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
            Disclaimer: This site is not a part of the Facebook website or Facebook Inc. Additionally, this site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.
          </p>

          <div className="disclaimer">
            Medical Disclaimer: The recipes and meal guides provided are for educational purposes only. They do not constitute professional medical advice, diagnosis, or treatment. Individual results vary. Please consult a qualified medical doctor or certified dietician before making major dietary modifications, especially if you are on insulin or other diabetes medication.
          </div>
        </div>
      </footer>

      {/* 23. STICKY MOBILE CTA */}
      <div className={`sticky-bar ${stickyBarVisible ? 'visible' : ''}`} id="stickyBar">
        <div className="sticky-bar-price">
          <span className="label">🔥 Pro Bundle Offer</span>
          <span className="price">₹499 <small style={{ textDecoration: 'line-through', color: '#64748b', fontSize: '0.75rem' }}>₹1,299</small></span>
        </div>
        <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="btn btn-primary btn-pulse" style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem' }}>
          Order Now →
        </a>
      </div>

      {/* 24. FOMO POPUP */}
      <div className={`fomo-popup ${fomoVisible ? 'show' : ''}`} id="fomoPopup">
        <div className="fomo-avatar">✓</div>
        <div className="fomo-content">
          <span className="fomo-name">{fomoData.name}</span> from <span>{fomoData.city}</span>
          <span className="fomo-action"> {fomoData.plan === 'Pro Bundle' ? 'just bought the Pro Bundle!' : fomoData.plan === 'Starter plan' ? 'just bought the Starter plan!' : 'just bought the Premium Masterclass!'}</span>
          <span className="fomo-time">{fomoData.time}</span>
        </div>
      </div>

      {/* 25. WHATSAPP FLOAT BUTTON */}
      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="whatsapp-float" style={{ bottom: stickyBarVisible ? '5.5rem' : '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', zIndex: '990' }}>
        💬
      </a>

    </div>
  );
}
