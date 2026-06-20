import CheckoutFormClientWrapper from '@/components/checkout/CheckoutFormClientWrapper';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';

interface PageProps {
  searchParams: Promise<{ plan?: string; productId?: string; mode?: string }>;
}

const planDetails = {
  starter: {
    id: '11111111-1111-1111-1111-111111111111',
    title: '🌱 Starter Bundle (Diabetic Indian Recipes)',
    price: 299,
    originalPrice: 599,
    description: '100+ Diabetic-Friendly Indian Recipes eBook',
    type: 'digital' as const
  },
  pro: {
    id: '22222222-2222-2222-2222-222222222222',
    title: '🏆 Pro Bundle (Diabetic Recipe & Health Bundle)',
    price: 499,
    originalPrice: 1299,
    description: '100+ Recipes, Meal Planner, Grocery List, GI Cheat Sheet, Dining Out Guide, and Herbal Drinks',
    type: 'digital' as const
  },
  premium: {
    id: '33333333-3333-3333-3333-333333333333',
    title: '💎 Premium Masterclass (Ultimate Lifestyle Transformation)',
    price: 999,
    originalPrice: 2499,
    description: 'All Pro Features + Sugar-Free Sweets, Fast Cooking Guide, VIP WhatsApp Community, Custom Macro Calculator, and Lifetime Updates',
    type: 'digital' as const
  },
  applebox: {
    id: '44444444-4444-4444-4444-444444444444',
    title: '🍎 Himalayan Low-GI Apple Box (5 KG)',
    price: 1500,
    originalPrice: 2000,
    description: 'Fresh, pesticide-free, handpicked Low-GI Himalayan Apples.',
    type: 'physical' as const
  }
};

type PlanKey = 'starter' | 'pro' | 'premium' | 'applebox';

export default async function CheckoutPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const productId = resolvedParams.productId;
  const mode = resolvedParams.mode || '';
  const planKey = (resolvedParams.plan || 'pro').toLowerCase() as PlanKey;
  
  let selectedPlan = planDetails[planKey] || planDetails.pro;

  if (productId) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (data && !error) {
        selectedPlan = {
          id: data.id,
          title: data.title,
          price: Number(data.price_discounted),
          originalPrice: Number(data.price_original),
          description: data.description || '',
          type: data.type as 'digital' | 'physical'
        };
      }
    } catch (err) {
      console.error('Error loading product from Supabase:', err);
    }
  }
  
  return (
    <main className="min-h-screen bg-background py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
        <Link href="/" className="text-2xl font-serif font-bold text-accent-primary flex items-center gap-2">
          🍲 <span className="text-text-primary">KhaduOS</span>
        </Link>
        <span className="text-xs text-text-muted bg-card px-3 py-1 rounded-full border border-border-subtle">
          🛡️ Enterprise SSL Encryption
        </span>
      </div>

      <CheckoutFormClientWrapper selectedPlan={selectedPlan} checkoutMode={mode} />
    </main>
  );
}
