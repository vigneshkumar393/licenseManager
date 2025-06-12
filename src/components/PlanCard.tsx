import { Pencil } from 'lucide-react'; // or use any icon lib you prefer

type PlanCardProps = {
  title: string;
  features: Record<string, number>;
  currentPlan?: boolean;
  onEdit?: () => void;
};

export default function PlanCard({ title, features, currentPlan, onEdit }: PlanCardProps) {
  return (
    <div className="border p-4 rounded-xl shadow-sm border-gray-300 relative">
      <h2 className="text-xl font-bold mb-2 flex justify-between items-center">
        {title}
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-gray-500 hover:text-gray-800"
            title="Edit Plan"
          >
            <Pencil size={18} />
          </button>
        )}
      </h2>
      <ul className="text-sm mb-4 space-y-1">
        {Object.entries(features).map(([key, value]) => (
          <li key={key}>
            {key}: <strong>{value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
