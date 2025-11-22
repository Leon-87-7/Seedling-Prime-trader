import { Skeleton } from './ui/skeleton';

interface TradingViewWidgetSkeletonProps {
  height?: number;
  title?: string;
}

export default function TradingViewWidgetSkeleton({
  height = 600,
  title,
}: TradingViewWidgetSkeletonProps) {
  return (
    <div className="w-full">
      {title && (
        <div className="mb-5">
          <Skeleton className="h-8 w-48" />
        </div>
      )}
      <div className="tradingview-widget-container">
        <Skeleton
          className="w-full rounded-lg"
          style={{ height: `${height}px` }}
        />
      </div>
    </div>
  );
}
