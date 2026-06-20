import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // The 3 Recipe Book products
    const productsToSeed = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        title: '🌱 Starter Bundle (Diabetic Indian Recipes)',
        description: '100+ Diabetic-Friendly Indian Recipes with Nutrition & Carb details.',
        type: 'digital',
        price_original: 599.00,
        price_discounted: 299.00,
        stock_quantity: 9999,
        is_perishable: false,
        is_active: true,
        image_url: '/ebook_mockup.png'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        title: '🏆 Pro Bundle (Diabetic Recipe & Health Bundle)',
        description: '100+ Recipes, 30-Day Meal Planner, Smart Grocery Lists, GI Cheat Sheet, Dining Out Guide, and Herbal Drinks.',
        type: 'digital',
        price_original: 1299.00,
        price_discounted: 499.00,
        stock_quantity: 9999,
        is_perishable: false,
        is_active: true,
        image_url: '/ebook_mockup.png'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        title: '💎 Premium Masterclass (Ultimate Lifestyle Transformation)',
        description: 'Everything in Pro + Sugar-Free Sweets, Fast Cooking Guide, VIP WhatsApp Community, Custom Macro Calculator, and Lifetime Updates.',
        type: 'digital',
        price_original: 2499.00,
        price_discounted: 999.00,
        stock_quantity: 9999,
        is_perishable: false,
        is_active: true,
        image_url: '/ebook_mockup.png'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        title: '🍎 Himalayan Low-GI Apple Box',
        description: '5 KG of hand-picked, pesticide-free, diabetic-friendly Himalayan apples.',
        type: 'physical',
        price_original: 2000.00,
        price_discounted: 1500.00,
        stock_quantity: 150,
        is_perishable: true,
        is_active: true,
        image_url: '/hero_thali.png'
      }
    ];

    // Upsert products based on fixed IDs
    const { data, error } = await supabase
      .from('products')
      .upsert(productsToSeed, { onConflict: 'id' })
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Database seeded successfully with D2C products!',
      products: data
    });
  } catch (error: any) {
    console.error('Seeding Error:', error);
    return NextResponse.json({ error: error.message || 'Seeding failed' }, { status: 500 });
  }
}
