'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useCreateQuote, useNextQuoteNumber } from '@/hooks/useQuotes';
import { useClients } from '@/hooks/useClients';
import { useQuoteInformation } from '@/hooks/useQuoteInformation';
import { Input }  from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

const itemSchema = z.object({
  product:     z.string().min(1, 'Requerido'),
  quantity:    z.coerce.number().positive('Debe ser > 0'),
  unit_price:  z.coerce.number().min(0),
  total_price: z.coerce.number().min(0),
});

const quoteSchema = z.object({
  client_id:      z.string().min(1, 'Seleccioná un cliente'),
  information_id: z.string().optional(),
  quote_number:   z.coerce.number().positive(),
  quote_date:     z.string().min(1, 'Requerido'),
  currency:       z.enum(['$', 'Bs', '€']),
  status:         z.enum(['draft', 'sent', 'approved', 'rejected']),
  items:          z.array(itemSchema).min(1, 'Agregá al menos un ítem'),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;
const emptyItem = { product: '', quantity: 1, unit_price: 0, total_price: 0 };

// Clases reutilizables para inputs de la tabla
const tableInputCls = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100';

export default function NewQuotePage() {
  const router              = useRouter();
  const { data: nextNumber } = useNextQuoteNumber();
  const { data: clientsData } = useClients({ page: 1, pageSize: 200 });
  const { data: infoList }    = useQuoteInformation();
  const createMutation        = useCreateQuote();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      quote_number: 1,
      quote_date:   new Date().toISOString().slice(0, 10),
      currency:     '$',
      status:       'draft',
      items:        [emptyItem],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => { if (nextNumber) setValue('quote_number', nextNumber); }, [nextNumber, setValue]);

  const watchedItems = watch('items');
  const currency     = watch('currency');
  const grandTotal   = watchedItems?.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0) ?? 0;

  const handleItemChange = (index: number) => {
    const i = watchedItems[index];
    setValue(`items.${index}.total_price`, (Number(i.quantity) || 0) * (Number(i.unit_price) || 0));
  };

  const onSubmit = async (values: QuoteFormValues) => {
    await createMutation.mutateAsync({
      ...values,
      information_id: values.information_id || undefined,
      total_amount: grandTotal,
      item_count:   values.items.length,
    });
    router.push('/quotes');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Nuevo presupuesto</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">Completá los datos y agregá los ítems</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* Datos generales */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Datos generales</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Select label="Cliente" required error={errors.client_id?.message} {...register('client_id')}>
                <option value="">Seleccioná un cliente...</option>
                {clientsData?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <Input label="N° de presupuesto" type="number" required error={errors.quote_number?.message} {...register('quote_number')} />
            <Input label="Fecha" type="date" required error={errors.quote_date?.message} {...register('quote_date')} />
            <Select label="Moneda" required {...register('currency')}>
              <option value="$">$ Dólar</option>
              <option value="Bs">Bs Bolívares</option>
              <option value="€">€ Euro</option>
            </Select>
            <Select label="Estado" required {...register('status')}>
              <option value="draft">Borrador</option>
              <option value="sent">Enviado</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </Select>
            {infoList && infoList.length > 0 && (
              <div className="sm:col-span-2">
                <Select label="Texto informativo (opcional)" {...register('information_id')}>
                  <option value="">Sin texto adicional</option>
                  {infoList.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Ítems */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-700">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Ítems ({fields.length})</h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => append(emptyItem)}>
              <Plus className="h-4 w-4" />Agregar ítem
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 w-[40%]">Producto / Servicio</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 w-[15%]">Cantidad</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 w-[20%]">Precio unit.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 w-[20%]">Total</th>
                  <th className="px-4 py-3 w-[5%]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {fields.map((field, index) => (
                  <tr key={field.id}>
                    <td className="px-4 py-3">
                      <input placeholder="Ej: Planta ornamental 40cm" className={tableInputCls} {...register(`items.${index}.product`)} />
                      {errors.items?.[index]?.product && (
                        <p className="mt-0.5 text-xs text-red-500">{errors.items[index]?.product?.message}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="1" step="1" className={`${tableInputCls} text-right`}
                        {...register(`items.${index}.quantity`, { onChange: () => handleItemChange(index) })} />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" step="0.01" className={`${tableInputCls} text-right`}
                        {...register(`items.${index}.unit_price`, { onChange: () => handleItemChange(index) })} />
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-slate-100">
                      {formatCurrency((Number(watchedItems?.[index]?.quantity) || 0) * (Number(watchedItems?.[index]?.unit_price) || 0), currency)}
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => remove(index)} disabled={fields.length === 1}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30 dark:hover:bg-red-900/30 dark:hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end border-t border-gray-200 px-6 py-4 dark:border-slate-700">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatCurrency(grandTotal, currency)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} disabled={createMutation.isPending}>Cancelar</Button>
          <Button type="submit" loading={createMutation.isPending}>Crear presupuesto</Button>
        </div>
      </form>
    </div>
  );
}
