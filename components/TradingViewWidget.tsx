'use client';
import useTradingViewWidget from '@/app/hooks/useTradingViewWidget';
import { cn } from '@/lib/utils';
import React, { memo } from 'react';
import TradingViewWidgetSkeleton from './TradingViewWidgetSkeleton';

interface TradingViewWidgetProps {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}
const TradingViewWidget = ({
  title,
  scriptUrl,
  config,
  height = 600,
  className,
}: TradingViewWidgetProps) => {
  const { containerRef, isLoading } = useTradingViewWidget(
    scriptUrl,
    config,
    height
  );

  return (
    <div className="w-full relative">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <TradingViewWidgetSkeleton
            height={height}
            title={title}
          />
        </div>
      )}
      <div
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      >
        {title && (
          <h3 className="mb-5 text-2xl font-semibold text-gray-100 ">
            {title}
          </h3>
        )}
        <div
          className={cn('tradingview-widget-container', className)}
          ref={containerRef}
        >
          <div
            className="tradingview-widget-container__widget"
            style={{ height, width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
