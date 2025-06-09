// views/components/FormInput.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FIELD_PLACEHOLDERS } from '@/models/validation';

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur: (name: string, value: string) => void;
  error?: string;
  type?: string;
}

export function FormInput({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur, 
  error, 
  type = "text" 
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={FIELD_PLACEHOLDERS[name] || ""}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={(e) => onBlur(name, e.target.value)}
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
    </div>
  );
}
