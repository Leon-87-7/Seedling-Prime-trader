'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, BellOff, Trash2, Plus } from 'lucide-react';
import {
  createAlert,
  getAlertsBySymbol,
  deleteAlert,
  toggleAlertActive,
} from '@/lib/actions/alert.actions';
import { toast } from 'sonner';
import type { AlertType } from '@/database/models/alert.model';

interface AlertDialogProps {
  symbol: string;
  company: string;
  children?: React.ReactNode;
  onAlertsChange?: () => void;
}

export default function AlertDialog({
  symbol,
  company,
  children,
  onAlertsChange,
}: AlertDialogProps) {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [alertType, setAlertType] = useState<AlertType>('price_upper');
  const [targetPrice, setTargetPrice] = useState('');
  const [volumeMultiplier, setVolumeMultiplier] = useState('2.0');

  // Load alerts when dialog opens
  useEffect(() => {
    if (open) {
      loadAlerts();
    }
  }, [open, symbol]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlertsBySymbol(symbol);
      setAlerts(data as Alert[]);
    } catch (error) {
      toast.error('Failed to load alerts');
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    try {
      setCreating(true);

      const alertData: {
        symbol: string;
        company: string;
        alertType: AlertType;
        targetPrice?: number;
        volumeMultiplier?: number;
      } = {
        symbol,
        company,
        alertType,
      };

      if (
        alertType === 'price_upper' ||
        alertType === 'price_lower'
      ) {
        const price = parseFloat(targetPrice);
        if (!price || price <= 0) {
          toast.error('Please enter a valid target price');
          return;
        }
        alertData.targetPrice = price;
      } else if (alertType === 'volume') {
        const multiplier = parseFloat(volumeMultiplier);
        if (!multiplier || multiplier <= 0) {
          toast.error('Please enter a valid volume multiplier');
          return;
        }
        alertData.volumeMultiplier = multiplier;
      }

      await createAlert(alertData);
      toast.success('Alert created successfully');

      // Reset form
      setTargetPrice('');
      setVolumeMultiplier('2.0');
      setAlertType('price_upper');

      // Reload alerts
      await loadAlerts();
      onAlertsChange?.();
    } catch (error) {
      toast.error('Failed to create alert');
      console.error('Error creating alert:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await deleteAlert(alertId);
      toast.success('Alert deleted');
      await loadAlerts();
      onAlertsChange?.();
    } catch (error) {
      toast.error('Failed to delete alert');
      console.error('Error deleting alert:', error);
    }
  };

  const handleToggleAlert = async (alertId: string) => {
    try {
      const result = await toggleAlertActive(alertId);
      toast.success(result.message);
      await loadAlerts();
      onAlertsChange?.();
    } catch (error) {
      toast.error('Failed to toggle alert');
      console.error('Error toggling alert:', error);
    }
  };

  const getAlertTypeLabel = (type: AlertType) => {
    switch (type) {
      case 'price_upper':
        return 'Price Above';
      case 'price_lower':
        return 'Price Below';
      case 'volume':
        return 'Volume Spike';
      default:
        return type;
    }
  };

  const getAlertDescription = (alert: Alert) => {
    if (
      alert.alertType === 'price_upper' ||
      alert.alertType === 'price_lower'
    ) {
      return `$${alert.targetPrice?.toFixed(2)}`;
    } else {
      return `${alert.volumeMultiplier}x average`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-yellow-400">
            Alerts for {symbol}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create and manage price and volume alerts for {company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Create New Alert Form */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Alert
            </h3>

            <div className="space-y-4">
              {/* Alert Type */}
              <div className="space-y-2">
                <Label htmlFor="alertType" className="text-gray-300">
                  Alert Type
                </Label>
                <Select
                  value={alertType}
                  onValueChange={(value) =>
                    setAlertType(value as AlertType)
                  }
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem
                      value="price_upper"
                      className="text-gray-300"
                    >
                      Price Above (Target)
                    </SelectItem>
                    <SelectItem
                      value="price_lower"
                      className="text-gray-300"
                    >
                      Price Below (Target)
                    </SelectItem>
                    <SelectItem value="volume" className="text-gray-300">
                      Volume Spike
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Price (for price alerts) */}
              {(alertType === 'price_upper' ||
                alertType === 'price_lower') && (
                <div className="space-y-2">
                  <Label
                    htmlFor="targetPrice"
                    className="text-gray-300"
                  >
                    Target Price ($)
                  </Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 150.00"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-gray-300"
                  />
                </div>
              )}

              {/* Volume Multiplier (for volume alerts) */}
              {alertType === 'volume' && (
                <div className="space-y-2">
                  <Label
                    htmlFor="volumeMultiplier"
                    className="text-gray-300"
                  >
                    Volume Multiplier (x average volume)
                  </Label>
                  <Input
                    id="volumeMultiplier"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="e.g., 2.0"
                    value={volumeMultiplier}
                    onChange={(e) =>
                      setVolumeMultiplier(e.target.value)
                    }
                    className="bg-gray-900 border-gray-700 text-gray-300"
                  />
                  <p className="text-xs text-gray-500">
                    Alert when volume exceeds average by this multiplier
                  </p>
                </div>
              )}

              {/* Create Button */}
              <Button
                onClick={handleCreateAlert}
                disabled={creating}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {creating ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </div>

          {/* Existing Alerts List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">
              Active Alerts ({alerts.filter((a) => a.isActive).length})
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading alerts...
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No alerts yet. Create your first alert above.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.isActive
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-gray-900 border-gray-800 opacity-60'
                    } ${alert.isTriggered ? 'border-green-600' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-300">
                            {getAlertTypeLabel(alert.alertType)}
                          </span>
                          <span className="text-sm text-yellow-400 font-semibold">
                            {getAlertDescription(alert)}
                          </span>
                          {alert.isTriggered && (
                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                              Triggered
                            </span>
                          )}
                          {!alert.isActive && (
                            <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Created{' '}
                          {new Date(
                            alert.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleAlert(alert.id)}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          {alert.isActive ? (
                            <BellOff className="h-4 w-4" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
