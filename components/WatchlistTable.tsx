'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WATCHLIST_TABLE_HEADER } from '@/lib/constants';
import WatchlistButton from '@/components/WatchlistButton';
import {
  formatPrice,
  formatChangePercent,
  getChangeColorClass,
  formatMarketCapValue,
} from '@/lib/utils';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';
import AlertDialog from '@/components/AlertDialog';
import { getAlertsBySymbol } from '@/lib/actions/alert.actions';
import type { AlertType } from '@/database/models/alert.model';
import type {
  StockQuoteData,
  StockProfileData,
  StockMetricsData,
} from '@/lib/actions/finnhub.actions';
import SearchTriggerCard from './SearchTriggerCard';

export interface WatchlistItem {
  symbol: string;
  company: string;
  addedAt: Date;
  quote: StockQuoteData | null;
  profile: StockProfileData | null;
  metrics: StockMetricsData | null;
}

interface WatchlistTableProps {
  items: WatchlistItem[];
}

type SortField =
  | 'company'
  | 'price'
  | 'change'
  | 'marketCap'
  | 'peRatio';
type SortDirection = 'asc' | 'desc' | null;

interface AlertInfo {
  count: number;
  types: AlertType[];
  hasActive: boolean;
}

export default function WatchlistTable({
  items,
}: WatchlistTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(null);
  const [localItems, setLocalItems] =
    useState<WatchlistItem[]>(items);
  const [alertsMap, setAlertsMap] = useState<Map<string, AlertInfo>>(
    new Map()
  );

  // Update local items when props change
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const loadAllAlerts = useCallback(async () => {
    const results = await Promise.all(
      items.map(async (item) => {
        const alerts = await getAlertsBySymbol(item.symbol);
        return { symbol: item.symbol, alerts };
      })
    );

    const newAlertsMap = new Map<string, AlertInfo>();

    results.forEach(({ symbol, alerts }) => {
      const activeAlerts = alerts.filter(
        (a) => a.isActive && !a.isTriggered
      );

      newAlertsMap.set(symbol, {
        count: activeAlerts.length,
        types: activeAlerts.map((a) => a.alertType),
        hasActive: activeAlerts.length > 0,
      });
    });

    setAlertsMap(newAlertsMap);
  }, [items]);

  // Load alerts for all symbols
  useEffect(() => {
    loadAllAlerts();
  }, [loadAllAlerts]);

  const reloadAlertsForSymbol = async (symbol: string) => {
    try {
      const alerts = await getAlertsBySymbol(symbol);
      const activeAlerts = alerts.filter(
        (a) => a.isActive && !a.isTriggered
      );

      setAlertsMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(symbol, {
          count: activeAlerts.length,
          types: activeAlerts.map((a) => a.alertType),
          hasActive: activeAlerts.length > 0,
        });
        return newMap;
      });
    } catch (error) {
      console.error(
        'Failed to reload alerts for symbol:',
        symbol,
        error
      );
    }
  };

  const handleWatchlistChange = (
    symbol: string,
    isAdded: boolean
  ) => {
    if (!isAdded) {
      // Remove item from local state immediately
      setLocalItems((prev) =>
        prev.filter((item) => item.symbol !== symbol)
      );
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = useMemo(() => {
    if (!localItems || !sortField || !sortDirection)
      return localItems || [];

    return [...localItems].sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortField) {
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'price':
          aValue = a.quote?.currentPrice ?? -Infinity;
          bValue = b.quote?.currentPrice ?? -Infinity;
          break;
        case 'change':
          aValue = a.quote?.percentChange ?? -Infinity;
          bValue = b.quote?.percentChange ?? -Infinity;
          break;
        case 'marketCap':
          aValue = a.profile?.marketCap ?? -Infinity;
          bValue = b.profile?.marketCap ?? -Infinity;
          break;
        case 'peRatio':
          aValue = a.metrics?.peRatio ?? -Infinity;
          bValue = b.metrics?.peRatio ?? -Infinity;
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [localItems, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />
      );
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4 inline" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 inline" />;
  };

  const getHeaderConfig = (
    header: string
  ): { field: SortField; sortable: boolean } | null => {
    switch (header) {
      case 'Company':
        return { field: 'company', sortable: true };
      case 'Price':
        return { field: 'price', sortable: true };
      case 'Change':
        return { field: 'change', sortable: true };
      case 'Market Cap':
        return { field: 'marketCap', sortable: true };
      case 'P/E Ratio':
        return { field: 'peRatio', sortable: true };
      case '52 Week Range':
        return { field: null as any, sortable: false }; // Non-sortable
      case 'Alerts':
        return { field: null as any, sortable: false }; // Non-sortable
      default:
        return null;
    }
  };

  const getAlertIcon = (symbol: string) => {
    const alertInfo = alertsMap.get(symbol);

    if (!alertInfo || !alertInfo.hasActive) {
      // No active alerts
      return <BellOff className="h-4 w-4 text-blue-500" />;
    }

    const { types, count } = alertInfo;

    if (!types || types.length === 0) {
      return <Bell className="h-4 w-4 text-yellow-400" />;
    }

    // If multiple alerts, show Bell with count badge
    if (count > 1) {
      return (
        <div className="relative inline-flex">
          <Bell className="h-4 w-4 text-yellow-400" />
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {count}
          </span>
        </div>
      );
    }

    // Single alert - show specific icon based on type
    const alertType = types[0];
    if (alertType === 'price_upper') {
      return (
        <span className="inline-flex rounded-full bg-gray-600 w-6 h-6 items-center justify-center hover:bg-stone-800 transition-colors">
          <TrendingUp className="h-4 w-4 text-green-500" />
        </span>
      );
    } else if (alertType === 'price_lower') {
      return (
        <span className="inline-flex rounded-full bg-gray-600 w-6 h-6 items-center justify-center hover:bg-stone-800 transition-colors">
          <TrendingDown className="h-4 w-4 text-red-500" />
        </span>
      );
    } else if (alertType === 'volume') {
      return (
        <span className="inline-flex rounded-full bg-gray-600 w-6 h-6 items-center justify-center hover:bg-stone-800 transition-colors">
          <Activity className="h-4 w-4 text-blue-500" />
        </span>
      );
    }

    // Fallback
    return <Bell className="h-4 w-4 text-yellow-400" />;
  };

  if (!localItems || localItems.length === 0) {
    return (
      <>
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Your watchlist is empty</p>
          <p className="text-sm mt-2">
            Add stocks to your watchlist to track them here
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-100 mb-6">
            Top Stories by Symbol
          </h2>

          <SearchTriggerCard />
        </div>
      </>
    );
  }

  return (
    <Table className="watchlist-table">
      <TableHeader className="table-header-row">
        <TableRow className="table-row">
          <TableHead className="text-left "></TableHead>
          {WATCHLIST_TABLE_HEADER.map((header) => {
            const config = getHeaderConfig(header);
            const isSortable = config?.sortable ?? false;

            return (
              <TableHead
                key={header}
                className={`text-left ${isSortable ? 'cursor-pointer select-none hover:text-gray-300' : ''}`}
                onClick={() =>
                  isSortable && config && handleSort(config.field)
                }
              >
                {header}
                {isSortable && config && getSortIcon(config.field)}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedItems.map((item) => {
          const price =
            item.quote?.currentPrice !== null &&
            item.quote?.currentPrice !== undefined
              ? formatPrice(item.quote.currentPrice)
              : '-';
          const change =
            item.quote?.percentChange !== null &&
            item.quote?.percentChange !== undefined
              ? formatChangePercent(item.quote.percentChange)
              : '-';
          const changeColor = getChangeColorClass(
            item.quote?.percentChange
          );
          const marketCap = item.profile?.marketCap
            ? formatMarketCapValue(item.profile.marketCap * 1_000_000) // Convert to USD (Finnhub returns in millions)
            : '-';
          const peRatio =
            item.metrics?.peRatio !== null &&
            item.metrics?.peRatio !== undefined
              ? item.metrics.peRatio.toFixed(2)
              : '-';
          const weekRange =
            item.metrics?.weekLow52 !== null &&
            item.metrics?.weekLow52 !== undefined &&
            item.metrics?.weekHigh52 !== null &&
            item.metrics?.weekHigh52 !== undefined
              ? `${formatPrice(item.metrics.weekLow52)} - ${formatPrice(item.metrics.weekHigh52)}`
              : '-';

          return (
            <TableRow
              key={item.symbol}
              className="cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => router.push(`/stocks/${item.symbol}`)}
            >
              <TableCell
                className="text-left table-cell"
                onClick={(e) => e.stopPropagation()}
              >
                <WatchlistButton
                  symbol={item.symbol}
                  company={item.company}
                  isInWatchlist={true}
                  showTrashIcon={false}
                  type="icon"
                  onWatchlistChange={handleWatchlistChange}
                />
              </TableCell>
              <TableCell className="text-left">
                <span className="font-medium">{item.symbol}</span>
                <span className="text-gray-400"> | </span>
                <span>{item.company}</span>
              </TableCell>
              <TableCell className="text-left table-cell ">
                {price}
              </TableCell>
              <TableCell className={`text-left ${changeColor}`}>
                {change}
              </TableCell>
              <TableCell className="text-left">{marketCap}</TableCell>
              <TableCell className="text-left">{peRatio}</TableCell>
              <TableCell className="text-left">{weekRange}</TableCell>
              <TableCell
                className="text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <AlertDialog
                  symbol={item.symbol}
                  company={item.company}
                  onAlertsChange={() =>
                    reloadAlertsForSymbol(item.symbol)
                  }
                >
                  <button
                    className="flex items-center rounded-3xl"
                    type="button"
                    aria-label={`Manage alerts for ${item.symbol}`}
                  >
                    {getAlertIcon(item.symbol)}
                  </button>
                </AlertDialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
