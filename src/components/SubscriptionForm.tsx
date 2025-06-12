'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Plan = {
  _id: string;
  planName: string;
  SnHttpClient: number;
  SnScheduler: number;
  SnAlarm: number;
  SnHistory: number;
};

type SubscriptionFormProps = {
  defaultValues: Plan;
  onCancel: () => void;
  onSave: (updatedPlan: Plan) => void;
};

export default function SubscriptionForm({
  defaultValues,
  onCancel,
  onSave,
}: SubscriptionFormProps) {
  const [plan, setPlan] = useState<Plan>(defaultValues);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPlan(defaultValues);
  }, [defaultValues]);

  const handleChange = (field: keyof Plan, value: number) => {
    setPlan((prev) => ({ ...prev, [field]: value }));
  };

const handleSubmit = async () => {
  setLoading(true);
  try {
    const method = plan._id ? 'PUT' : 'POST';
    const endpoint = plan._id
      ? `/api/subscription-plan/${plan._id}`
      : `/api/subscription-plan/create`;

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Something went wrong');
    }

    onSave({ ...plan, _id: plan._id || data.insertedId });
    toast.success(plan._id ? 'Successfully updated plan.' : 'Successfully created new plan.');
  } catch (error: any) {
    console.error('❌ Error saving plan:', error);
    toast.error(`❌ ${error.message || 'Error saving plan'}`);
  } finally {
    setLoading(false);
  }
};

  return (
<div className="space-y-4">
  {!plan._id && (
    <div>
      <label className="block text-sm font-medium mb-1">Plan Name</label>
      <input
        type="text"
        value={plan.planName}
        onChange={(e) =>
          setPlan((prev) => ({ ...prev, planName: e.target.value }))
        }
        className="w-full border rounded p-2"
        placeholder="Enter plan name"
        required
      />
    </div>
  )}

      {(['SnHttpClient', 'SnScheduler', 'SnAlarm', 'SnHistory'] as const).map((key) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-1">{key}</label>
          <input
            type="number"
            value={plan[key]}
            onChange={(e) => handleChange(key, Number(e.target.value))}
            className="w-full border rounded p-2"
            min={0}
          />
        </div>
      ))}

      <div className="flex justify-end space-x-2 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Saving...' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
