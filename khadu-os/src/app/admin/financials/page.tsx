"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Financials {
  grossRevenue: number;
  gatewayFees: number;
  shippingFees: number;
  marketingSpend: number;
  opex: number;
  cogs: number;
  netMargin: number;
}

export default function AdminFinancialsPage() {
  const [financials, setFinancials] = useState<Financials>({
    grossRevenue: 0,
    gatewayFees: 0,
    shippingFees: 0,
    marketingSpend: 0,
    opex: 0,
    cogs: 0,
    netMargin: 0
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Expenses Logging Form
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'Marketing',
    description: ''
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('total_amount, prepaid_amount, status');

      if (ordersErr) throw ordersErr;

      // Filter out pending (unpaid) orders for accurate bookkeeping
      const paidOrders = (orders || []).filter(o => o.status !== 'pending');
      const grossRev = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      
      // Gateway fees: 2% of prepaid transactions online
      const onlinePayments = paidOrders.reduce((sum, o) => sum + Number(o.prepaid_amount), 0);
      const gateway = onlinePayments * 0.02;

      // Shipping fees: Flat ₹90 estimated per dispatched order
      const shipping = paidOrders.length * 90;

      // COGS estimation: 35% of gross revenue for farm goods/digital delivery upkeep
      const cogsVal = grossRev * 0.35;

      // 2. Fetch Ad Spend Logs
      const { data: adSpend, error: adErr } = await supabase
        .from('daily_ad_spend')
        .select('amount_spent');

      if (adErr) throw adErr;
      const mktg = (adSpend || []).reduce((sum, a) => sum + Number(a.amount_spent), 0);

      // 3. Fetch Fixed OpEx Expenses
      const { data: expenses, error: expErr } = await supabase
        .from('store_expenses')
        .select('amount');

      if (expErr) throw expErr;
      const opexVal = (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0);

      // Calculations
      const net = grossRev - (gateway + shipping + cogsVal + mktg + opexVal);

      setFinancials({
        grossRevenue: grossRev,
        gatewayFees: gateway,
        shippingFees: shipping,
        marketingSpend: mktg,
        opex: opexVal,
        cogs: cogsVal,
        netMargin: net
      });

    } catch (err: any) {
      console.error('Error computing P&L financials:', err);
      setMessage(`❌ Failed to compute P&L: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      setMessage('⚠️ Please enter a valid amount.');
      return;
    }

    try {
      const amountNum = Number(expenseForm.amount);

      if (expenseForm.category === 'Marketing') {
        // Insert into daily_ad_spend
        const { error } = await supabase
          .from('daily_ad_spend')
          .insert([{
            campaign_name: expenseForm.description || 'Meta Manual Log',
            amount_spent: amountNum,
            logged_date: new Date().toISOString().split('T')[0]
          }]);
        if (error) throw error;
      } else {
        // Insert into store_expenses
        const { error } = await supabase
          .from('store_expenses')
          .insert([{
            amount: amountNum,
            category: expenseForm.category,
            description: expenseForm.description,
            incurred_at: new Date().toISOString().split('T')[0]
          }]);
        if (error) throw error;
      }

      setMessage('✅ Expense logged successfully!');
      setExpenseForm({ amount: '', category: 'Marketing', description: '' });
      fetchFinancialData();

    } catch (err: any) {
      console.error('Expense insertion error:', err);
      setMessage(`❌ Failed to log expense: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">P&L Financials Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Real-time margin audits, marketing deductions, and OpEx tracking.</p>
      </div>

      {message && (
        <div className="bg-[#0f0f14] border border-border-subtle p-3 rounded-lg text-sm font-semibold text-accent-primary">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center text-text-muted py-12">Calculating financial metrics...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Profit Breakdown Cards (Takes 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Net Margin Stat Hero */}
            <div className={`p-6 border rounded-xl flex flex-col justify-between ${financials.netMargin >= 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div>
                <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Net Profit / Margin</span>
                <h2 className={`text-4xl font-bold font-serif mt-2 ${financials.netMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{financials.netMargin.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </h2>
              </div>
              <p className="text-xs text-text-muted mt-4">
                *After subtracting COGS (35%), estimated shipping (₹90/order), payment gateway fees (2% online), ad spend, and fixed OpEx.
              </p>
            </div>

            {/* P&L Breakdown Table */}
            <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-text-primary mb-4">P&L Ledger Sheet</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                  <span className="text-text-secondary font-medium">Gross Sales Revenue</span>
                  <span className="text-text-primary font-bold">₹{financials.grossRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                  <span className="text-text-muted">Less: Cost of Goods Sold (COGS)</span>
                  <span className="text-red-400">-₹{financials.cogs.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                  <span className="text-text-muted">Less: Payment Gateway Fees (2% online)</span>
                  <span className="text-red-400">-₹{financials.gatewayFees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                  <span className="text-text-muted">Less: Logistics Shipping Cost (Est. ₹90/order)</span>
                  <span className="text-red-400">-₹{financials.shippingFees.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                  <span className="text-text-muted">Less: Meta Ads Marketing Spend</span>
                  <span className="text-red-400">-₹{financials.marketingSpend.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-text-muted">Less: Fixed OpEx (Software, Rent, Packaging)</span>
                  <span className="text-red-400">-₹{financials.opex.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 text-base font-bold">
                  <span className="text-text-primary">Net profit margin</span>
                  <span className={financials.netMargin >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ₹{financials.netMargin.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Side Column: Log Expense Forms (Takes 1 col) */}
          <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-text-primary">Log Expense / Ad Spend</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Manually record Meta Ads billing or fixed business costs to calculate real net margins.
            </p>

            <form onSubmit={handleExpenseSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs uppercase text-text-muted font-semibold block">Expense Type</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
                >
                  <option value="Marketing">Meta Ads Spend</option>
                  <option value="Software">SaaS / Domains</option>
                  <option value="Packaging">Packaging Boxes</option>
                  <option value="Other">Miscellaneous / OpEx</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase text-text-muted font-semibold block">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase text-text-muted font-semibold block">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Meta Ads June 19 Billing"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#0f0f14] border border-border-subtle rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent-primary hover:bg-accent-primary/95 text-white font-bold py-2.5 rounded-lg text-xs transition-transform hover:scale-[1.02] cursor-pointer"
              >
                Log Transaction Entry
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
