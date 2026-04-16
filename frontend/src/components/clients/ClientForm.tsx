'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal }  from '@/components/ui/Modal';
import { Input }  from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateClient, useUpdateClient } from '@/hooks/useClients';
import type { Client } from '@/types';

// ─── Validación con Zod ───────────────────────────────────────────────────────
const clientSchema = z.object({
  name:          z.string().min(2, 'Mínimo 2 caracteres').max(120),
  address:       z.string().max(200).optional().or(z.literal('')),
  rif:           z.string().max(20).optional().or(z.literal('')),
  phone:         z.string().max(20).optional().or(z.literal('')),
  client_status: z.enum(['prospect', 'client']),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  open:     boolean;
  onClose:  () => void;
  /** Si se pasa `client`, el modal funciona en modo edición */
  client?:  Client | null;
}

export function ClientForm({ open, onClose, client }: ClientFormProps) {
  const isEditing = !!client;

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name:          '',
      address:       '',
      rif:           '',
      phone:         '',
      client_status: 'prospect',
    },
  });

  // Cuando se abre en modo edición, pre-cargar los valores del cliente
  useEffect(() => {
    if (client) {
      reset({
        name:          client.name,
        address:       client.address ?? '',
        rif:           client.rif    ?? '',
        phone:         client.phone  ?? '',
        client_status: client.client_status,
      });
    } else {
      reset({ name: '', address: '', rif: '', phone: '', client_status: 'prospect' });
    }
  }, [client, reset]);

  const onSubmit = async (values: ClientFormValues) => {
    // Limpiar campos opcionales vacíos → undefined para no guardar strings vacíos
    const dto = {
      ...values,
      address: values.address || undefined,
      rif:     values.rif     || undefined,
      phone:   values.phone   || undefined,
    };

    if (isEditing && client) {
      await updateMutation.mutateAsync({ id: client.id, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar cliente' : 'Nuevo cliente'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nombre"
          required
          placeholder="Ej: Carlos García"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="RIF"
            placeholder="J-12345678-9"
            error={errors.rif?.message}
            {...register('rif')}
          />
          <Input
            label="Teléfono"
            placeholder="+58 412 000 0000"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <Input
          label="Dirección"
          placeholder="Calle, ciudad, estado"
          error={errors.address?.message}
          {...register('address')}
        />

        {/* Select de estado — usa estilos Tailwind igual que Input */}
        <div className="flex flex-col gap-1">
          <label htmlFor="client_status" className="text-sm font-medium text-gray-700">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            id="client_status"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900
                       focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            {...register('client_status')}
          >
            <option value="prospect">Prospecto</option>
            <option value="client">Cliente</option>
          </select>
          {errors.client_status && (
            <p className="text-xs text-red-600">{errors.client_status.message}</p>
          )}
        </div>

        {/* Footer con botones */}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" loading={isPending}>
            {isEditing ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
