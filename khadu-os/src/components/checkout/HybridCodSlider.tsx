"use client";

import { useState, useEffect } from 'react';

interface HybridCodSliderProps {
  totalAmount: number;
  onDepositChange: (depositAmount: number, isFullPrepaid: boolean) => void;
}

export default function HybridCodSlider({ totalAmount, onDepositChange }: HybridCodSliderProps) {
  const minDepositPercentage = 30;
  const minDepositAmount = Math.ceil((totalAmount * minDepositPercentage) / 100);
  
  const [depositAmount, setDepositAmount] = useState<number>(minDepositAmount);
  
  // Set initial state
  useEffect(() => {
    setDepositAmount(minDepositAmount);
    onDepositChange(minDepositAmount, false);
  }, [totalAmount, minDepositAmount, onDepositChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setDepositAmount(value);
    onDepositChange(value, value >= totalAmount);
  };

  const isFullPrepaid = depositAmount >= totalAmount;
  const codBalance = totalAmount - depositAmount;

  return (
    <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg my-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-text-primary">Payment Terms</h3>
        {isFullPrepaid && (
          <span className="bg-accent-green/20 text-accent-green px-2 py-1 rounded text-xs font-semibold">
            ✓ 5% Extra Discount Applied
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Slider Area */}
        <div>
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>Pay Partial (Min {minDepositPercentage}%)</span>
            <span>Pay Full Prepaid</span>
          </div>
          <input 
            type="range" 
            min={minDepositAmount} 
            max={totalAmount} 
            value={depositAmount} 
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-primary"
          />
        </div>

        {/* Calculation Breakdown */}
        <div className="bg-[#0f0f14] p-4 rounded-lg space-y-2 border border-border-subtle">
          <div className="flex justify-between text-text-primary">
            <span>Pay Now (Deposit)</span>
            <span className="font-bold text-accent-primary">₹{depositAmount}</span>
          </div>
          <div className="flex justify-between text-text-muted text-sm border-t border-border-subtle pt-2">
            <span>Pay on Delivery (COD)</span>
            <span>₹{codBalance}</span>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center pt-2">
          Paying a minimum 30% deposit confirms your serious intent and helps us dispatch farm-fresh goods instantly.
        </p>
      </div>
    </div>
  );
}
