'use server';

import { connectToDatabase } from '@/database/mongoose';

export const getAllUsersForNewsEmail = async () => {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('Mongoose connection not connected');

    const users = await db
      .collection('user')
      .find(
        { email: { $exists: true, $ne: null } },
        {
          projection: {
            _id: 1,
            id: 1,
            email: 1,
            name: 1,
            country: 1,
          },
        }
      )
      .toArray();

    return users
      .filter((user) => user.email && user.name)
      .map((user) => ({
        id: user.id || user._id.toString() || '',
        email: user.email,
        name: user.name,
      }));
  } catch (error: unknown) {
    console.error('Error fetching users for news email:', error);
    return [];
  }
};

/**
 * Get user by ID (used by Inngest alert monitoring)
 * Handles both Better Auth id field and MongoDB _id field
 */
export const getUserById = async (
  userId: string
): Promise<{ id: string; email: string; name: string } | null> => {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('Mongoose connection not connected');

    const projection = {
      _id: 1,
      id: 1,
      email: 1,
      name: 1,
    };

    let user = await db
      .collection('user')
      .findOne({ id: userId }, { projection });

    // If not found and userId looks like an ObjectId, try _id field
    if (!user && /^[0-9a-fA-F]{24}$/.test(userId)) {
      const { ObjectId } = await import('mongodb');
      user = await db
        .collection('user')
        .findOne({ _id: new ObjectId(userId) }, { projection });
    }

    if (!user || !user.email) {
      return null;
    }

    return {
      id: user.id || user._id.toString() || '',
      email: user.email,
      name: user.name || 'Investor',
    };
  } catch (error: unknown) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};
