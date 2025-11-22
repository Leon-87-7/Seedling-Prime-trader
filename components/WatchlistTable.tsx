'use client';

import { useState, useMemo } from 'react';
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
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type {
  StockQuoteData,
  StockProfileData,
  StockMetricsData,
} from '@/lib/actions/finnhub.actions';

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

export default function WatchlistTable({
  items,
}: WatchlistTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(null);

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
    if (!items || !sortField || !sortDirection) return items || [];

    return [...items].sort((a, b) => {
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
  }, [items, sortField, sortDirection]);

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
      case 'Alert':
        return { field: 'company', sortable: false }; // Non-sortable
      default:
        return null;
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Your watchlist is empty</p>
        <p className="text-sm mt-2">
          Add stocks to your watchlist to track them here
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
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
          const price = item.quote?.currentPrice
            ? formatPrice(item.quote.currentPrice)
            : '-';
          const change = item.quote?.percentChange
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

          return (
            <TableRow key={item.symbol}>
              <TableCell className="text-left">
                <WatchlistButton
                  symbol={item.symbol}
                  company={item.company}
                  isInWatchlist={true}
                  showTrashIcon={false}
                  type="icon"
                />
              </TableCell>
              <TableCell className="text-left">
                <span className="font-medium">{item.symbol}</span>
                <span className="text-gray-400"> | </span>
                <span>{item.company}</span>
              </TableCell>
              <TableCell className="text-left">{price}</TableCell>
              <TableCell className={`text-left ${changeColor}`}>
                {change}
              </TableCell>
              <TableCell className="text-left">{marketCap}</TableCell>
              <TableCell className="text-left">{peRatio}</TableCell>
              <TableCell className="text-left">-</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
