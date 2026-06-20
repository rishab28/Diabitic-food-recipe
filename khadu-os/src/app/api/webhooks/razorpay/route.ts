import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Signature' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    // Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret as string)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const supabase = getSupabaseAdmin();

    // Handle Payment Success
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id; // Razorpay order id

      // 1. Mark transaction as success
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .update({ status: 'success', gateway_response: paymentEntity })
        .eq('gateway_transaction_id', orderId)
        .select()
        .single();

      if (txError || !transaction) {
        console.error('Transaction update failed:', txError);
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      // 2. Mark Supabase order as 'processing' (deposit paid)
      const supabaseOrderId = transaction.order_id;
      
      await supabase
        .from('orders')
        .update({ status: 'processing' })
        .eq('id', supabaseOrderId);

      // 3. Update customer CRM stage
      const { data: orderData } = await supabase.from('orders').select('customer_id').eq('id', supabaseOrderId).single();
      if (orderData?.customer_id) {
        await supabase
          .from('customers')
          .update({ crm_stage: 'completed_buyer' })
          .eq('id', orderData.customer_id);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
