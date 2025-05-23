'use client';

import React, { useState, useEffect } from 'react';
import Dialog from './Dialog';

interface RenewDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (validFrom: string, validTo: string) => void;
  initialValidFrom?: string;
  initialValidTo?: string;
  loading?: boolean;
}

export default function RenewDialog({
  open,
  onClose,
  onConfirm,
  initialValidFrom = '',
  initialValidTo = '',
  loading = false,
}: RenewDialogProps) {
  // Get today's date string in YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);

  const [validFrom, setValidFrom] = useState<string>(today);
  const [validTo, setValidTo] = useState<string>('');

  // When dialog opens or initial dates change, reset state
  useEffect(() => {
    setValidFrom(initialValidFrom ? initialValidFrom.slice(0, 10) : today);

    // For validTo:
    // if initialValidTo exists and is after validFrom, use it,
    // else set to day after validFrom (minimum allowed)
    if (initialValidTo) {
      const initialTo = initialValidTo.slice(0, 10);
      if (initialTo > (initialValidFrom ? initialValidFrom.slice(0, 10) : today)) {
        setValidTo(initialTo);
      } else {
        // set validTo to day after validFrom
        const fromDate = new Date(initialValidFrom ? initialValidFrom.slice(0, 10) : today);
        fromDate.setDate(fromDate.getDate() + 1);
        setValidTo(fromDate.toISOString().slice(0, 10));
      }
    } else {
      // no initial validTo - set to day after validFrom
      const fromDate = new Date(initialValidFrom ? initialValidFrom.slice(0, 10) : today);
      fromDate.setDate(fromDate.getDate() + 1);
      setValidTo(fromDate.toISOString().slice(0, 10));
    }
  }, [open, initialValidFrom, initialValidTo, today]);

  // Whenever validFrom changes, update validTo if invalid
  useEffect(() => {
    if (validTo <= validFrom) {
      // move validTo to day after validFrom
      const fromDate = new Date(validFrom);
      fromDate.setDate(fromDate.getDate() + 1);
      setValidTo(fromDate.toISOString().slice(0, 10));
    }
  }, [validFrom, validTo]);

  const handleConfirm = () => {
    if (!validFrom || !validTo) {
      alert('Please select both valid from and valid to dates.');
      return;
    }
    if (validFrom >= validTo) {
      alert('Valid To date must be after Valid From date.');
      return;
    }
    onConfirm(validFrom, validTo);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Renew License"
      footer={
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Renewing...' : 'Confirm Renew'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="validFrom" className="block mb-1 font-medium">
            Valid From
          </label>
         <input
  type="date"
  id="validFrom"
  value={validFrom}
  onChange={(e) => setValidFrom(e.target.value)}
  className="w-full border border-gray-300 rounded px-3 py-2"
  disabled={loading}
  min={today}
  onKeyDown={(e) => e.preventDefault()}
  onPaste={(e) => e.preventDefault()}
/>
        </div>
        <div>
          <label htmlFor="validTo" className="block mb-1 font-medium">
            Valid To
          </label>
         <input
  type="date"
  id="validTo"
  value={validTo}
  onChange={(e) => setValidTo(e.target.value)}
  className="w-full border border-gray-300 rounded px-3 py-2"
  disabled={loading}
  min={new Date(new Date(validFrom).getTime() + 86400000).toISOString().slice(0, 10)}
  onKeyDown={(e) => e.preventDefault()}
  onPaste={(e) => e.preventDefault()}
/>
        </div>
      </div>
    </Dialog>
  );
}
