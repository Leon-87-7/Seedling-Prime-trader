'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command';
import { Item, ItemMedia } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { Button } from './ui/button';
import { Loader2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import { useDebounce } from '@/app/hooks/useDebounce';
import WatchlistButton from './WatchlistButton';

export default function SearchCommand({
  renderAs = 'button',
  label = 'Add stock',
  initialStocks,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] =
    useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();

  // Separate watchlist items from other stocks
  const watchlistStocks = stocks.filter(stock => stock.isInWatchlist);
  const otherStocks = stocks.filter(stock => !stock.isInWatchlist);

  const displayStocks = isSearchMode ? stocks : stocks;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSearch = useCallback(async () => {
    const query = searchTerm.trim();
    const activeSearch = !!query;

    if (!activeSearch) {
      setStocks(initialStocks);
      return;
    }

    setLoading(true);
    try {
      const results = await searchStocks(query);
      if (query === searchTerm.trim()) {
        setStocks(results);
      }
    } catch {
      if (query === searchTerm.trim()) {
        setStocks([]);
      }
    } finally {
      if (query === searchTerm.trim()) {
        setLoading(false);
      }
    }
  }, [searchTerm, initialStocks]);

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, debouncedSearch]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm('');
    setStocks(initialStocks);
  };

  const handleWatchlistChange = (
    symbol: string,
    isAdded: boolean
  ) => {
    // Update the local stocks state to reflect watchlist change
    setStocks((prevStocks) =>
      prevStocks.map((stock) =>
        stock.symbol === symbol
          ? { ...stock, isInWatchlist: isAdded }
          : stock
      )
    );
  };

  return (
    <>
      {renderAs === 'text' ? (
        <span
          onClick={() => setOpen(true)}
          className="search-text"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setOpen(true);
          }}
        >
          {label}
        </span>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="search-btn"
        >
          {label}
        </Button>
      )}
      <CommandDialog
        open={open}
        onOpenChange={handleSelectStock}
        className="search-dialog"
      >
        <div className="search-field">
          <CommandInput
            placeholder="Search stocks..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="search-input"
          />
          {loading && <Spinner />}
        </div>
        <CommandList className="search-list">
          {loading ? (
            <CommandEmpty className="search-list-empty">
              Loading stocks...
            </CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="search-list-indicator">
              {isSearchMode
                ? 'No results found'
                : 'No stocks available'}
            </div>
          ) : (
            <ul>
              {isSearchMode ? (
                <>
                  <div className="search-count">
                    Search results ({displayStocks?.length || 0})
                  </div>
                  {displayStocks?.map((stock) => (
                    <li
                      key={stock.symbol}
                      className="search-item"
                    >
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        onClick={handleSelectStock}
                        className="search-item-link"
                      >
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <div className="search-item-name">
                            {stock.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stock.symbol} | {stock.exchange} |{' '}
                            {stock.type}
                          </div>
                        </div>
                        <WatchlistButton
                          symbol={stock.symbol}
                          company={stock.name}
                          isInWatchlist={stock.isInWatchlist}
                          onWatchlistChange={handleWatchlistChange}
                          type="icon"
                        />
                      </Link>
                    </li>
                  ))}
                </>
              ) : (
                <>
                  {watchlistStocks.length > 0 && (
                    <>
                      <div className="search-count">
                        Your Watchlist ({watchlistStocks.length})
                      </div>
                      {watchlistStocks.map((stock) => (
                        <li
                          key={stock.symbol}
                          className="search-item"
                        >
                          <Link
                            href={`/stocks/${stock.symbol}`}
                            onClick={handleSelectStock}
                            className="search-item-link"
                          >
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <div className="search-item-name">
                                {stock.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {stock.symbol} | {stock.exchange} |{' '}
                                {stock.type}
                              </div>
                            </div>
                            <WatchlistButton
                              symbol={stock.symbol}
                              company={stock.name}
                              isInWatchlist={stock.isInWatchlist}
                              onWatchlistChange={handleWatchlistChange}
                              type="icon"
                            />
                          </Link>
                        </li>
                      ))}
                    </>
                  )}
                  {otherStocks.length > 0 && (
                    <>
                      <div className="search-count">
                        Popular stocks ({otherStocks.length})
                      </div>
                      {otherStocks.map((stock) => (
                        <li
                          key={stock.symbol}
                          className="search-item"
                        >
                          <Link
                            href={`/stocks/${stock.symbol}`}
                            onClick={handleSelectStock}
                            className="search-item-link"
                          >
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <div className="search-item-name">
                                {stock.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {stock.symbol} | {stock.exchange} |{' '}
                                {stock.type}
                              </div>
                            </div>
                            <WatchlistButton
                              symbol={stock.symbol}
                              company={stock.name}
                              isInWatchlist={stock.isInWatchlist}
                              onWatchlistChange={handleWatchlistChange}
                              type="icon"
                            />
                          </Link>
                        </li>
                      ))}
                    </>
                  )}
                </>
              )}
            </ul>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
