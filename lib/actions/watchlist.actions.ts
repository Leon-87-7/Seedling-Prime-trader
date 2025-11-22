'use server';

import { connectToDatabase } from '@/database/mongoose';
import Watchlist from '@/database/models/watchlist.model';
import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

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

/**
 * Get the current authenticated user
 * @returns User object with id and email, or null if not authenticated
 */
const getCurrentUser = async () => {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if a stock symbol is in the user's watchlist
 * @param symbol - Stock symbol to check
 * @returns boolean indicating if the stock is in the watchlist
 */
export const checkWatchlistStatus = async (
  symbol: string
): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    await connectToDatabase();

    const exists = await Watchlist.exists({
      userId: user.id,
      symbol: symbol.toUpperCase(),
    });

    return !!exists;
  } catch (error) {
    console.error('Error checking watchlist status:', error);
    return false;
  }
};

/**
 * Add a stock to the user's watchlist
 * @param symbol - Stock symbol to add
 * @param company - Company name
 */
export const addToWatchlist = async (
  symbol: string,
  company: string
) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    await connectToDatabase();

    // Check if already exists
    const exists = await Watchlist.exists({
      userId: user.id,
      symbol: symbol.toUpperCase(),
    });

    if (exists) {
      return { success: true, message: 'Already in watchlist' };
    }

    // Add to watchlist
    await Watchlist.create({
      userId: user.id,
      symbol: symbol.toUpperCase(),
      company,
      addedAt: new Date(),
    });

    return { success: true, message: 'Added to watchlist' };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

/**
 * Remove a stock from the user's watchlist
 * @param symbol - Stock symbol to remove
 */
export const removeFromWatchlist = async (symbol: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    await connectToDatabase();

    await Watchlist.deleteOne({
      userId: user.id,
      symbol: symbol.toUpperCase(),
    });

    return { success: true, message: 'Removed from watchlist' };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};
