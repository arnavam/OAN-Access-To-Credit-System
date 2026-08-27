'use client';

import { selectBankMetrics, selectBankStages } from '@/features/loans/store/bankApplicationsSlice';
import { useAppSelector } from '@/store/hooks';
import { Award, CheckCircle2, Clock, FileCheck, FileText, LucideIcon, Users, XCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { MotionEffect } from '@/components/motion/MotionEffect';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

function StatCard({ label, value, icon: Icon, iconBgColor, iconColor }: StatCardProps) {
  return (
    <div className="group bg-white border border-[#F1F3F4] rounded-xl p-5 flex items-center justify-between shadow-sm shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div>
        <p className="text-[14px] font-semibold text-[#6B7280] mb-1">{label}</p>
        <h4 className="text-[32px] font-bold text-[#1F2937] leading-none">{value}</h4>
      </div>
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md ${iconBgColor}`}>
        <Icon size={32} className={`${iconColor} transition-transform duration-300`} />
      </div>
    </div>
  );
}

function getStageCardIcon(label: string, archetype?: string): { icon: LucideIcon; iconBgColor: string; iconColor: string } {
  const lower = label.toLowerCase();
  if (lower.includes('submit')) {
    return { icon: FileText, iconBgColor: 'bg-blue-100', iconColor: 'text-blue-500' };
  }
  if (lower.includes('verif') || lower.includes('doc') || lower.includes('kyc')) {
    return { icon: FileCheck, iconBgColor: 'bg-indigo-100', iconColor: 'text-indigo-500' };
  }
  if (lower.includes('underwrit') || lower.includes('review') || lower.includes('process')) {
    return { icon: Clock, iconBgColor: 'bg-cyan-100', iconColor: 'text-cyan-500' };
  }
  if (lower.includes('approv') || lower.includes('grant') || lower.includes('sanction')) {
    return { icon: CheckCircle2, iconBgColor: 'bg-emerald-100', iconColor: 'text-emerald-500' };
  }
  if (lower.includes('disburs') || lower.includes('complet')) {
    return { icon: Award, iconBgColor: 'bg-green-100', iconColor: 'text-green-500' };
  }
  if (lower.includes('reject') || lower.includes('declin') || lower.includes('cancel')) {
    return { icon: XCircle, iconBgColor: 'bg-red-100', iconColor: 'text-red-500' };
  }
  if (archetype === 'Completed') {
    return { icon: Award, iconBgColor: 'bg-green-100', iconColor: 'text-green-500' };
  }
  if (archetype === 'Rejected' || archetype === 'Cancelled') {
    return { icon: XCircle, iconBgColor: 'bg-red-100', iconColor: 'text-red-500' };
  }
  return { icon: FileText, iconBgColor: 'bg-cyan-100', iconColor: 'text-cyan-500' };
}

/**
 * Stage counts and metrics for the bank applications portal.
 * Showcases the bank-specific loan stages dynamically.
 */
export default function StatCards() {
  const metrics = useAppSelector(selectBankMetrics);
  const stages = useAppSelector(selectBankStages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      Array.from(container.children).forEach((child, index) => {
        const childRect = child.getBoundingClientRect();
        const childCenter = childRect.left + childRect.width / 2;
        const distance = Math.abs(containerCenter - childCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    setTimeout(handleScroll, 100);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const child = scrollRef.current.children[index] as HTMLElement;
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const hasStages = stages && stages.length > 0;
  const cardsData = hasStages 
    ? [
        { label: 'Total Applications', value: metrics.total, icon: Users, iconBgColor: 'bg-blue-100', iconColor: 'text-blue-500' },
        ...stages.map((stage) => {
          const { icon, iconBgColor, iconColor } = getStageCardIcon(stage.label, stage.archetype_state);
          return {
            label: stage.label,
            value: stage.application_count ?? 0,
            icon,
            iconBgColor,
            iconColor,
          };
        })
      ]
    : [
        { label: 'Total Applications', value: metrics.total, icon: Users, iconBgColor: 'bg-blue-100', iconColor: 'text-blue-500' },
        { label: 'In Progress', value: metrics.inTransition, icon: FileText, iconBgColor: 'bg-cyan-100', iconColor: 'text-cyan-500' },
        { label: 'Completed', value: metrics.completed, icon: Award, iconBgColor: 'bg-green-100', iconColor: 'text-green-500' },
        { label: 'Cancelled', value: metrics.cancelled, icon: XCircle, iconBgColor: 'bg-red-100', iconColor: 'text-red-500' },
      ];

  const totalCards = cardsData.length;

  return (
    <div className="relative mb-6">
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div
        ref={scrollRef}
        className="flex xl:grid xl:grid-cols-6 gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar pb-2 xl:pb-1 px-1 xl:px-0"
      >
        {cardsData.map((card, index) => (
          <MotionEffect
            key={card.label + index}
            delay={index * 70}
            slide={{ direction: 'up', offset: 14 }}
            className="group w-[85vw] sm:w-[320px] xl:w-auto shrink-0 snap-center xl:snap-align-none bg-white border border-[#F1F3F4] rounded-xl p-5 flex items-center justify-between shadow-sm shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div>
              <p className="text-[14px] font-semibold text-[#6B7280] mb-1">{card.label}</p>
              <h4 className="text-[32px] font-bold text-[#1F2937] leading-none">{card.value}</h4>
            </div>
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md ${card.iconBgColor}`}>
              <card.icon size={32} className={`${card.iconColor} transition-transform duration-300`} />
            </div>
          </MotionEffect>
        ))}
      </div>

      {/* Pagination Dots (Mobile & Tablet) */}
      <div className="flex xl:hidden justify-center items-center gap-2 mt-4">
        {[0, 1, 2].map((dotIndex) => {
          const chunkSize = Math.max(1, Math.round(totalCards / 3));
          const activeDot = Math.min(2, Math.floor(activeIndex / chunkSize));
          const isActive = activeDot === dotIndex;

          return (
            <button
              key={dotIndex}
              type="button"
              onClick={() => scrollTo(dotIndex * chunkSize)}
              className={`transition-all duration-300 rounded-full ${isActive
                  ? 'bg-[#16A34A] w-6 h-2'
                  : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                }`}
              aria-label={`Go to page ${dotIndex + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

