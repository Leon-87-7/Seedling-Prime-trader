'use client';

import { useState, useTransition } from 'react';
import { Star, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  addToWatchlist,
  removeFromWatchlist,
} from '@/lib/actions/watchlist.actions';
import { useRouter } from 'next/navigation';

export default function WatchlistButton({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon = false,
  type = 'button',
  onWatchlistChange,
}: WatchlistButtonProps) {
  const [isAdded, setIsAdded] = useState(isInWatchlist);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggleWatchlist = async () => {
    startTransition(async () => {
      try {
        if (isAdded) {
          await removeFromWatchlist(symbol);
          setIsAdded(false);
          onWatchlistChange?.(symbol, false);
        } else {
          await addToWatchlist(symbol, company);
          setIsAdded(true);
          onWatchlistChange?.(symbol, true);
        }
        router.refresh();
      } catch (error) {
        console.error('Failed to update watchlist:', error);
      }
    });
  };

  if (type === 'icon') {
    return (
      <button
        onClick={handleToggleWatchlist}
        disabled={isPending}
        className="p-2 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
        aria-label={
          isAdded ? 'Remove from watchlist' : 'Add to watchlist'
        }
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : showTrashIcon && isAdded ? (
          <Trash2 className="h-5 w-5 text-red-500" />
        ) : (
          <Star
            className={cn(
              'h-5 w-5',
              isAdded
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400 hover:text-yellow-400'
            )}
          />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggleWatchlist}
      disabled={isPending}
      className={cn(
        'watchlist-btn',
        isAdded &&
          'bg-yellow-500/10 border-yellow-500 text-yellow-500'
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Star
          className={cn(
            'h-4 w-4',
            isAdded && 'fill-yellow-200 text-yellow-800'
          )}
        />
      )}
      {isAdded ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </Button>
  );
}
