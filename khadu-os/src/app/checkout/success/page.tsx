import { getSupabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{
    payment_id?: string;
    order_id?: string;
    supabase_order_id?: string;
  }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const paymentId = resolvedParams.payment_id || '';
  const orderId = resolvedParams.order_id || '';
  const supabaseOrderId = resolvedParams.supabase_order_id || '';

  let customerName = 'Customer';
  let totalAmount = 0;
  let prepaidAmount = 0;
  let codBalance = 0;
  let planTitle = 'Pro Recipe Bundle';

  if (supabaseOrderId) {
    try {
      const supabase = getSupabaseAdmin();
      // Fetch order details
      const { data: orderData } = await supabase
        .from('orders')
        .select(`
          total_amount,
          prepaid_amount,
          cod_collectible_amount,
          customers ( name )
        `)
        .eq('id', supabaseOrderId)
        .single();

      if (orderData) {
        totalAmount = Number(orderData.total_amount);
        prepaidAmount = Number(orderData.prepaid_amount);
        codBalance = Number(orderData.cod_collectible_amount);
        const customer = orderData.customers as any;
        if (customer?.name) {
          customerName = customer.name;
        }

        // Determine plan title based on total amount
        if (totalAmount === 299) {
          planTitle = '🌱 Starter Bundle';
        } else if (totalAmount === 499) {
          planTitle = '🏆 Pro Bundle';
        } else if (totalAmount === 999) {
          planTitle = '💎 Premium Masterclass';
        }
      }
    } catch (err) {
      console.error('Error fetching order for success page:', err);
    }
  }

  return (
    <main className="min-h-screen bg-background py-16 px-4 flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full bg-card border border-border-subtle rounded-2xl p-8 md:p-12 shadow-2xl text-center space-y-6">
        
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-accent-green/10 border border-accent-green/20 rounded-full flex items-center justify-center text-4xl">
          🎉
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-serif text-text-primary font-bold">
            Order Confirmed, {customerName}!
          </h1>
          <p className="text-accent-green font-medium text-lg">
            Your payment of ₹{prepaidAmount || totalAmount} was successful!
          </p>
        </div>

        {/* Order Details box */}
        <div className="bg-[#0f0f14] border border-border-subtle rounded-xl p-5 text-left text-sm space-y-3">
          <div className="flex justify-between text-text-secondary">
            <span>Product:</span>
            <span className="font-semibold text-text-primary">{planTitle}</span>
          </div>
          {paymentId && (
            <div className="flex justify-between text-text-secondary">
              <span>Transaction ID:</span>
              <span className="font-mono text-xs text-text-muted">{paymentId}</span>
            </div>
          )}
          {orderId && (
            <div className="flex justify-between text-text-secondary">
              <span>Payment Gateway Ref:</span>
              <span className="font-mono text-xs text-text-muted">{orderId}</span>
            </div>
          )}
          <div className="border-t border-border-subtle my-2 pt-2 flex justify-between text-text-secondary">
            <span>Total Value:</span>
            <span className="font-semibold text-text-primary">₹{totalAmount}</span>
          </div>
          {codBalance > 0 && (
            <div className="flex justify-between text-accent-primary bg-accent-primary/5 p-2 rounded border border-accent-primary/10">
              <span>COD Balance to Pay on Delivery:</span>
              <span className="font-bold">₹{codBalance}</span>
            </div>
          )}
        </div>

        {/* Delivery Message */}
        <div className="space-y-4 py-4">
          <h3 className="text-lg font-semibold text-text-primary">📥 Instant Access Information</h3>
          <p className="text-text-secondary text-sm leading-relaxed max-w-lg mx-auto">
            We have sent the complete PDF download link, meal planners, and bonus files directly to your **WhatsApp number** and **Email address**. It should arrive in your inbox within 60 seconds!
          </p>
          
          <div className="bg-card-hover p-4 rounded-xl border border-border-subtle inline-block">
            <p className="text-xs text-text-muted">
              🚨 Didn't receive the WhatsApp message? Check your Email Spam folder or contact support at <strong className="text-accent-primary">support@khadufarm.com</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a
            href="https://superprofile.bio/vp/100--healthy-and-diabetic-friendly-indian-recipes" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent-green hover:bg-accent-green/90 text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition-transform hover:scale-[1.02] text-sm"
          >
            Download eBook Instantly
          </a>
          <Link
            href="/"
            className="bg-zinc-800 hover:bg-zinc-700 text-text-primary font-bold py-3.5 px-8 rounded-full transition-transform hover:scale-[1.02] text-sm"
          >
            Return to Store
          </Link>
        </div>

      </div>
    </main>
  );
}
