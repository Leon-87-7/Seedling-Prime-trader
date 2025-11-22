import WatchlistTable from '@/components/WatchlistTable';
import TradingViewWidget from '@/components/TradingViewWidget';
import { getUserWatchlist } from '@/lib/actions/watchlist.actions';
import {
  ECONOMIC_CALENDAR_WIDGET_CONFIG,
  SYMBOL_TOP_STORIES_WIDGET_CONFIG,
  TRADINGVIEW_SCRIPT_BASE_URL,
  normalizeExchangeName,
} from '@/lib/constants';

export default async function Watchlist() {
  const watchlistItems = await getUserWatchlist();

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">
          Your Watchlist
        </h2>
        <WatchlistTable items={watchlistItems} />
      </div>

      {watchlistItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-100 mb-6">
            Top Stories by Symbol
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {watchlistItems.map((item) => {
              // Format symbol with exchange prefix (e.g., NASDAQ:AAPL)
              const exchangeName = item.profile?.exchange || 'NASDAQ';
              const normalizedExchange =
                normalizeExchangeName(exchangeName);
              const symbolWithExchange = `${normalizedExchange}:${item.symbol}`;

              return (
                <div key={item.symbol}>
                  <TradingViewWidget
                    scriptUrl={`${TRADINGVIEW_SCRIPT_BASE_URL}timeline.js`}
                    config={SYMBOL_TOP_STORIES_WIDGET_CONFIG(
                      symbolWithExchange
                    )}
                    height={400}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <TradingViewWidget
          title="Economic Calendar"
          scriptUrl={`${TRADINGVIEW_SCRIPT_BASE_URL}events.js`}
          config={ECONOMIC_CALENDAR_WIDGET_CONFIG}
          height={500}
        />
      </div>
    </div>
  );
}
