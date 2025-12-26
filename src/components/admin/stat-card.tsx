'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: string | number;
    positive: boolean;
    label?: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('border-slate-800 bg-slate-900', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-400 truncate">
              {title}
            </p>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-slate-100">
                {value}
              </p>
              {trend && (
                <span
                  className={cn(
                    'ml-2 text-sm font-medium',
                    trend.positive
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  )}
                >
                  {trend.positive ? '+' : ''}{trend.value}
                  {trend.label && (
                    <span className="ml-1 text-slate-400">{trend.label}</span>
                  )}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-slate-500">{description}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800">
              <div className="text-slate-300">{icon}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

