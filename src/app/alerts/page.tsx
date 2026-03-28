'use client';
import { Bell } from 'lucide-react';
import { useAlertStore } from '@/store';
import { formatTimeAgo } from '@/lib/utils/formatting';
import toast from 'react-hot-toast';

export default function AlertsPage() {
  const { alerts, acknowledgeAlert, clearAlerts } = useAlertStore();

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Bell className="text-purple-400" size={24} />
          Alerts & Notifications
        </h1>
        <button onClick={() => { clearAlerts(); toast.success('All alerts cleared'); }} className="btn-secondary text-xs h-8">
          Clear All
        </button>
      </div>
      {alerts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell size={32} className="mx-auto text-muted-foreground mb-3 opacity-30" />
          <p className="text-muted-foreground">No alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`glass-card p-4 border-l-4 ${alert.severity === 'critical' ? 'border-l-red-500' : alert.severity === 'high' ? 'border-l-orange-500' : alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'} ${alert.acknowledged ? 'opacity-50' : ''}`}>
              <div className="flex justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase severity-${alert.severity}`}>{alert.severity}</span>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
                {!alert.acknowledged && (
                  <button onClick={() => acknowledgeAlert(alert.id)} className="btn-secondary text-xs h-8 px-3 flex-shrink-0">Ack</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
