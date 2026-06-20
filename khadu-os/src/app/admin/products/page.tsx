"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
  is_active: boolean;
  image_url: string;
  landing_page_config: any;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'digital',
    price_original: 0,
    price_discounted: 0,
    stock_quantity: 9999,
    is_perishable: false,
    image_url: '/ebook_mockup.png',
    hero_headline: '',
    hero_subtitle: '',
    bullet_points: '',
    faqs: '', // String format to be parsed as JSON/array
    testimonials: '' // String format to be parsed as JSON/array
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'funnel'>('basic');
  const [message, setMessage] = useState('');

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(product.id);
    const config = product.landing_page_config || {};
    setFormData({
      title: product.title,
      description: product.description || '',
      type: product.type,
      price_original: product.price_original,
      price_discounted: product.price_discounted,
      stock_quantity: product.stock_quantity,
      is_perishable: product.is_perishable,
      image_url: product.image_url || '/ebook_mockup.png',
      hero_headline: config.hero_headline || '',
      hero_subtitle: config.hero_subtitle || '',
      bullet_points: (config.bullet_points || []).join('\n'),
      faqs: JSON.stringify(config.faqs || [
        { q: 'Why is this product great?', a: 'Because it is organic.' }
      ], null, 2),
      testimonials: JSON.stringify(config.testimonials || [
        { name: 'Rohan S.', text: 'Best purchase ever!', loc: 'Mumbai', rating: 5, avatar: 'R' }
      ], null, 2)
    });
    setShowForm(true);
    setActiveTab('basic');
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({
      title: '',
      description: '',
      type: 'digital',
      price_original: 0,
      price_discounted: 0,
      stock_quantity: 9999,
      is_perishable: false,
      image_url: '/ebook_mockup.png',
      hero_headline: '',
      hero_subtitle: '',
      bullet_points: '',
      faqs: '',
      testimonials: ''
    });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Parse bullet points
    const bulletsArray = formData.bullet_points
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    // Parse FAQs & Testimonials from JSON strings
    let faqsParsed = [];
    let testimonialsParsed = [];

    try {
      if (formData.faqs.trim()) {
        faqsParsed = JSON.parse(formData.faqs);
      }
    } catch (e) {
      setMessage('⚠️ Invalid JSON structure in FAQs field. Must be a valid JSON array.');
      return;
    }

    try {
      if (formData.testimonials.trim()) {
        testimonialsParsed = JSON.parse(formData.testimonials);
      }
    } catch (e) {
      setMessage('⚠️ Invalid JSON structure in Testimonials field. Must be a valid JSON array.');
      return;
    }

    const landing_page_config = {
      hero_headline: formData.hero_headline,
      hero_subtitle: formData.hero_subtitle,
      bullet_points: bulletsArray,
      faqs: faqsParsed,
      testimonials: testimonialsParsed
    };

    const payload = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      price_original: Number(formData.price_original),
      price_discounted: Number(formData.price_discounted),
      stock_quantity: Number(formData.stock_quantity),
      is_perishable: formData.is_perishable,
      image_url: formData.image_url,
      landing_page_config
    };

    try {
      if (isEditing) {
        // Update product
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', isEditing);

        if (error) throw error;
        setMessage('✅ Product updated successfully!');
      } else {
        // Create product
        const { error } = await supabase
          .from('products')
          .insert([payload]);

        if (error) throw error;
        setMessage('✅ Product created successfully!');
      }

      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setMessage(`❌ Error: ${error.message || 'Saving failed'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products & Funnel Manager</h1>
          <p className="text-sm text-text-muted mt-1">Shopify + ClickFunnels Cockpit</p>
        </div>

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer"
          >
            + Create Product
          </button>
        )}
      </div>

      {message && (
        <div className="bg-[#0f0f14] border border-border-subtle p-3 rounded-lg text-sm font-semibold text-accent-primary">
          {message}
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <div className="bg-card border border-border-subtle rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-border-subtle pb-4">
            <h2 className="text-lg font-bold text-text-primary">
              {isEditing ? '✏️ Edit Product & Funnel' : '📦 Create New Product & Funnel'}
            </h2>
            <button 
              onClick={resetForm}
              className="text-text-muted hover:text-text-primary text-sm"
            >
              Cancel
            </button>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-border-subtle gap-4">
            <button 
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`pb-2 text-sm font-semibold cursor-pointer ${activeTab === 'basic' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-muted'}`}
            >
              1. Basic Product Info
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('funnel')}
              className={`pb-2 text-sm font-semibold cursor-pointer ${activeTab === 'funnel' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-muted'}`}
            >
              2. ClickFunnels Copy Config
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'basic' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase block">Product Name</label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Kashmiri Saffron Honey"
                      className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none focus:border-accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase block">Product Type</label>
                    <select 
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none focus:border-accent-primary"
                    >
                      <option value="digital">Digital (Requires 100% Pre-paid)</option>
                      <option value="physical">Physical (Supports 30% Partial COD Slider)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-text-muted font-semibold uppercase block">Description (Shopify view)</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Short product overview..."
                    className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase block">Discount Price (₹)</label>
                    <input 
                      type="number" 
                      name="price_discounted"
                      value={formData.price_discounted}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase block">Original Price (₹)</label>
                    <input 
                      type="number" 
                      name="price_original"
                      value={formData.price_original}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase block">Stock Quantity</label>
                    <input 
                      type="number" 
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase block">Image URL Path</label>
                    <input 
                      type="text" 
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="is_perishable"
                      checked={formData.is_perishable}
                      onChange={handleInputChange}
                      className="accent-accent-primary"
                    />
                    Is Perishable Item? (Triggers Thursday-Friday Dispatch Hold)
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-text-muted font-semibold uppercase block">Hero Page Title / Headline</label>
                  <input 
                    type="text" 
                    name="hero_headline"
                    value={formData.hero_headline}
                    onChange={handleInputChange}
                    placeholder="e.g. Start Cooking Healthier Meals Today..."
                    className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-text-muted font-semibold uppercase block">Hero Page Subtitle</label>
                  <textarea 
                    name="hero_subtitle"
                    value={formData.hero_subtitle}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Discover 100+ low-GI recipes designed to keep sugar levels stable..."
                    className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-text-muted font-semibold uppercase block">Transformation Bullet Points (One per line)</label>
                  <textarea 
                    name="bullet_points"
                    value={formData.bullet_points}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Low-GI Grains keeping sugar stable&#10;Prep under 30 minutes&#10;Loved by 2000+ Indian families"
                    className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none focus:border-accent-primary font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase block">Testimonials Config (JSON Array)</label>
                    <textarea 
                      name="testimonials"
                      value={formData.testimonials}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none focus:border-accent-primary font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase block">FAQs Config (JSON Array)</label>
                    <textarea 
                      name="faqs"
                      value={formData.faqs}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none focus:border-accent-primary font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-border-subtle justify-end">
              <button 
                type="button" 
                onClick={resetForm}
                className="bg-card hover:bg-card-hover border border-border-subtle text-text-secondary px-6 py-2.5 rounded-full text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-accent-primary hover:bg-accent-primary/95 text-white font-bold px-8 py-2.5 rounded-full text-sm transition-transform hover:scale-[1.02] cursor-pointer"
              >
                Save Product & Funnel Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Table */}
      {loading ? (
        <div className="text-center text-text-muted py-12">Loading products catalog...</div>
      ) : products.length > 0 ? (
        <div className="bg-card border border-border-subtle rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary whitespace-nowrap">
              <thead className="bg-[#0f0f14] border-b border-border-subtle uppercase text-xs text-text-muted font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Selling Price</th>
                  <th className="px-6 py-4 text-right">Original Price</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center">Perishable?</th>
                  <th className="px-6 py-4 text-center">Funnels / Landing Page</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-card-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">{product.title}</div>
                      <div className="text-xs text-text-muted truncate max-w-xs">{product.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${product.type === 'digital' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                        {product.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-text-primary">
                      ₹{product.price_discounted}
                    </td>
                    <td className="px-6 py-4 text-right text-text-muted line-through">
                      ₹{product.price_original}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.stock_quantity}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-xs">
                      {product.is_perishable ? <span className="text-accent-red">YES</span> : <span className="text-text-muted">NO</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/p/${product.id}`}
                        target="_blank"
                        className="text-accent-primary hover:text-accent-secondary text-xs underline font-semibold"
                      >
                        Launch Page →
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-text-primary hover:text-accent-primary text-sm font-medium mr-3 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border-subtle p-12 text-center text-text-muted rounded-xl">
          No products found. Click **Create Product** above to add your first product.
        </div>
      )}
    </div>
  );
}
