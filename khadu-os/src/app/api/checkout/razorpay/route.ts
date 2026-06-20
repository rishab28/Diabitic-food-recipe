import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSupabaseAdmin } from '@/lib/supabase';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { depositAmount, totalAmount, customerInfo, orderItems } = body;

    // Validate request
    if (!depositAmount || !totalAmount || !customerInfo || !orderItems) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch product details to check types for all items in the order (security rule validation)
    const productIds = orderItems.map((item: any) => item.productId);
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('id, type')
      .in('id', productIds);

    if (prodError || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: 'Products not found in database' }, { status: 404 });
    }

    // Verify all requested products exist
    if (dbProducts.length !== new Set(productIds).size) {
      return NextResponse.json({ error: 'One or more products in the order could not be validated' }, { status: 400 });
    }

    const hasDigitalItem = dbProducts.some((p: any) => p.type === 'digital');

    if (hasDigitalItem) {
      // Digital or mixed carts containing digital items must be paid in full
      if (Number(depositAmount) < Number(totalAmount)) {
        return NextResponse.json({ error: 'Partial payments are not allowed for digital products or carts containing digital items. Full payment required.' }, { status: 400 });
      }
    } else {
      // Physical products - check minimum 30% rule
      const minRequiredDeposit = Math.ceil((Number(totalAmount) * 30) / 100);
      if (Number(depositAmount) < minRequiredDeposit) {
        return NextResponse.json({ error: 'Deposit amount is below the 30% minimum threshold for physical products.' }, { status: 400 });
      }
    }


    // 1. Create or Update Customer (Upsert)
    // In an enterprise system, this should resolve identity gracefully
    let customerId;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customerInfo.phone)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await supabase.from('customers').update({ name: customerInfo.name, email: customerInfo.email, crm_stage: 'checkout_started' }).eq('id', customerId);
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([{ email: customerInfo.email, phone: customerInfo.phone, name: customerInfo.name, crm_stage: 'checkout_started' }])
        .select()
        .single();
      
      if (customerError) throw customerError;
      customerId = newCustomer.id;
    }

    // 2. Create the Order in Supabase with 'pending' status
    const codBalance = totalAmount - depositAmount;
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: customerId,
        status: 'pending',
        total_amount: totalAmount,
        prepaid_amount: depositAmount,
        cod_collectible_amount: codBalance,
        shipping_address: customerInfo.address,
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Insert Order Items
    const itemsToInsert = orderItems.map((item: any) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    await supabase.from('order_items').insert(itemsToInsert);

    // 4. Generate Razorpay Order
    // Amount in Razorpay is always in smallest currency unit (paise)
    const options = {
      amount: depositAmount * 100, 
      currency: "INR",
      receipt: `receipt_order_${newOrder.id}`,
      notes: {
        supabase_order_id: newOrder.id,
        is_hybrid_cod: codBalance > 0 ? "true" : "false"
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 5. Create Pending Transaction Record (Ledger)
    await supabase.from('transactions').insert([{
      order_id: newOrder.id,
      gateway_transaction_id: razorpayOrder.id,
      amount: depositAmount,
      status: 'pending',
    }]);

    return NextResponse.json({ 
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      supabaseOrderId: newOrder.id
    });

  } catch (error: any) {
    console.error('Razorpay Order Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
