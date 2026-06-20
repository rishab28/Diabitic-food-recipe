"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string;
  type: 'digital' | 'physical';
  price_original: number;
  price_discounted: number;
  stock_quantity: number;
  is_perishable: boolean;
  image_url: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'physical' | 'digital'>('all');

  useEffect(() => {
    fetchProducts();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('khadu_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('khadu_cart', JSON.stringify(updatedCart));
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let updatedCart: CartItem[] = [];
    
    if (existingItem) {
      updatedCart = cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    
    saveCartToStorage(updatedCart);
    setIsCartOpen(true); // Open cart drawer on add
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];

    saveCartToStorage(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCartToStorage(updatedCart);
  };

  const filteredProducts = products.filter(p => {
    if (categoryFilter === 'all') return true;
    return p.type === categoryFilter;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price_discounted * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#060608] text-foreground font-sans relative">
      
      {/* Top Header & Navbar */}
      <header className="sticky top-0 bg-[#060608]/90 backdrop-blur-md border-b border-border-subtle py-4 px-6 flex justify-between items-center z-50">
        <Link href="/" className="text-2xl font-serif font-bold text-accent-primary flex items-center gap-2">
          🍲 <span className="text-text-primary">Khadu Farm Store</span>
        </Link>

        {/* Cart Trigger */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-card hover:bg-card-hover border border-border-subtle px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          🛒 Cart
          {cartCount > 0 && (
            <span className="bg-accent-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* Hero Storefront Banner */}
      <section className="py-12 px-6 text-center max-w-4xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-wider text-accent-primary font-semibold">Shimla Sourced & Fresh</span>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-text-primary">Fresh Himalayan Produce & Guides</h1>
        <p className="text-sm text-text-secondary max-w-lg mx-auto">
          From organic low-GI apples to clinically-reviewed diabetic recipe guides. Order fresh today.
        </p>
      </section>

      {/* Catalog Filters */}
      <div className="max-w-6xl mx-auto px-6 mb-8 flex justify-center gap-3">
        {(['all', 'physical', 'digital'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all border ${categoryFilter === cat ? 'bg-accent-primary text-white border-accent-primary' : 'bg-card border-border-subtle text-text-muted hover:text-text-primary'}`}
          >
            {cat === 'all' ? 'All Products' : cat === 'physical' ? '🍎 Farm Fresh' : '📘 Ebook Guides'}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center text-text-muted py-12">Loading products catalog...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-card border border-border-subtle rounded-2xl overflow-hidden hover:border-accent-primary/20 transition-all duration-300 flex flex-col justify-between group shadow-lg">
                <div className="relative w-full aspect-[4/3] bg-card-hover overflow-hidden">
                  <Image 
                    src={product.image_url || '/ebook_mockup.png'} 
                    alt={product.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${product.type === 'digital' ? 'bg-blue-500/80 text-white' : 'bg-green-500/80 text-white'}`}>
                    {product.type === 'digital' ? 'Digital' : 'Physical'}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-text-primary text-base leading-snug group-hover:text-accent-primary transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-2">{product.description || 'No description available.'}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold text-text-primary">₹{product.price_discounted}</span>
                      {product.price_original > product.price_discounted && (
                        <span className="text-xs text-text-muted line-through">₹{product.price_original}</span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-[#0f0f14] hover:bg-accent-primary text-text-primary hover:text-white border border-border-subtle hover:border-accent-primary text-xs font-semibold py-2.5 rounded-full transition-all cursor-pointer text-center"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-text-muted py-12">No products available in this category.</div>
        )}
      </main>

      {/* Slide-out Shopping Cart Drawer */}
      {isCartOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/70 z-[100] transition-opacity duration-300"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Drawer Panel */}
          <aside className="fixed top-0 right-0 h-full w-[90%] max-w-[420px] bg-card border-l border-border-subtle shadow-2xl z-[101] flex flex-col justify-between animate-[slideInRight_0.3s_ease-out]">
            
            {/* Header */}
            <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-[#0f0f14]">
              <h3 className="font-bold text-lg text-text-primary">Shopping Cart</h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-text-muted hover:text-text-primary text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 border-b border-border-subtle/50 pb-4 justify-between items-start">
                    <div className="relative w-16 h-16 rounded bg-card-hover overflow-hidden shrink-0 border border-border-subtle">
                      <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-xs text-text-primary leading-snug line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-text-muted">₹{item.price_discounted}</p>
                      
                      {/* Quantity Toggles */}
                      <div className="flex items-center gap-2 pt-1">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-5 h-5 bg-[#0f0f14] border border-border-subtle rounded flex items-center justify-center text-xs hover:border-accent-primary"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-5 h-5 bg-[#0f0f14] border border-border-subtle rounded flex items-center justify-center text-xs hover:border-accent-primary"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-text-muted hover:text-accent-red text-sm font-semibold pl-2"
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-text-muted py-12 flex flex-col items-center justify-center gap-3">
                  <span className="text-4xl">🛒</span>
                  <p className="text-sm">Your shopping cart is empty.</p>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-border-subtle bg-[#0f0f14] space-y-4">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-bold text-text-primary">₹{cartSubtotal}</span>
                </div>
                
                <p className="text-[10px] text-text-muted">
                  *Shipping and payment terms are customized dynamically at checkout.
                </p>

                <Link 
                  href="/checkout?mode=cart"
                  className="block w-full bg-accent-primary hover:bg-accent-primary/95 text-white font-bold py-3.5 rounded-full text-center text-sm shadow-lg transition-transform hover:scale-[1.02]"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}

          </aside>
        </>
      )}

    </div>
  );
}
