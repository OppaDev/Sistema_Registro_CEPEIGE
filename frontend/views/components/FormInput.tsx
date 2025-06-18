// views/components/FormInput.tsx - VERSIÓN MEJORADA
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur: (name: string, value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function FormInput({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur, 
  error, 
  type = "text",
  placeholder,
  icon
}: FormInputProps) {
  const placeholders: Record<string, string> = {
    ciPasaporte: "1004228621 o 2AB123456",
    nombres: "Juan Carlos",
    apellidos: "Pérez López",
    numTelefono: " +593 991234567",
    correo: "juan@email.com",
    pais: "Ecuador",
    provinciaEstado: "Pichincha",
    ciudad: "Quito",
    profesion: "Ingeniero",
    institucion: "Universidad Central",
    razonSocial: "Mi Empresa S.A.",
    identificacionTributaria: "1791234567001",
    telefono: "+593 99 123 4567",
    correoFactura: "facturacion@empresa.com"
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder || placeholders[name] || ""}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={(e) => onBlur(name, e.target.value)}
          className={`${icon ? 'pl-10' : ''} ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          } transition-colors`}
        />
      </div>
      {error && (
        <span className="text-red-500 text-sm flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </span>
      )}
    </div>
  );
}
