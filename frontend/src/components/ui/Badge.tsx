import { cn } from '@/lib/utils';

// Variantes de color para cada tipo de badge
const variants = {
  prospect: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  client:   'bg-green-100  text-green-800  ring-green-200',
  draft:    'bg-gray-100   text-gray-700   ring-gray-200',
  sent:     'bg-blue-100   text-blue-800   ring-blue-200',
  approved: 'bg-green-100  text-green-800  ring-green-200',
  rejected: 'bg-red-100    text-red-800    ring-red-200',
} as const;

const labels: Record<keyof typeof variants, string> = {
  prospect: 'Prospecto',
  client:   'Cliente',
  draft:    'Borrador',
  sent:     'Enviado',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

interface BadgeProps {
  variant: keyof typeof variants;
  className?: string;
}

export function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className
      )}
    >
      {labels[variant]}
    </span>
  );
}
