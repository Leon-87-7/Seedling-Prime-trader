'use server';

import {
  getDateRange,
  validateArticle,
  formatArticle,
} from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';
import { cache } from 'react';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY =
  process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

// Finnhub API response types
interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinnhubProfile {
  country?: string;
  currency?: string;
  exchange?: string;
  finnhubIndustry?: string;
  ipo?: string;
  logo?: string;
  marketCapitalization?: number;
  name?: string;
  phone?: string;
  shareOutstanding?: number;
  ticker?: string;
  weburl?: string;
}

interface FinnhubMetrics {
  metric: {
    '52WeekHigh'?: number;
    '52WeekLow'?: number;
    '52WeekLowDate'?: string;
    '52WeekHighDate'?: string;
    '52WeekPriceReturnDaily'?: number;
    beta?: number;
    peBasicExclExtraTTM?: number;
    epsBasicExclExtraItemsTTM?: number;
    dividendYieldIndicatedAnnual?: number;
    [key: string]: number | string | undefined;
  };
  series?: {
    annual?: Record<string, unknown>;
    quarterly?: Record<string, unknown>;
  };
}

// Return data types
export interface StockQuoteData {
  currentPrice: number;
  change: number;
  percentChange: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
}

export interface StockProfileData {
  name: string;
  marketCap: number;
  ticker: string;
  exchange: string;
  industry: string;
}

export interface StockMetricsData {
  peRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  beta: number | null;
  weekHigh52: number | null;
  weekLow52: number | null;
}

async function fetchJSON<T>(
  url: string,
  revalidateSeconds?: number
): Promise<T> {
  const options: RequestInit & { next?: { revalidate?: number } } =
    revalidateSeconds
      ? {
          cache: 'force-cache',
          next: { revalidate: revalidateSeconds },
        }
      : { cache: 'no-store' };

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch failed ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export { fetchJSON };

export async function getNews(
  symbols?: string[]
): Promise<MarketNewsArticle[]> {
  try {
    const range = getDateRange(5);
    const token =
      process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      throw new Error('FINNHUB API key is not configured');
    }
    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const maxArticles = 6;
    // Cap symbols to prevent rate-limit issues and excessive latency
    const MAX_SYMBOLS = 6;
    const symbolsToFetch = cleanSymbols.slice(0, MAX_SYMBOLS);

    // If we have symbols, try to fetch company news per symbol and round-robin select
    if (symbolsToFetch.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

      // Process symbols in batches to limit concurrency
      const BATCH_SIZE = 3;
      for (let i = 0; i < symbolsToFetch.length; i += BATCH_SIZE) {
        const batch = symbolsToFetch.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (sym) => {
            try {
              const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
              const articles = await fetchJSON<RawNewsArticle[]>(
                url,
                300
              );
              perSymbolArticles[sym] = (articles || []).filter(
                validateArticle
              );
            } catch (e) {
              console.error('Error fetching company news for', sym, e);
              perSymbolArticles[sym] = [];
            }
          })
        );
      }

      const collected: MarketNewsArticle[] = [];
      // Round-robin up to 6 picks
      for (let round = 0; round < maxArticles; round++) {
        for (let i = 0; i < symbolsToFetch.length; i++) {
          const sym = symbolsToFetch[i];
          const list = perSymbolArticles[sym] || [];
          if (list.length === 0) continue;
          const article = list.shift();
          if (!article || !validateArticle(article)) continue;
          collected.push(formatArticle(article, true, sym, round));
          if (collected.length >= maxArticles) break;
        }
        if (collected.length >= maxArticles) break;
      }

      if (collected.length > 0) {
        // Sort by datetime desc
        collected.sort(
          (a, b) => (b.datetime || 0) - (a.datetime || 0)
        );
        return collected.slice(0, maxArticles);
      }
      // If none collected, fall through to general news
    }

    // General market news fallback or when no symbols provided
    const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
    const general = await fetchJSON<RawNewsArticle[]>(
      generalUrl,
      300
    );

    const seen = new Set<string>();
    const unique: RawNewsArticle[] = [];
    for (const art of general || []) {
      if (!validateArticle(art)) continue;
      const key = `${art.id}-${art.url}-${art.headline}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(art);
      if (unique.length >= 20) break; // cap early before final slicing
    }

    const formatted = unique
      .slice(0, maxArticles)
      .map((a, idx) => formatArticle(a, false, undefined, idx));
    return formatted;
  } catch (err) {
    console.error('getNews error:', err);
    throw new Error('Failed to fetch news');
  }
}

/**
 * Get stock quotes for multiple symbols in a single batch call
 * Cached for 15 minutes (900 seconds)
 * @param symbols - Array of stock symbols
 * @returns Map of symbol to stock quote data
 */
export const getBatchStockQuotes = cache(
  async (symbols: string[]): Promise<Map<string, StockQuoteData>> => {
    const resultMap = new Map<string, StockQuoteData>();

    if (!symbols || symbols.length === 0) return resultMap;

    try {
      const token =
        process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
      if (!token) {
        console.error('FINNHUB API key is not configured');
        return resultMap;
      }

      const cleanSymbols = symbols
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      // Fetch all quotes in parallel (batch call)
      const quotes = await Promise.all(
        cleanSymbols.map(async (symbol) => {
          try {
            const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
            // Cache for 15 minutes (900 seconds)
            const quote = await fetchJSON<FinnhubQuote>(url, 900);

            if (!quote || quote.c === 0) {
              return { symbol, data: null };
            }

            const data: StockQuoteData = {
              currentPrice: quote.c || 0,
              change: quote.d || 0,
              percentChange: quote.dp || 0,
              highPrice: quote.h || 0,
              lowPrice: quote.l || 0,
              openPrice: quote.o || 0,
              previousClose: quote.pc || 0,
            };

            return { symbol, data };
          } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error);
            return { symbol, data: null };
          }
        })
      );

      // Build result map
      quotes.forEach(({ symbol, data }) => {
        if (data) {
          resultMap.set(symbol, data);
        }
      });

      return resultMap;
    } catch (error) {
      console.error('Error in batch stock quotes:', error);
      return resultMap;
    }
  }
);

/**
 * Get stock profiles for multiple symbols in a single batch call
 * Cached for 15 minutes (900 seconds)
 * @param symbols - Array of stock symbols
 * @returns Map of symbol to stock profile data
 */
export const getBatchStockProfiles = cache(
  async (symbols: string[]): Promise<Map<string, StockProfileData>> => {
    const resultMap = new Map<string, StockProfileData>();

    if (!symbols || symbols.length === 0) return resultMap;

    try {
      const token =
        process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
      if (!token) {
        console.error('FINNHUB API key is not configured');
        return resultMap;
      }

      const cleanSymbols = symbols
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      // Fetch all profiles in parallel (batch call)
      const profiles = await Promise.all(
        cleanSymbols.map(async (symbol) => {
          try {
            const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`;
            // Cache for 15 minutes (900 seconds)
            const profile = await fetchJSON<FinnhubProfile>(url, 900);

            if (!profile || !profile.ticker) {
              return { symbol, data: null };
            }

            const data: StockProfileData = {
              name: profile.name || '',
              marketCap: profile.marketCapitalization || 0,
              ticker: profile.ticker || symbol,
              exchange: profile.exchange || '',
              industry: profile.finnhubIndustry || '',
            };

            return { symbol, data };
          } catch (error) {
            console.error(`Error fetching profile for ${symbol}:`, error);
            return { symbol, data: null };
          }
        })
      );

      // Build result map
      profiles.forEach(({ symbol, data }) => {
        if (data) {
          resultMap.set(symbol, data);
        }
      });

      return resultMap;
    } catch (error) {
      console.error('Error in batch stock profiles:', error);
      return resultMap;
    }
  }
);

/**
 * Get basic financials (including P/E ratio) for multiple symbols in a single batch call
 * Cached for 15 minutes (900 seconds)
 * @param symbols - Array of stock symbols
 * @returns Map of symbol to basic financials data
 */
export const getBatchStockMetrics = cache(
  async (symbols: string[]): Promise<Map<string, StockMetricsData>> => {
    const resultMap = new Map<string, StockMetricsData>();

    if (!symbols || symbols.length === 0) return resultMap;

    try {
      const token =
        process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
      if (!token) {
        console.error('FINNHUB API key is not configured');
        return resultMap;
      }

      const cleanSymbols = symbols
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      // Fetch all basic financials in parallel (batch call)
      const metrics = await Promise.all(
        cleanSymbols.map(async (symbol) => {
          try {
            const url = `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${token}`;
            // Cache for 15 minutes (900 seconds)
            const response = await fetchJSON<FinnhubMetrics>(url, 900);

            if (!response || !response.metric) {
              return { symbol, data: null };
            }

            const data: StockMetricsData = {
              peRatio: response.metric.peBasicExclExtraTTM || null,
              eps: response.metric.epsBasicExclExtraItemsTTM || null,
              dividendYield: response.metric.dividendYieldIndicatedAnnual || null,
              beta: response.metric.beta || null,
              weekHigh52: response.metric['52WeekHigh'] || null,
              weekLow52: response.metric['52WeekLow'] || null,
            };

            return { symbol, data };
          } catch (error) {
            console.error(`Error fetching metrics for ${symbol}:`, error);
            return { symbol, data: null };
          }
        })
      );

      // Build result map
      metrics.forEach(({ symbol, data }) => {
        if (data) {
          resultMap.set(symbol, data);
        }
      });

      return resultMap;
    } catch (error) {
      console.error('Error in batch stock metrics:', error);
      return resultMap;
    }
  }
);

export async function searchStocks(
  query?: string
): Promise<StockWithWatchlistStatus[]> {
    try {
      // Force dynamic rendering - don't cache this function's results
      const { unstable_noStore } = await import('next/cache');
      unstable_noStore();

      const token =
        process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
      if (!token) {
        // If no token, log and return empty to avoid throwing per requirements
        console.error(
          'Error in stock search:',
          new Error('FINNHUB API key is not configured')
        );
        return [];
      }

      // Get user's watchlist symbols to mark them and optionally display them first
      const { getAuth } = await import('@/lib/better-auth/auth');
      const { headers } = await import('next/headers');
      const { getUserWatchlist } = await import('@/lib/actions/watchlist.actions');

      let watchlistSymbols: string[] = [];
      let watchlistItems: Awaited<ReturnType<typeof getUserWatchlist>> = [];

      try {
        const auth = await getAuth();
        const session = await auth.api.getSession({
          headers: await headers(),
        });

        if (session?.user) {
          watchlistItems = await getUserWatchlist();
          watchlistSymbols = watchlistItems.map(item => item.symbol.toUpperCase());
        }
      } catch (err) {
        // User not logged in or error fetching watchlist - continue without it
        console.log('No user session or error fetching watchlist:', err);
      }

      const watchlistSet = new Set(watchlistSymbols);
      const trimmed = typeof query === 'string' ? query.trim() : '';

      let results: FinnhubSearchResult[] = [];

      if (!trimmed) {
        // When no query, show watchlist items first, then popular stocks
        const watchlistResults: FinnhubSearchResult[] = watchlistItems.map(item => ({
          symbol: item.symbol,
          description: item.company,
          displaySymbol: item.symbol,
          type: 'Common Stock',
          __exchange: item.profile?.exchange,
        } as FinnhubSearchResult & { __exchange?: string }));

        // Fetch popular stocks (excluding already shown watchlist items)
        const popularSymbols = POPULAR_STOCK_SYMBOLS
          .filter(sym => !watchlistSet.has(sym.toUpperCase()))
          .slice(0, 10);

        const profiles = await Promise.all(
          popularSymbols.map(async (sym) => {
            try {
              const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
              // Revalidate every hour
              const profile = await fetchJSON<FinnhubProfile>(url, 3600);
              return { sym, profile };
            } catch (e) {
              console.error('Error fetching profile2 for', sym, e);
              return { sym, profile: null };
            }
          })
        );

        const popularResults = profiles
          .map(({ sym, profile }) => {
            const symbol = sym.toUpperCase();
            const name: string | undefined =
              profile?.name || profile?.ticker || undefined;
            const exchange: string | undefined =
              profile?.exchange || undefined;
            if (!name) return undefined;
            const r: FinnhubSearchResult & { __exchange?: string } = {
              symbol,
              description: name,
              displaySymbol: symbol,
              type: 'Common Stock',
              __exchange: exchange, // internal only
            };
            return r;
          })
          .filter((x): x is FinnhubSearchResult => Boolean(x));

        // Watchlist items first, then popular stocks
        results = [...watchlistResults, ...popularResults];
      } else {
        const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
        const data = await fetchJSON<FinnhubSearchResponse>(
          url,
          1800
        );
        results = Array.isArray(data?.result) ? data.result : [];
      }

      const mapped: StockWithWatchlistStatus[] = results
        .map((r) => {
          const upper = (r.symbol || '').toUpperCase();
          const name = r.description || upper;
          const exchangeFromDisplay =
            (r.displaySymbol as string | undefined) || undefined;
          const exchangeFromProfile = (r as FinnhubSearchResult & { __exchange?: string }).__exchange;
          const exchange =
            exchangeFromDisplay || exchangeFromProfile || 'US';
          const type = r.type || 'Stock';
          const item: StockWithWatchlistStatus = {
            symbol: upper,
            name,
            exchange,
            type,
            isInWatchlist: watchlistSet.has(upper),
          };
          return item;
        })
        .slice(0, 20); // Increased limit to accommodate watchlist + popular stocks

      return mapped;
    } catch (err) {
      console.error('Error in stock search:', err);
      return [];
    }
}
