import { Redis } from '@upstash/redis';
import { getSupabaseAdmin } from './supabase';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Enterprise Caching Strategy:
 * Products catalog is read-heavy. We fetch from Redis first.
 * If cache miss, fetch from Supabase, store in Redis (1hr TTL), and return.
 */
export async function getCachedProducts() {
  const CACHE_KEY = 'products:catalog:active';
  
  try {
    // 1. Try to get from Upstash Redis Edge Cache
    const cachedProducts = await redis.get(CACHE_KEY);
    if (cachedProducts) {
      return cachedProducts;
    }

    // 2. Cache Miss: Fetch from Supabase
    const supabase = getSupabaseAdmin();
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);
      
    if (error) throw error;

    // 3. Set Cache with 1-hour expiration
    if (products) {
      await redis.set(CACHE_KEY, products, { ex: 3600 });
    }

    return products;
  } catch (error) {
    console.error('Redis Cache Error:', error);
    // Fallback: hit DB directly if Redis fails to ensure 100% uptime
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('products').select('*').eq('is_active', true);
    return data;
  }
}

export async function invalidateProductCache() {
  await redis.del('products:catalog:active');
}
