'use server';

import { connectToDatabase } from '@/database/mongoose';
import Alert, { type AlertType } from '@/database/models/alert.model';
import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Get the current authenticated user
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
      name: session.user.name,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Create a new alert for a stock
 */
export const createAlert = async ({
  symbol,
  company,
  alertType,
  targetPrice,
  volumeMultiplier,
}: {
  symbol: string;
  company: string;
  alertType: AlertType;
  targetPrice?: number;
  volumeMultiplier?: number;
}) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    await connectToDatabase();

    // Validate input based on alert type
    if (
      (alertType === 'price_upper' || alertType === 'price_lower') &&
      (!targetPrice || targetPrice <= 0)
    ) {
      throw new Error('Target price is required for price alerts');
    }

    if (
      alertType === 'volume' &&
      (!volumeMultiplier || volumeMultiplier <= 0)
    ) {
      throw new Error(
        'Volume multiplier is required for volume alerts'
      );
    }

    // Create the alert
    const alert = await Alert.create({
      userId: user.id,
      symbol: symbol.toUpperCase(),
      company,
      alertType,
      targetPrice:
        alertType !== 'volume' ? targetPrice : undefined,
      volumeMultiplier:
        alertType === 'volume' ? volumeMultiplier : undefined,
      isActive: true,
      isTriggered: false,
    });

    // Revalidate pages
    revalidatePath('/watchlist');
    revalidatePath(`/stocks/${symbol.toUpperCase()}`);

    return {
      success: true,
      message: 'Alert created successfully',
      alertId: alert._id.toString(),
    };
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

/**
 * Get all alerts for the current user
 */
export const getUserAlerts = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    await connectToDatabase();

    const alerts = await Alert.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean();

    return alerts.map((alert) => ({
      id: alert._id.toString(),
      symbol: String(alert.symbol),
      company: String(alert.company),
      alertType: alert.alertType as AlertType,
      targetPrice: alert.targetPrice,
      volumeMultiplier: alert.volumeMultiplier,
      isActive: Boolean(alert.isActive),
      isTriggered: Boolean(alert.isTriggered),
      triggeredAt: alert.triggeredAt,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    return [];
  }
};

/**
 * Get alerts for a specific stock symbol
 */
export const getAlertsBySymbol = async (symbol: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    await connectToDatabase();

    const alerts = await Alert.find({
      userId: user.id,
      symbol: symbol.toUpperCase(),
    })
      .sort({ createdAt: -1 })
      .lean();

    return alerts.map((alert) => ({
      id: alert._id.toString(),
      symbol: String(alert.symbol),
      company: String(alert.company),
      alertType: alert.alertType as AlertType,
      targetPrice: alert.targetPrice,
      volumeMultiplier: alert.volumeMultiplier,
      isActive: Boolean(alert.isActive),
      isTriggered: Boolean(alert.isTriggered),
      triggeredAt: alert.triggeredAt,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching alerts by symbol:', error);
    return [];
  }
};

/**
 * Update an alert
 */
export const updateAlert = async (
  alertId: string,
  updates: {
    targetPrice?: number;
    volumeMultiplier?: number;
    isActive?: boolean;
  }
) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    await connectToDatabase();

    // Find alert and verify ownership
    const alert = await Alert.findOne({
      _id: alertId,
      userId: user.id,
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    // Update the alert
    Object.assign(alert, updates);
    await alert.save();

    // Revalidate pages
    revalidatePath('/watchlist');
    revalidatePath(`/stocks/${alert.symbol}`);

    return { success: true, message: 'Alert updated successfully' };
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};

/**
 * Delete an alert
 */
export const deleteAlert = async (alertId: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    await connectToDatabase();

    // Find and delete alert (verify ownership)
    const alert = await Alert.findOneAndDelete({
      _id: alertId,
      userId: user.id,
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    // Revalidate pages
    revalidatePath('/watchlist');
    revalidatePath(`/stocks/${alert.symbol}`);

    return { success: true, message: 'Alert deleted successfully' };
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
};

/**
 * Toggle alert active status
 */
export const toggleAlertActive = async (alertId: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    await connectToDatabase();

    // Find alert and verify ownership
    const alert = await Alert.findOne({
      _id: alertId,
      userId: user.id,
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    // Toggle active status
    alert.isActive = !alert.isActive;
    await alert.save();

    // Revalidate pages
    revalidatePath('/watchlist');
    revalidatePath(`/stocks/${alert.symbol}`);

    return {
      success: true,
      message: `Alert ${alert.isActive ? 'activated' : 'deactivated'}`,
      isActive: alert.isActive,
    };
  } catch (error) {
    console.error('Error toggling alert:', error);
    throw error;
  }
};

/**
 * Mark an alert as triggered (used by Inngest monitoring)
 */
export const markAlertAsTriggered = async (alertId: string) => {
  try {
    await connectToDatabase();

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        isTriggered: true,
        triggeredAt: new Date(),
        isActive: false, // Deactivate after triggering
      },
      { new: true }
    );

    if (!alert) {
      throw new Error('Alert not found');
    }

    return { success: true, alert };
  } catch (error) {
    console.error('Error marking alert as triggered:', error);
    throw error;
  }
};

/**
 * Get all active, non-triggered alerts (used by Inngest monitoring)
 */
export const getActiveAlerts = async () => {
  try {
    await connectToDatabase();

    const alerts = await Alert.find({
      isActive: true,
      isTriggered: false,
    }).lean();

    return alerts.map((alert) => ({
      id: alert._id.toString(),
      userId: String(alert.userId),
      symbol: String(alert.symbol),
      company: String(alert.company),
      alertType: alert.alertType as AlertType,
      targetPrice: alert.targetPrice,
      volumeMultiplier: alert.volumeMultiplier,
    }));
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    return [];
  }
};
