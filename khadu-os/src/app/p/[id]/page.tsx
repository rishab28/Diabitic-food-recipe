"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  description: string;
  type: 'digital' | 'physical';
  price_original: number;
  price_discounted: number;
  image_url: string;
  landing_page_config: any;
}

// FOMO arrays
const fomoNames = ['Priya S.', 'Sunita R.', 'Arvind K.', 'Anjali M.', 'Deepak J.', 'Manish T.', 'Kiran P.', 'Preeti D.', 'Suresh V.', 'Vikas G.'];
const fomoCities = ['Mumbai', 'Delhi NCR', 'Pune', 'Jaipur', 'Bangalore', 'Ludhiana', 'Ahmedabad', 'Indore', 'Lucknow', 'Chandigarh'];

export default function DynamicProductFunnelPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [countdown, setCountdown] = useState('23:59:59');
  const [viewerCount, setViewerCount] = useState(47);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [exitOverlayVisible, setExitOverlayVisible] = useState(false);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  
  // FOMO state
  const [fomoVisible, setFomoVisible] = useState(false);
  const [fomoData, setFomoData] = useState({ name: 'Priya S.', city: 'Mumbai', plan: 'Organic Product', time: '2 minutes ago' });

  // Countup stats
  const [stats, setStats] = useState({ families: 0, states: 0, stable: 0, rating: 0 });

  const heroRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        setErrorMsg('Product not found in database.');
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  // Timer & Viewers & Scroll Effect
  useEffect(() => {
    if (!product) return;

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

    // 3. Scroll listener for sticky CTA
    const handleScroll = () => {
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
      const mins = Math.floor(Math.random() * 8) + 1;

      setFomoData({
        name,
        city,
        plan: product.title,
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

    // 6. Stats animation on visible
    let statsTriggered = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsTriggered) {
          statsTriggered = true;
          animateStats();
        }
      });
    }, { threshold: 0.15 });

    if (resultsRef.current) {
      observer.observe(resultsRef.current);
    }

    const animateStats = () => {
      let currentFam = 0;
      let currentStates = 0;
      let currentStable = 0;
      let currentRating = 0;

      const interval = setInterval(() => {
        let done = true;
        if (currentFam < 1250) {
          currentFam += 25;
          if (currentFam > 1250) currentFam = 1250;
          done = false;
        }
        if (currentStates < 12) {
          currentStates += 1;
          done = false;
        }
        if (currentStable < 96) {
          currentStable += 2;
          if (currentStable > 96) currentStable = 96;
          done = false;
        }
        if (currentRating < 4.8) {
          currentRating += 0.1;
          if (currentRating > 4.8) currentRating = 4.8;
          done = false;
        }

        setStats({
          families: currentFam,
          states: currentStates,
          stable: currentStable,
          rating: Number(currentRating.toFixed(1))
        });

        if (done) clearInterval(interval);
      }, 30);
    };

    return () => {
      clearInterval(timerInterval);
      clearInterval(viewerInterval);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(fomoTimeout);
      observer.disconnect();
    };
  }, [product]);

  const toggleFaq = (index: number) => {
    setActiveFaq(prev => (prev === index ? null : index));
  };

  const closeExitModal = () => {
    setExitOverlayVisible(false);
  };

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    setExitOverlayVisible(false);
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-text-secondary">
        <div className="animate-spin text-3xl mb-4">🍲</div>
        <p>Loading custom D2C funnel page...</p>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-text-secondary text-center px-4">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Product Funnel Not Found</h2>
        <p className="text-sm text-text-muted mb-6">The link you requested is either expired or invalid.</p>
        <Link href="/" className="bg-accent-primary hover:bg-accent-primary/95 text-white font-bold py-2 px-6 rounded-full text-xs">
          Return to Storefront
        </Link>
      </div>
    );
  }

  // Parse landing page configs with fallbacks
  const config = product.landing_page_config || {};
  const heroHeadline = config.hero_headline || `End the Days of Searching for the Best ${product.title}.`;
  const heroSubtitle = config.hero_subtitle || product.description || `Discover hand-sourced, organic items from Khadu Farm that elevate your wellness goals. Trusted by families across India. Ready in under 1 minute.`;
  const bulletPoints = config.bullet_points || [
    'Direct farm-to-table organic delivery',
    'Tested for Glycemic Index and health safety',
    '100% natural, pesticide-free packaging',
    'Backed by a 7-day risk-free money-back guarantee'
  ];

  const testimonials = config.testimonials || [
    { name: 'Arvind K.', loc: 'Jaipur, Rajasthan', rating: 5, text: `Excellent quality! The product has a beautiful natural texture. The whole family enjoys eating it. Best investment for our health!`, avatar: 'A' },
    { name: 'Sunita M.', loc: 'Pune, Maharashtra', rating: 5, text: `Extremely fresh and pure. It was delivered within 3 days. Standard support is very helpful and responsive on WhatsApp.`, avatar: 'S' },
    { name: 'Neha Sen', loc: 'Delhi NCR', rating: 5, text: `Highly recommended! Clean organic farming makes all the difference in health results. Doctor is impressed!`, avatar: 'N' }
  ];

  const faqsList = config.faqs || [
    { q: 'Is this product safe for diabetics?', a: 'Yes, this product is selected for low GI values and organic properties.' },
    { q: 'How quickly will I receive my order?', a: 'For digital assets, it is delivered instantly via WhatsApp. For physical boxes, delivery takes 3 to 5 business days.' },
    { q: 'Do you offer a refund policy?', a: 'Yes, we offer a 100% money-back guarantee within 7 days of delivery if you are unsatisfied.' }
  ];

  return (
    <div className="bg-background text-foreground font-sans">
      
      {/* 1. SCROLL PROGRESS */}
      <div className="fixed top-0 left-0 h-1 bg-accent-primary z-[1000] transition-all duration-100" style={{ width: '0%' }} id="scrollProgress" />

      {/* 2. EXIT INTENT MODAL */}
      {exitOverlayVisible && (
        <>
          <div className="fixed inset-0 bg-black/80 z-[9998] transition-opacity duration-300" onClick={closeExitModal} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[480px] bg-card border border-border-subtle rounded-2xl p-6 md:p-8 z-[9999] shadow-2xl text-center animate-scale-in">
            <button className="absolute top-4 right-4 text-text-muted hover:text-text-primary text-2xl animate-pulse" onClick={closeExitModal}>&times;</button>
            <div className="text-4xl mb-3">🛑</div>
            <h3 className="text-xl md:text-2xl font-serif text-text-primary font-bold mb-2">Ruk Jaiye! Sehat Se Samjhauta Kyun?</h3>
            <p className="text-text-secondary text-sm mb-5">Don\'t compromise on your family\'s wellness. Use this special discount code at checkout:</p>
            
            <div className="bg-[#0f0f14] border-2 border-dashed border-accent-green/40 p-4 rounded-xl mb-6">
              <span className="block text-xs text-accent-green uppercase font-semibold tracking-wider mb-1">Your Special Promo Code:</span>
              <span className="block text-2xl font-mono font-bold text-text-primary tracking-widest mb-1">HEALTHYFAMILY</span>
              <span className="block text-xs text-text-muted">Extra 15% OFF at checkout</span>
            </div>

            <a href="#pricing" onClick={scrollToPricing} className="block w-full bg-accent-primary text-white font-bold py-3.5 rounded-full shadow-lg hover:bg-accent-primary/95 transition-transform hover:scale-[1.02] text-center text-sm">
              Claim Discount Now →
            </a>
            <p className="text-[10px] text-text-muted mt-3">⏰ Coupon code expires in 10 minutes</p>
          </div>
        </>
      )}

      {/* 3. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-accent-primary to-[#ea580c] text-white text-center py-2.5 px-4 text-xs md:text-sm font-semibold tracking-wide">
        🚨 SPECIAL LAUNCH OFFER: Limited stock available. Offer expires in <span className="font-mono text-text-primary bg-black/25 px-2 py-0.5 rounded">{countdown}</span>.
      </div>

      {/* 4. HERO SECTION */}
      <section ref={heroRef} className="relative py-12 md:py-20 px-4 md:px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-accent-primary/10 border border-border-accent text-accent-primary px-3 py-1 rounded-full text-xs font-semibold">
              ⚡ Premium D2C Offer from Khadu Farm
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-bold text-text-primary leading-tight">
              {heroHeadline}
            </h1>

            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              {heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="#pricing" onClick={(e) => { e.preventDefault(); pricingRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-accent-primary hover:bg-accent-primary/95 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 text-sm md:text-base">
                Get {product.title} — ₹{product.price_discounted}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs text-text-secondary">
              <div className="flex items-center justify-center md:justify-start gap-1.5">
                <span className="text-accent-green">✓</span> {product.type === 'digital' ? 'Instant Access' : 'Express Delivery'}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1.5">
                <span className="text-accent-green">✓</span> UPI & Cards Accepted
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1.5">
                <span className="text-accent-green">✓</span> 7-Day Refund Guarantee
              </div>
            </div>
          </div>

          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-[380px] md:max-w-[440px] aspect-[4/3] rounded-2xl overflow-hidden border border-border-subtle shadow-xl">
              <Image 
                src={product.image_url || '/ebook_mockup.png'} 
                alt={product.title} 
                fill 
                className="object-cover hover:scale-[1.02] transition-transform duration-300"
                priority
              />
            </div>
            
            <div className="absolute bottom-[5%] left-[5%] bg-card/90 backdrop-blur-md border border-border-subtle rounded-xl p-3 shadow-lg flex items-center gap-3">
              <span className="text-2xl">{product.type === 'digital' ? '📲' : '🍎'}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-text-primary">{product.type === 'digital' ? '100% Digital' : 'Farm Perishable'}</p>
                <p className="text-[10px] text-text-muted">{product.type === 'digital' ? 'Instant Download' : 'Shipped Fresh'}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. CREDIBILITY BAR */}
      <div className="bg-[#0f0f14] border-y border-border-subtle py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-around items-center gap-6 text-sm text-text-secondary font-medium">
          <div>🥦 <span className="text-accent-primary font-bold">100%</span> Natural Sourced</div>
          <div>👨‍⚕️ Clinically <span className="text-text-primary font-bold">Approved Quality</span></div>
          <div>⏱️ Quick Delivery <span className="text-text-primary font-bold">Pan-India</span></div>
          <div>🛡️ <span className="text-accent-primary font-bold">7-Day</span> Money-Back Guarantee</div>
        </div>
      </div>

      {/* 6. VALUE HIGHLIGHTS / BULLETS */}
      <section className="py-16 md:py-24 px-4 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-wider text-accent-primary font-semibold">Key Benefits</span>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-text-primary">Why Choose {product.title}?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bulletPoints.map((bullet: string, i: number) => (
            <div key={i} className="bg-card border border-border-subtle rounded-xl p-5 flex items-start gap-3">
              <span className="text-accent-green text-xl shrink-0">✓</span>
              <p className="text-text-secondary text-sm md:text-base">{bullet}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PRICING & INVENTORY */}
      <section ref={pricingRef} id="pricing" className="py-16 md:py-24 px-4 bg-[#0a0a0f] border-y border-border-subtle">
        <div className="max-w-md mx-auto bg-gradient-to-b from-card to-card-hover border border-accent-primary rounded-3xl p-6 md:p-10 text-center space-y-6 shadow-2xl relative">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent-primary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
            ⚡ Special Launch Price Offer
          </span>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-serif text-text-primary">{product.title}</h3>
            <p className="text-xs text-text-muted">{product.type === 'digital' ? 'Digital Guide' : 'Farm-Fresh Product'}</p>
          </div>

          <div className="space-y-1">
            <div className="text-4xl font-bold font-serif text-accent-primary">
              ₹{product.price_discounted} <span className="text-sm line-through text-text-muted">₹{product.price_original}</span>
            </div>
            <p className="text-xs text-accent-green font-semibold">You save ₹{product.price_original - product.price_discounted} today!</p>
          </div>

          <div className="border-t border-border-subtle/50 my-2" />

          <ul className="text-left text-xs space-y-3 text-text-secondary max-w-xs mx-auto">
            <li className="flex items-center gap-2"><span>✓</span> 100% Pure & Premium Sourcing</li>
            <li className="flex items-center gap-2"><span>✓</span> {product.type === 'digital' ? 'Instant WhatsApp PDF' : 'Eco-Friendly Packaged'}</li>
            <li className="flex items-center gap-2"><span>✓</span> Full Customer Chat Support</li>
            <li className="flex items-center gap-2"><span>✓</span> 7-Day Money-Back Guarantee</li>
          </ul>

          <Link href={`/checkout?plan=custom&productId=${product.id}`} className="block w-full bg-accent-primary hover:bg-accent-primary/95 text-white font-bold py-3.5 rounded-full text-center text-sm shadow-lg transition-transform hover:scale-[1.02] animate-pulse">
            Order Now & Get Access →
          </Link>

          <div className="flex justify-center gap-2 text-[10px] text-text-muted">
            <span>💳 UPI</span> <span>• Cards</span> <span>• NetBanking</span>
          </div>
        </div>
      </section>

      {/* 8. RESULTS DASHBOARD */}
      <section ref={resultsRef} className="bg-[#0f0f14] border-b border-border-subtle py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-bold font-serif text-accent-green">{stats.families || '1,250'}+</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Happy Buyers</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-bold font-serif text-accent-green">{stats.states || '12'}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Cities Delivered</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-bold font-serif text-accent-green">{stats.stable || '96'}%</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Satisfaction Score</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-bold font-serif text-accent-gold">{stats.rating || '4.8'} ★</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Average Rating</div>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-wider text-accent-primary font-semibold">Customer Reviews</span>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-text-primary">What Buyers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item: any, i: number) => (
            <div key={i} className="bg-card border border-border-subtle rounded-2xl p-6 flex flex-col justify-between hover:border-accent-primary/20 transition-colors">
              <div className="space-y-4">
                <div className="text-accent-gold text-sm tracking-widest">
                  {'★'.repeat(item.rating || 5)}
                </div>
                <p className="text-text-secondary text-xs md:text-sm italic leading-relaxed">"{item.text}"</p>
              </div>
              
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border-subtle/50">
                <div className="w-10 h-10 rounded-full bg-accent-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {item.avatar || item.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-xs md:text-sm">{item.name}</h4>
                  <p className="text-[10px] text-text-muted">{item.loc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. GUARANTEE */}
      <section className="py-16 md:py-24 px-4 bg-[#0a0a0f] border-t border-border-subtle">
        <div className="max-w-3xl mx-auto bg-card border border-accent-green/25 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-lg">
          <div className="text-5xl shrink-0">🛡️</div>
          <div className="space-y-3 text-center md:text-left">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-accent-green">7-Day Risk-Free Guarantee</h3>
            <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
              If you aren\'t completely satisfied with the freshness, delivery, or quality of your purchase, simply contact us via WhatsApp within 7 days for a 100% no-questions-asked refund.
            </p>
          </div>
        </div>
      </section>

      {/* 11. FAQS */}
      <section className="py-16 md:py-24 px-4 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-wider text-accent-primary font-semibold">Common Questions</span>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-text-primary">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqsList.map((faq: any, i: number) => (
            <div key={i} className="border-b border-border-subtle pb-4">
              <button 
                className="w-full text-left py-3 flex justify-between items-center text-sm md:text-base font-semibold text-text-primary hover:text-accent-primary transition-colors cursor-pointer"
                onClick={() => toggleFaq(i)}
              >
                <span>{faq.q}</span>
                <span className="text-accent-primary text-xl font-mono">{activeFaq === i ? '−' : '+'}</span>
              </button>
              {activeFaq === i && (
                <p className="text-text-secondary text-xs md:text-sm leading-relaxed pt-2">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="bg-black/60 border-t border-border-subtle py-12 px-4 text-center text-xs text-text-muted space-y-6">
        <p>© 2026 Khadu Farm Commerce. All rights reserved.</p>
        <p className="max-w-3xl mx-auto leading-relaxed border-t border-border-subtle/40 pt-6">
          Disclaimer: This site is not a part of the Facebook website or Facebook Inc. Additionally, this site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.
        </p>
      </footer>

      {/* 13. STICKY MOBILE CTA */}
      {stickyBarVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#060608]/95 backdrop-blur-md border-t border-border-subtle py-3.5 px-4 flex justify-between items-center z-[900] shadow-2xl">
          <div className="text-left">
            <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">🔥 Launch Offer</span>
            <span className="block text-sm font-bold text-accent-primary">₹{product.price_discounted}</span>
          </div>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); pricingRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-accent-primary hover:bg-accent-primary/95 text-white font-bold py-2.5 px-5 rounded-full text-xs transition-transform hover:scale-[1.02]">
            Order Now →
          </a>
        </div>
      )}

      {/* 14. FOMO POPUP */}
      <div className={`fixed bottom-4 left-4 bg-card border border-border-subtle rounded-xl p-3.5 shadow-2xl flex items-center gap-3 max-w-[320px] z-[950] transition-all duration-500 transform ${fomoVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="w-8 h-8 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center font-bold text-xs shrink-0">
          ✓
        </div>
        <div className="text-left text-[11px] leading-tight text-text-secondary">
          <strong className="text-text-primary">{fomoData.name}</strong> from <span className="font-semibold text-text-primary">{fomoData.city}</span>{' '}
          just purchased <strong className="text-accent-primary">{fomoData.plan}</strong>!
          <span className="block text-[9px] text-text-muted mt-1">{fomoData.time}</span>
        </div>
      </div>

    </div>
  );
}
