import { supabase } from './supabase';
import { getDeviceId } from './utils';
import type { QuoteInformation } from '@/types';

export async function getQuoteInformationList(): Promise<QuoteInformation[]> {
  const { data, error } = await supabase
    .from('quote_information')
    .select('*')
    .eq('deleted', false)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as QuoteInformation[];
}

export async function createQuoteInformation(
  dto: { name: string; information: string }
): Promise<QuoteInformation> {
  const { data, error } = await supabase
    .from('quote_information')
    .insert({ ...dto, created_by: getDeviceId() })
    .select()
    .single();

  if (error) throw error;
  return data as QuoteInformation;
}

export async function updateQuoteInformation(
  id: string,
  dto: { name?: string; information?: string }
): Promise<QuoteInformation> {
  const { data, error } = await supabase
    .from('quote_information')
    .update({ ...dto, updated_by: getDeviceId() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as QuoteInformation;
}

export async function deleteQuoteInformation(id: string): Promise<void> {
  const { error } = await supabase
    .from('quote_information')
    .update({ deleted: true, updated_by: getDeviceId() })
    .eq('id', id);

  if (error) throw error;
}
