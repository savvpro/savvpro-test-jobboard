"use client";

import React, { useEffect, useState } from 'react';

interface DashboardStatProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accentColor?: string;
}

export default function DashboardStat({ label, value, icon, accentColor = '#0066CC' }: DashboardStatProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);
  const isNumeric = typeof value === 'number';

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value);
      return;
    }

    const duration = 800; // Count-up animation duration
    const startValue = 0;
    const endValue = value as number;
    let startTime: number | null = null;
    let animationFrameId: number;

    const updateCounter = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;

      if (elapsedTime < duration) {
        // Simple linear interpolation
        const nextValue = Math.min(startValue + (endValue - startValue) * (elapsedTime / duration), endValue);
        setDisplayValue(Math.floor(nextValue));
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, isNumeric]);

  return (
    <div className="bg-white border border-border rounded-[18px] p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#BBBBC0]">
      <div 
        className="w-8 h-8 rounded-full mb-6 flex items-center justify-center bg-gray-50"
        style={{ color: accentColor }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[40px] font-bold tracking-[-1.5px] text-textPrimary leading-none mb-1">
          {displayValue}
        </div>
        <div className="text-[14px] text-textSecondary font-medium">
          {label}
        </div>
      </div>
    </div>
  );
}