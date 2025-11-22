import WatchlistTable from '@/components/WatchlistTable';
import { getUserWatchlist } from '@/lib/actions/watchlist.actions';

export default async function Watchlist() {
  const watchlistItems = await getUserWatchlist();

  return (
    <div>
      <WatchlistTable items={watchlistItems} />
    </div>
  );
}
