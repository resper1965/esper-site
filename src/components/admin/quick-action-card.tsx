'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  className,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block">
      <Card className={cn(
        'border-slate-800 bg-slate-900 hover:border-primary/50 transition-all group',
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <div className="text-primary">{icon}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-base mb-1">{title}</CardTitle>
          <CardDescription className="text-sm text-slate-400">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

