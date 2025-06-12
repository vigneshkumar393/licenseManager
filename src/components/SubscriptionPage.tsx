'use client';

import { useEffect, useState } from 'react';
import PlanCard from './PlanCard';
import SubscriptionForm from './SubscriptionForm';
import Dialog from './Dialog';

type Plan = {
  _id: string;
  planName: string;
  SnHttpClient: number;
  SnScheduler: number;
  SnAlarm: number;
  SnHistory: number;
};

type Props = {
  searchQuery: string;
  refreshList: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
};

export default function SubscriptionPage({
  searchQuery,
  refreshList,
  isDialogOpen,
  setIsDialogOpen,
}: Props) {
    console.log("sub-list"+isDialogOpen)
  const currentPlan = 'free';
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  useEffect(() => {

    fetchPlans();
  }, [refreshList]);

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

  const handleEdit = (plan: Plan) => {
    setEditPlan(plan);
    setIsDialogOpen(true);
  };

  const handleSave = (updatedPlan: Plan) => {
    console.log(updatedPlan);
    setPlans((prevPlans) =>
      prevPlans.map((p) => (p._id === updatedPlan._id ? updatedPlan : p))
    );
    setIsDialogOpen(false);
    setEditPlan(null);
     fetchPlans();
  };

  const filteredPlans = plans.filter((plan) =>
    plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Object.entries(plan).some(
      ([key, value]) =>
        key !== 'planName' &&
        (key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(value).includes(searchQuery))
    )
  );
const shouldShowForm =
  isDialogOpen &&
  editPlan !== null &&
  editPlan._id !== '' &&
  editPlan.planName.trim() !== '';
console.log("shouldShowForm"+shouldShowForm)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Choose Your Subscription Plan</h1>

      {loading ? (
        <p>Loading plans...</p>
      ) : filteredPlans.length === 0 ? (
        <p className="text-gray-500">No plans matched your search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan._id}
              title={plan.planName.toUpperCase()}
              features={{
                SnHttpClient: plan.SnHttpClient,
                SnScheduler: plan.SnScheduler,
                SnAlarm: plan.SnAlarm,
                SnHistory: plan.SnHistory,
              }}
              currentPlan={plan.planName === currentPlan}
              onEdit={() => handleEdit(plan)}
            />
          ))}
        </div>
      )}

<Dialog
  open={isDialogOpen}
  onClose={() => {
    setIsDialogOpen(false);
    setEditPlan(null);
  }}
title={`${
  editPlan && editPlan.planName ? `Edit Subscription Plan ${editPlan.planName}` : 'Insert New Subscription Plan'
}`}

>
<SubscriptionForm
  defaultValues={
    editPlan ?? {
      _id: '',
      planName: '',
      SnHttpClient: 0,
      SnScheduler: 0,
      SnAlarm: 0,
      SnHistory: 0,
    }
  }
    onCancel={() => {
      setIsDialogOpen(false);
      setEditPlan(null);
    }}
    onSave={handleSave}
  />
</Dialog>

    </div>
  );
}
