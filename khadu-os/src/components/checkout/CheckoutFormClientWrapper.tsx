"use client";

import { useState, useEffect } from 'react';
import Script from 'next/script';
import HybridCodSlider from './HybridCodSlider';

interface PlanDetails {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  description: string;
  type: 'digital' | 'physical';
}

interface CartItem extends PlanDetails {
  quantity: number;
  price_discounted: number;
  price_original: number;
  image_url: string;
}

interface CheckoutFormClientWrapperProps {
  selectedPlan: PlanDetails;
  checkoutMode?: string;
}

export default function CheckoutFormClientWrapper({ selectedPlan, checkoutMode }: CheckoutFormClientWrapperProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pincode: '',
    city: '',
    address: ''
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [depositAmount, setDepositAmount] = useState(selectedPlan.price);
  const [isFullPrepaid, setIsFullPrepaid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  const isCartMode = checkoutMode === 'cart';

  // Load cart if in cart mode
  useEffect(() => {
    if (isCartMode) {
      const savedCart = localStorage.getItem('khadu_cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setCartItems(parsed);
          
          // Calculate total price and type
          const total = parsed.reduce((sum: number, item: any) => sum + (item.price_discounted * item.quantity), 0);
          setDepositAmount(total);
          setIsFullPrepaid(true);
        } catch (e) {
          console.error('Error parsing cart:', e);
        }
      }
    } else {
      setDepositAmount(selectedPlan.price);
      setIsFullPrepaid(true);
    }
  }, [selectedPlan, isCartMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepositChange = (amount: number, full: boolean) => {
    setDepositAmount(amount);
    setIsFullPrepaid(full);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) return 'Valid WhatsApp phone number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Valid email is required';
    if (!formData.pincode.trim() || formData.pincode.length !== 6) return 'Valid 6-digit pincode is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.address.trim()) return 'Complete Address is required';
    return null;
  };

  // Determine pricing and item payloads dynamically
  const totalAmount = isCartMode
    ? cartItems.reduce((sum, item) => sum + (item.price_discounted * item.quantity), 0)
    : selectedPlan.price;

  const originalTotalAmount = isCartMode
    ? cartItems.reduce((sum, item) => sum + (item.price_original * item.quantity), 0)
    : selectedPlan.originalPrice;

  // Enforce prepay if any cart item is digital
  const hasDigitalItem = isCartMode
    ? cartItems.some(item => item.type === 'digital')
    : selectedPlan.type === 'digital';

  const orderItemsPayload = isCartMode
    ? cartItems.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price_discounted }))
    : [{ productId: selectedPlan.id, quantity: 1, price: selectedPlan.price }];

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    if (isCartMode && cartItems.length === 0) {
      setErrorMsg('Your shopping cart is empty.');
      return;
    }

    if (!isSdkLoaded || !(window as any).Razorpay) {
      setErrorMsg('Razorpay payment gateway is loading. Please try again in a moment.');
      return;
    }

    setLoading(true);

    try {
      // 1. Call Backend API to create Razorpay Order
      const res = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depositAmount: hasDigitalItem ? totalAmount : depositAmount,
          totalAmount,
          customerInfo: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: {
              street: formData.address,
              city: formData.city,
              pincode: formData.pincode
            }
          },
          orderItems: orderItemsPayload
        })
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // 2. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Khadu Farm',
        description: isCartMode ? 'Farm Cart Checkout' : selectedPlan.title,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Clear cart on successful purchase
          if (isCartMode) {
            localStorage.removeItem('khadu_cart');
          }
          // Direct to confirmation page
          window.location.href = `/checkout/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&supabase_order_id=${orderData.supabaseOrderId}`;
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#f97316',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const paymentWindow = new (window as any).Razorpay(options);
      paymentWindow.open();

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={() => setIsSdkLoaded(true)}
      />

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left Column: Form Fields & Details (Takes 3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handlePayment} className="space-y-6">
            {/* Shipping details */}
            <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-lg text-text-primary">Shipping & Delivery Information</h2>
              
              <div className="space-y-3">
                <div>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name" 
                    className="w-full bg-[#0f0f14] border border-border-subtle rounded-md p-3 text-text-primary focus:outline-none focus:border-accent-primary transition-colors" 
                  />
                </div>

                <div>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="WhatsApp Mobile Number (For instant delivery)" 
                    className="w-full bg-[#0f0f14] border border-border-subtle rounded-md p-3 text-text-primary focus:outline-none focus:border-accent-primary transition-colors" 
                  />
                </div>

                <div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address" 
                    className="w-full bg-[#0f0f14] border border-border-subtle rounded-md p-3 text-text-primary focus:outline-none focus:border-accent-primary transition-colors" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode (6 digits)" 
                    className="w-full bg-[#0f0f14] border border-border-subtle rounded-md p-3 text-text-primary focus:outline-none focus:border-accent-primary transition-colors" 
                  />
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City" 
                    className="w-full bg-[#0f0f14] border border-border-subtle rounded-md p-3 text-text-primary focus:outline-none focus:border-accent-primary transition-colors" 
                  />
                </div>

                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full Address (House No, Street, Landmark)" 
                  rows={3} 
                  className="w-full bg-[#0f0f14] border border-border-subtle rounded-md p-3 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                ></textarea>
              </div>
            </div>

            {/* Dynamic Payment Slider */}
            {!hasDigitalItem ? (
              <HybridCodSlider totalAmount={totalAmount} onDepositChange={handleDepositChange} />
            ) : (
              <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-sm text-xs text-text-muted flex items-center gap-2">
                ℹ️ Digital products in your cart require 100% full prepayment. COD is unavailable.
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                ⚠️ {errorMsg}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-primary to-[#ea580c] disabled:opacity-50 text-white font-bold py-4 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:scale-[1.02] active:scale-[1] transition-all cursor-pointer text-center text-lg"
            >
              {loading ? 'Processing Payment...' : `Pay ₹${hasDigitalItem ? totalAmount : depositAmount} to Confirm Order`}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary (Takes 2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-sm sticky top-10">
            <h2 className="font-bold text-lg text-text-primary mb-4">Order Summary</h2>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {isCartMode ? (
                cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-[#0f0f14] rounded flex items-center justify-center border border-border-subtle text-base shrink-0">
                        {item.type === 'digital' ? '📚' : '🍎'}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary text-xs leading-snug line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-text-primary text-xs shrink-0">₹{item.price_discounted * item.quantity}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-[#0f0f14] rounded flex items-center justify-center border border-border-subtle text-base shrink-0">
                      {selectedPlan.type === 'digital' ? '📚' : '🍎'}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-xs leading-snug">{selectedPlan.title}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Qty: 1</p>
                    </div>
                  </div>
                  <span className="font-bold text-text-primary text-xs">₹{selectedPlan.price}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border-subtle my-4"></div>

            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="line-through text-text-muted">₹{originalTotalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Special Promo Discount</span>
                <span className="text-accent-green font-semibold">
                  -₹{originalTotalAmount - totalAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-accent-green font-semibold">FREE</span>
              </div>
            </div>

            <div className="border-t border-border-subtle my-4"></div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-base text-text-primary">Final Price</span>
              <div className="text-right">
                <span className="font-bold text-2xl text-accent-primary">₹{totalAmount}</span>
                <p className="text-[10px] text-text-muted">One-time payment</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border-subtle space-y-3">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="text-accent-green">✓</span>
                <span>Reviewed & Approved by Certified Dietitians</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="text-accent-green">✓</span>
                <span>7-Day Risk-Free Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
