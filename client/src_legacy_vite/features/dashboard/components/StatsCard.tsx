import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  description?: string;
  loading?: boolean;
}

/**
 * StatsCard Component
 * Displays a single statistic with icon, value, and optional trend
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
  description,
  loading = false,
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 bg-gray-200 rounded animate-pulse" />
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold">{value}</p>
              {description && (
                <p className="mt-1 text-xs text-gray-500">{description}</p>
              )}
              {trend && (
                <p
                  className={`mt-2 text-sm font-medium ${
                    trendPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend}
                </p>
              )}
            </>
          )}
        </div>
        <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </Card>
  );
};
