import { useState } from 'react';
import { X, Clock } from 'lucide-react';

interface SnoozeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSnooze: (minutes: number) => void;
  onSnoozeUntil: (dateTime: string) => void;
}

export function SnoozeDialog({ isOpen, onClose, onSnooze, onSnoozeUntil }: SnoozeDialogProps) {
  const [customDateTime, setCustomDateTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  });

  if (!isOpen) return null;

  const handleQuickSnooze = (minutes: number) => {
    onSnooze(minutes);
    onClose();
  };

  const handleCustomSnooze = () => {
    if (!customDateTime) return;

    const selectedDate = new Date(customDateTime);
    const now = new Date();
    const diffMs = selectedDate.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    if (diffMinutes > 0) {
      onSnooze(diffMinutes);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-soft-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-antiq-blue flex items-center gap-2">
            <Clock className="w-6 h-6 text-antiq-amber" />
            Aufgabe verschieben
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">Schnelle Optionen:</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickSnooze(30)}
                className="px-4 py-3 bg-amber-50 text-antiq-blue rounded-lg hover:bg-amber-100 transition font-medium text-center border border-amber-200"
              >
                <div className="text-lg font-semibold">30</div>
                <div className="text-xs">Minuten</div>
              </button>
              <button
                onClick={() => handleQuickSnooze(60)}
                className="px-4 py-3 bg-amber-50 text-antiq-blue rounded-lg hover:bg-amber-100 transition font-medium text-center border border-amber-200"
              >
                <div className="text-lg font-semibold">1</div>
                <div className="text-xs">Stunde</div>
              </button>
              <button
                onClick={() => handleQuickSnooze(24 * 60)}
                className="px-4 py-3 bg-amber-50 text-antiq-blue rounded-lg hover:bg-amber-100 transition font-medium text-center border border-amber-200"
              >
                <div className="text-lg font-semibold">1</div>
                <div className="text-xs">Tag</div>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-3">Benutzerdefiniert:</p>
            <div className="space-y-3">
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent text-gray-900"
              />
              <button
                onClick={handleCustomSnooze}
                className="w-full px-4 py-2.5 bg-antiq-amber text-antiq-blue rounded-lg hover:bg-opacity-90 transition font-medium"
              >
                Verschieben
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
