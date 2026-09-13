import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { FlashAlert } from '../types';

interface AlertsBannerProps {
  alerts: FlashAlert[];
  onDismiss: (id: string) => void;
  lang: 'en' | 'hi';
}

export const AlertsBanner: React.FC<AlertsBannerProps> = ({
  alerts,
  onDismiss,
  lang,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md w-full pointer-events-none">
      {alerts.map((alert) => {
        const text = lang === 'hi' && alert.messageHi ? alert.messageHi : alert.message;

        const styleMap = {
          success: {
            bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
            icon: CheckCircle2,
            iconColor: 'text-emerald-600',
          },
          warning: {
            bg: 'bg-amber-50 border-amber-300 text-amber-950',
            icon: AlertTriangle,
            iconColor: 'text-amber-600',
          },
          danger: {
            bg: 'bg-rose-50 border-rose-300 text-rose-950',
            icon: XCircle,
            iconColor: 'text-rose-600',
          },
          info: {
            bg: 'bg-blue-50 border-blue-300 text-blue-950',
            icon: Info,
            iconColor: 'text-blue-600',
          },
        }[alert.type];

        const Icon = styleMap.icon;

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl transition-all duration-300 ${styleMap.bg}`}
          >
            <Icon className={`w-5 h-5 ${styleMap.iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 text-xs font-semibold leading-snug">
              {text}
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
