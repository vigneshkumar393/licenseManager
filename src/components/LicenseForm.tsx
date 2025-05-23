'use client';

import { useState } from 'react';
import { generateUniqueKey } from '@/lib/license';
import toast from 'react-hot-toast';

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={name} className="mb-1 font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function MessageBox({
  type,
  children,
}: {
  type: 'success' | 'error';
  children: React.ReactNode;
}) {
  return (
    <div
      className={`p-4 rounded-md ${
        type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {children}
    </div>
  );
}

type LicenseFormProps = {
  onSuccess?: () => void;
};

export default function LicenseForm({ onSuccess }: LicenseFormProps) {
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    macAddress: '',
  });
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLicenseKey('');

    try {
      const licenseKey = generateUniqueKey(form.macAddress);

      const res = await fetch('/api/licenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          licenseKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create license');

      setLicenseKey(data.licenseKey);
      toast.success('License created successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('License key copied to clipboard!');
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Client Name"
        name="clientName"
        value={form.clientName}
        onChange={handleChange}
        required
        placeholder="e.g., John Doe"
      />
      <InputField
        label="Client Email"
        name="clientEmail"
        type="email"
        value={form.clientEmail}
        onChange={handleChange}
        required
        placeholder="e.g., john@example.com"
      />
      <InputField
        label="MAC Address"
        name="macAddress"
        value={form.macAddress}
        onChange={handleChange}
        required
        placeholder="e.g., 00:1A:2B:3C:4D:5E"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-800 transition"
      >
        {loading ? 'Generating...' : 'Generate License Key'}
      </button>

      {licenseKey && (
        <MessageBox type="success">
          <strong>Generated License Key:</strong>
          <div className="flex items-center justify-between space-x-2">
            <p className="break-all flex-1">{licenseKey}</p>
            <button
              onClick={() => handleCopy(licenseKey)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              type="button"
              title="Copy license key"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="black"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16h8M8 12h8m-5-8H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-3"
                />
              </svg>
            </button>
          </div>
        </MessageBox>
      )}

      {error && (
        <MessageBox type="error">
          <strong>Error:</strong> {error}
        </MessageBox>
      )}
    </form>
  );
}
