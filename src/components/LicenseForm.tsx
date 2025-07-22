'use client';

import { useState, useEffect } from 'react';
import { generateCustomLicense, decryptCustomLicense } from '@/lib/license';
import toast from 'react-hot-toast';
import Dialog from './Dialog';

// Define the interface for a Subscription Plan fetched from the backend
interface SubscriptionPlan {
  _id: string;
  planName: string;
  SnHttpClient: number;
  SnScheduler: number;
  SnAlarm: number;
  SnHistory: number;
  createdAt: string; // Or Date if you parse it
}

// Reusable InputField component
function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  min?: string;
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
        min={min}
        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// Reusable SelectField component for dropdowns
function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={name} className="mb-1 font-medium text-gray-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {/* Placeholder option */}
        <option value="" disabled>
          Select a plan
        </option>
        {/* Render options from props */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// MessageBox component for displaying success or error messages
function MessageBox({
  type,
  children,
}: {
  type: 'success' | 'error';
  children: React.ReactNode;
}) {
  return (
    <div
      className={`p-4 rounded-md mt-4 ${
        type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {children}
    </div>
  );
}

// Helper to get today's date in 'YYYY-MM-DD' format
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper to get the next day's date in 'YYYY-MM-DD' format
function getNextDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

type LicenseFormProps = {
  onSuccess?: () => void;
  licenseId?: string; // <-- NEW: Optional ID to trigger edit mode
};

export default function LicenseForm({ onSuccess,licenseId }: LicenseFormProps) {
  const today = getToday();

  // State for form inputs, including the new selectedPlanId
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    macAddress: '',
    validFrom: today,
    validThru: getNextDay(today),
    selectedPlanId: '', // To store the _id of the selected subscription plan
  });

  const [selectedPlan, setSelectedPlan] = useState("");
  const [customFields, setCustomFields] = useState({
    SnHttpClient: "",
    SnScheduler: "",
    SnAlarm: "",
    SnHistory: "",
  });


  // State for fetched subscription plans
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  // State for loading status of fetching plans
  const [plansLoading, setPlansLoading] = useState(false);

  // State for license key, general loading, and error messages
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false); // For form submission
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Track dialog state
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
  async function fetchLicense() {
    if (!licenseId) return;

    try {
      setLoading(true);
      
      const res = await fetch(`/api/licenses/${licenseId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load license.");

      const {
        clientName,
        clientEmail,
        macAddress,
        validFrom,
        validTo,
        subscriptionId,
        licenseKey,
      } = data.license;

      setForm({
        clientName,
        clientEmail,
        macAddress,
        validFrom: validFrom?.split("T")[0],
        validThru: validTo?.split("T")[0],
        selectedPlanId: subscriptionId,
      });

      setIsEditMode(true);
    } catch (err: any) {
      toast.error("Edit mode failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  fetchLicense();
}, [licenseId]);


  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);
      try {
        const res = await fetch(`/api/subscription-plan?page=1&limit=10`);
        const json = await res.json();
        if (json.success) {
          setPlans(json.data);
        } else {
          console.error(json.error);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

    const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCustomFields({ ...customFields, [e.target.name]: e.target.value });
  };

  // Handles changes in both input and select fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setSelectedPlan(value)
    
    // If validFrom is updated, ensure validThru is set to at least the next day
    if (name === 'validFrom') {
      const nextDay = getNextDay(value);
      if (new Date(updatedForm.validThru) <= new Date(value)) {
        updatedForm.validThru = nextDay;
      }
    }

    setForm(updatedForm);
  };

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setLicenseKey('');

  try {
    const fromDate = new Date(form.validFrom);
    const toDate = new Date(form.validThru);

    if (toDate <= fromDate) throw new Error('Valid Thru date must be after Valid From.');

    const plan = plans.find((o) => o._id === form.selectedPlanId);
    if (!plan) throw new Error("Subscription plan not found.");

    const generatedLicenseKey = generateCustomLicense(form.macAddress, fromDate, toDate, plan);
    const endpoint = isEditMode ? `/api/licenses/update/${licenseId}` : '/api/licenses/create';

    const res = await fetch(endpoint, {
      method: isEditMode ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        macAddress: form.macAddress,
        validFrom: form.validFrom,
        validTo: form.validThru,
        licenseKey: generatedLicenseKey,
        subscriptionId: form.selectedPlanId,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save license.");

    setLicenseKey(data.licenseKey || generatedLicenseKey);
    toast.success(isEditMode ? 'License updated!' : 'License created!');
    if (onSuccess) onSuccess();
  } catch (err: any) {
    setError(err.message);
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};


  // Handles copying the license key to clipboard
  const handleCopy = (text: string) => {
    // navigator.clipboard.writeText is the modern way, document.execCommand('copy') is a fallback for older browsers/environments
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        toast.success('License key copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy text:', err);
        toast.error('Failed to copy license key.');
      });
    } else {
      // Fallback for environments where navigator.clipboard is not available (e.g., some iframes)
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed'; // Avoid scrolling to bottom
      textArea.style.left = '-9999px'; // Move out of screen
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          toast.success('License key copied to clipboard!');
        } else {
          toast.error('Failed to copy license key.');
        }
      } catch (err) {
        console.error('Fallback: Failed to copy text:', err);
        toast.error('Failed to copy license key.');
      }
      document.body.removeChild(textArea);
    }
  };


  // Prepare options for the SelectField
const planOptions = [
  ...plans.map(plan => ({
    value: plan._id,
    label: plan.planName,
  }))
];


const handleSaveCustomPlan = () => {
  // Perform validation or submission logic
  console.log("Saving:", customFields);
  setIsDialogOpen(false);
};

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate License</h2>

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
      <InputField
        label="Valid From"
        name="validFrom"
        type="date"
        value={form.validFrom}
        onChange={handleChange}
        required
        min={today}
      />
      <InputField
        label="Valid Thru"
        name="validThru"
        type="date"
        value={form.validThru}
        onChange={handleChange}
        required
        min={getNextDay(form.validFrom)}
      />

      <SelectField
        label="Subscription Plan"
        name="selectedPlanId"
        value={form.selectedPlanId}
        onChange={handleChange}
        options={planOptions}
        required
        disabled={plansLoading || plans.length === 0}
      />

      {/* Display loading message or error for plans */}
      {plansLoading && (
        <p className="text-blue-600 mb-4">Loading subscription plans...</p>
      )}
      {!plansLoading && plans.length === 0 && !error && (
        <p className="text-red-500 mb-4">No subscription plans available. Please add plans to the database.</p>
      )}

<button
  type="submit"
  disabled={loading || plansLoading || plans.length === 0 || !form.selectedPlanId}
  className="w-full bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? (isEditMode ? 'Updating...' : 'Generating...') : isEditMode ? 'Update License' : 'Generate License Key'}
</button>


      {/* Display generated license key */}
      {licenseKey && (
        <MessageBox type="success">
          <strong>Generated License Key:</strong>
          <div className="flex items-center justify-between space-x-2 mt-2 p-2 bg-green-50 rounded-md border border-green-200">
            <pre className="whitespace-pre-wrap break-all flex-1 text-sm font-mono text-green-800">{licenseKey}</pre>
            <button
              onClick={() => handleCopy(licenseKey)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-200 transition-colors"
              type="button"
              title="Copy license key"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
          </div>
        </MessageBox>
      )}

      {/* Display error messages */}
      {error && (
        <MessageBox type="error">
          <strong>Error:</strong> {error}
        </MessageBox>
      )}
    </form>
  );
}
