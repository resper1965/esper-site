import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: string | number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconBg = 'bg-grey-100',
  iconColor = 'text-grey-600',
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-grey-200 shadow-sm p-6 ${className}`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="ml-5 flex-1 min-w-0">
          <p className="text-sm font-medium text-grey-500 truncate">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold text-grey-900">{value}</p>
            {trend && (
              <p
                className={`ml-2 text-sm font-medium ${
                  trend.positive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.positive ? '+' : ''}{trend.value}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

