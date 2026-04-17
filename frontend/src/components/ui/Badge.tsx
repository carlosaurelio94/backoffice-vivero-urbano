import { cn } from '@/lib/utils';

const variants = {
  prospect: 'bg-yellow-100 text-yellow-800 ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:ring-yellow-800/50',
  client:   'bg-green-100  text-green-800  ring-green-200  dark:bg-green-900/30  dark:text-green-400  dark:ring-green-800/50',
  draft:    'bg-gray-100   text-gray-700   ring-gray-200   dark:bg-slate-700     dark:text-slate-300  dark:ring-slate-600',
  sent:     'bg-blue-100   text-blue-800   ring-blue-200   dark:bg-blue-900/30   dark:text-blue-400   dark:ring-blue-800/50',
  approved: 'bg-green-100  text-green-800  ring-green-200  dark:bg-green-900/30  dark:text-green-400  dark:ring-green-800/50',
  rejected: 'bg-red-100    text-red-800    ring-red-200    dark:bg-red-900/30    dark:text-red-400    dark:ring-red-800/50',
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
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
      variants[variant],
      className
    )}>
      {labels[variant]}
    </span>
  );
}
