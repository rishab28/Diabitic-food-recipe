"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  prepaid_amount: number;
  cod_collectible_amount: number;
  created_at: string;
  shipping_address: any;
  customers: {
    name: string;
    phone: string;
    email: string;
  } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ orderId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [message, setMessage] = useState('');

  // Perishable hold check
  const currentDay = new Date().getDay(); // 0 = Sunday, 4 = Thursday, 5 = Friday
  const isHoldActive = currentDay === 4 || currentDay === 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    // Suppressing TS error for relational joins
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        prepaid_amount,
        cod_collectible_amount,
        shipping_address,
        created_at,
        customers ( name, phone, email )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      setMessage('❌ Failed to fetch orders.');
    } else {
      setOrders((data as any) || []);
    }
    setLoading(false);
  };

  const handleDoubleClick = (orderId: string, field: string, currentValue: any) => {
    setEditingCell({ orderId, field });
    setEditValue(typeof currentValue === 'object' ? JSON.stringify(currentValue) : String(currentValue));
  };

  const handleCellSave = async (orderId: string, field: string) => {
    if (!editingCell) return;

    try {
      let updatePayload: any = {};
      
      if (field === 'status') {
        updatePayload[field] = editValue;
      } else if (field === 'prepaid_amount') {
        const prepaid = Number(editValue);
        const order = orders.find(o => o.id === orderId);
        if (order) {
          updatePayload.prepaid_amount = prepaid;
          updatePayload.cod_collectible_amount = order.total_amount - prepaid;
        }
      } else if (field === 'shipping_address') {
        try {
          updatePayload[field] = JSON.parse(editValue);
        } catch {
          // Fallback if not JSON
          updatePayload[field] = { street: editValue };
        }
      }

      const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId);

      if (error) throw error;
      
      setMessage('✅ Grid updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Refresh local state
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const updated = { ...order, ...updatePayload };
          return updated;
        }
        return order;
      }));

    } catch (err: any) {
      console.error('Cell edit error:', err);
      setMessage(`❌ Failed to update: ${err.message}`);
    } finally {
      setEditingCell(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'hold': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Orders CRM</h1>
          <p className="text-sm text-text-muted mt-1">
            Double-click cells to inline edit status, prepaid amount, or shipping address.
          </p>
        </div>
        
        {isHoldActive && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            ⚠️ <strong>Dispatch Hold Active:</strong> Perishable orders will be held until Monday.
          </div>
        )}
      </div>

      {message && (
        <div className="bg-[#0f0f14] border border-border-subtle p-3 rounded-lg text-sm font-semibold text-accent-primary">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center text-text-muted py-12">Loading spreadsheet logs...</div>
      ) : (
        <div className="bg-card border border-border-subtle rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary whitespace-nowrap">
              <thead className="bg-[#0f0f14] border-b border-border-subtle uppercase text-xs text-text-muted font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total (₹)</th>
                  <th className="px-6 py-4 text-right">Prepaid (₹)</th>
                  <th className="px-6 py-4 text-right text-accent-primary">COD Balance (₹)</th>
                  <th className="px-6 py-4">Shipping Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-mono text-xs">
                {orders.length > 0 ? (
                  orders.map((order) => {
                    const customer = order.customers;
                    const addressStr = typeof order.shipping_address === 'object' 
                      ? `${order.shipping_address.street || ''}, ${order.shipping_address.city || ''} (${order.shipping_address.pincode || ''})`
                      : String(order.shipping_address || '');

                    return (
                      <tr key={order.id} className="hover:bg-card-hover transition-colors">
                        {/* Order ID */}
                        <td className="px-6 py-4 font-mono text-[10px] text-text-muted">
                          {order.id}
                        </td>
                        
                        {/* Date */}
                        <td className="px-6 py-4">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4 font-sans">
                          <div className="font-semibold text-text-primary">{customer?.name || 'Unknown'}</div>
                          <div className="text-[10px] text-text-muted">{customer?.phone || 'No phone'}</div>
                        </td>

                        {/* Status (Editable) */}
                        <td className="px-6 py-4">
                          {editingCell?.orderId === order.id && editingCell?.field === 'status' ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleCellSave(order.id, 'status')}
                              autoFocus
                              className="bg-[#0f0f14] border border-accent-primary text-text-primary rounded px-2 py-1 focus:outline-none"
                            >
                              <option value="pending">PENDING</option>
                              <option value="processing">PROCESSING</option>
                              <option value="hold">HOLD</option>
                              <option value="shipped">SHIPPED</option>
                              <option value="delivered">DELIVERED</option>
                            </select>
                          ) : (
                            <span 
                              onDoubleClick={() => handleDoubleClick(order.id, 'status', order.status)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold border cursor-pointer select-none uppercase ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </span>
                          )}
                        </td>

                        {/* Total Amount */}
                        <td className="px-6 py-4 text-right font-semibold text-text-primary">
                          {order.total_amount}
                        </td>

                        {/* Prepaid Deposit (Editable) */}
                        <td className="px-6 py-4 text-right font-semibold text-green-400">
                          {editingCell?.orderId === order.id && editingCell?.field === 'prepaid_amount' ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleCellSave(order.id, 'prepaid_amount')}
                              onKeyDown={(e) => e.key === 'Enter' && handleCellSave(order.id, 'prepaid_amount')}
                              autoFocus
                              className="bg-[#0f0f14] border border-accent-primary text-green-400 rounded px-2 py-1 text-right w-20 focus:outline-none"
                            />
                          ) : (
                            <span 
                              onDoubleClick={() => handleDoubleClick(order.id, 'prepaid_amount', order.prepaid_amount)}
                              className="cursor-pointer select-none underline decoration-dashed decoration-green-400/50"
                            >
                              {order.prepaid_amount}
                            </span>
                          )}
                        </td>

                        {/* COD Balance (Computed) */}
                        <td className="px-6 py-4 text-right font-bold text-accent-primary">
                          {order.cod_collectible_amount}
                        </td>

                        {/* Shipping Address (Editable) */}
                        <td className="px-6 py-4 font-sans max-w-xs truncate">
                          {editingCell?.orderId === order.id && editingCell?.field === 'shipping_address' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleCellSave(order.id, 'shipping_address')}
                              onKeyDown={(e) => e.key === 'Enter' && handleCellSave(order.id, 'shipping_address')}
                              autoFocus
                              className="bg-[#0f0f14] border border-accent-primary text-text-primary rounded px-2 py-1 w-full focus:outline-none"
                            />
                          ) : (
                            <span 
                              onDoubleClick={() => handleDoubleClick(order.id, 'shipping_address', order.shipping_address)}
                              className="cursor-pointer select-none border-b border-dashed border-border-subtle pb-0.5 hover:text-text-primary"
                              title="Double click to edit address JSON/text"
                            >
                              {addressStr || 'Double click to add address'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-text-muted font-sans">
                      No orders found. Connect Meta Ads and start selling!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
