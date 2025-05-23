type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  size?: 'small' | 'large';
};

export function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  size = 'small',
}: InputFieldProps) {
  const baseClasses =
    'mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500';

  const sizeClasses =
    size === 'large'
      ? 'text-lg py-3 px-4'  // Larger input
      : 'text-base py-2 px-3'; // Default size

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`${baseClasses} ${sizeClasses}`}
      />
    </div>
  );
}
