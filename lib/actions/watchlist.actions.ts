'use server';

import { connectToDatabase } from '@/database/mongoose';
import Watchlist from '@/database/models/watchlist.model';

/**
 * Get watchlist symbols for a user by their email
 * @param email - User's email address
 * @returns Array of stock symbols (e.g., ['AAPL', 'TSLA', 'GOOGL'])
 */
export const getWatchlistSymbolsByEmail = async (
  email: string
): Promise<string[]> => {
  try {
    // Connect to database
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection not established');
    }

    // Find user by email in Better Auth user collection
    const user = await db.collection('user').findOne<{
      id: string;
      _id: string;
      email?: string;
    }>({ email });

    // Return empty array if user not found
    if (!user) return [];

    // Get userId (prefer id field, fallback to _id)
    const userId = (user.id as string) || String(user._id || '');

    // Query watchlist for this user
    const watchlistItems = await Watchlist.find(
      { userId },
      { symbol: 1 }
    ).lean();

    // Extract and return just the symbols
    return watchlistItems.map((item) => String(item.symbol));
  } catch (error: unknown) {
    console.error(
      'Error fetching watchlist symbols by email \ngetWatchlistSymbolsByEmail error:',
      error
    );
    return [];
  }
};
