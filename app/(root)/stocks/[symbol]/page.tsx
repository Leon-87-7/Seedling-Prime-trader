import TradingViewWidget from '@/components/TradingViewWidget';
import WatchlistButton from '@/components/WatchlistButton';
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
  TRADINGVIEW_SCRIPT_BASE_URL,
} from '@/lib/constants';
import { checkWatchlistStatus } from '@/lib/actions/watchlist.actions';

export default async function StockDetails({
  params,
}: StockDetailsPageProps) {
  const { symbol } = await params;
  const isInWatchlist = await checkWatchlistStatus(symbol);

  return (
    <div className="home-wrapper">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <TradingViewWidget
            scriptUrl={`${TRADINGVIEW_SCRIPT_BASE_URL}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
            height={170}
          />
          {/* WatchlistButton appears here on mobile, hidden on desktop */}
          <div className="lg:hidden">
            <WatchlistButton
              symbol={symbol}
              company={symbol}
              isInWatchlist={isInWatchlist}
            />
          </div>
          <TradingViewWidget
            scriptUrl={`${TRADINGVIEW_SCRIPT_BASE_URL}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
            height={600}
          />
          <TradingViewWidget
            scriptUrl={`${TRADINGVIEW_SCRIPT_BASE_URL}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(symbol)}
            height={600}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* WatchlistButton appears here on desktop, hidden on mobile */}
          <div className="hidden lg:block">
            <WatchlistButton
              symbol={symbol}
              company={symbol}
              isInWatchlist={isInWatchlist}
            />
          </div>
          <TradingViewWidget
            scriptUrl={`${TRADINGVIEW_SCRIPT_BASE_URL}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
            height={400}
          />
          <TradingViewWidget
            scriptUrl={`${TRADINGVIEW_SCRIPT_BASE_URL}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
            height={464}
          />
          <TradingViewWidget
            scriptUrl={`${TRADINGVIEW_SCRIPT_BASE_URL}symbol-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
            height={440}
          />
        </div>
      </div>
    </div>
  );
}
