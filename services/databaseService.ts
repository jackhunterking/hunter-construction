import { supabase } from './supabaseClient';
import { PodConfiguration, AddressData, ContactData, EstimateResult, HvacOption } from '../types';

export interface QuoteData {
  id: string;
  created_at: string;
  updated_at: string;
  use_case: string;
  exterior_color: string;
  flooring: string;
  hvac: boolean;
  additional_details: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  full_address: string | null;
  latitude: number | null;
  longitude: number | null;
  estimate_low: number;
  estimate_high: number;
  status: string;
  notes: string | null;
}

// Generate a mock quote ID for when Supabase is not configured
function generateMockId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function createQuote(
  config: PodConfiguration,
  address: AddressData,
  contact: ContactData,
  estimate: { low: number; high: number }
): Promise<QuoteData> {
  if (!supabase) {
    console.warn('Supabase not configured, returning mock quote');
    return {
      id: generateMockId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      use_case: config.useCase || '',
      exterior_color: config.exteriorColor || '',
      flooring: config.flooring || '',
      hvac: config.hvac === HvacOption.YES,
      additional_details: config.additionalDetails || '',
      email: contact.email,
      full_name: contact.fullName || null,
      phone: contact.phone || null,
      full_address: address.fullAddress || null,
      latitude: address.lat,
      longitude: address.lng,
      estimate_low: estimate.low,
      estimate_high: estimate.high,
      status: 'submitted',
      notes: null,
    };
  }

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      use_case: config.useCase,
      exterior_color: config.exteriorColor,
      flooring: config.flooring,
      hvac: config.hvac === HvacOption.YES,
      additional_details: config.additionalDetails || '',
      email: contact.email,
      full_name: contact.fullName || null,
      phone: contact.phone || null,
      full_address: address.fullAddress || null,
      latitude: address.lat,
      longitude: address.lng,
      estimate_low: estimate.low,
      estimate_high: estimate.high,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating quote:', error);
    throw new Error(`Failed to save quote: ${error.message}`);
  }

  return data as QuoteData;
}

export async function getQuote(id: string): Promise<QuoteData | null> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot fetch quote');
    return null;
  }

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching quote:', error);
    return null;
  }

  return data as QuoteData;
}

export async function updateQuoteStatus(
  id: string,
  status: 'estimate_sent' | 'submitted' | 'reviewed' | 'contacted' | 'converted' | 'rejected',
  notes?: string
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot update quote status');
    return true; // Return true to not block the flow
  }

  const updateData: Record<string, any> = { status };
  if (notes !== undefined) {
    updateData.notes = notes;
  }

  const { error } = await supabase
    .from('quotes')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating quote status:', error);
    return false;
  }

  return true;
}

/**
 * Touchpoint 1: Create partial quote with email, config, and estimate
 * Status: 'estimate_sent'
 */
export async function createPartialQuote(
  email: string,
  config: PodConfiguration,
  estimate: { low: number; high: number }
): Promise<QuoteData> {
  if (!supabase) {
    console.warn('Supabase not configured, returning mock partial quote');
    return {
      id: generateMockId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      use_case: config.useCase || '',
      exterior_color: config.exteriorColor || '',
      flooring: config.flooring || '',
      hvac: config.hvac === HvacOption.YES,
      additional_details: config.additionalDetails || '',
      email,
      full_name: null,
      phone: null,
      full_address: null,
      latitude: null,
      longitude: null,
      estimate_low: estimate.low,
      estimate_high: estimate.high,
      status: 'estimate_sent',
      notes: null,
    };
  }

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      email,
      use_case: config.useCase,
      exterior_color: config.exteriorColor,
      flooring: config.flooring,
      hvac: config.hvac === HvacOption.YES,
      additional_details: config.additionalDetails || '',
      estimate_low: estimate.low,
      estimate_high: estimate.high,
      status: 'estimate_sent',
      // Contact info fields are nullable for this stage
      full_name: null,
      phone: null,
      full_address: null,
      latitude: null,
      longitude: null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating partial quote:', error);
    throw new Error(`Failed to save partial quote: ${error.message}`);
  }

  return data as QuoteData;
}

/**
 * Touchpoint 2: Update existing quote with full contact info and address
 * Find by email and update with remaining fields, change status to 'submitted'
 */
export async function completeQuote(
  email: string,
  address: AddressData,
  contact: ContactData
): Promise<QuoteData> {
  if (!supabase) {
    console.warn('Supabase not configured, returning mock completed quote');
    return {
      id: generateMockId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      use_case: '',
      exterior_color: '',
      flooring: '',
      hvac: false,
      additional_details: '',
      email,
      full_name: contact.fullName,
      phone: contact.phone,
      full_address: address.fullAddress,
      latitude: address.lat,
      longitude: address.lng,
      estimate_low: 0,
      estimate_high: 0,
      status: 'submitted',
      notes: null,
    };
  }

  // Find the most recent estimate_sent quote for this email
  const { data: existingQuotes, error: findError } = await supabase
    .from('quotes')
    .select('*')
    .eq('email', email)
    .eq('status', 'estimate_sent')
    .order('created_at', { ascending: false })
    .limit(1);

  if (findError) {
    console.error('Error finding quote:', findError);
    throw new Error(`Failed to find quote: ${findError.message}`);
  }

  if (!existingQuotes || existingQuotes.length === 0) {
    throw new Error('No pending quote found for this email');
  }

  const existingQuote = existingQuotes[0];

  // Update the quote with contact info and address
  const { data, error } = await supabase
    .from('quotes')
    .update({
      full_name: contact.fullName,
      phone: contact.phone,
      full_address: address.fullAddress,
      latitude: address.lat,
      longitude: address.lng,
      status: 'submitted',
    })
    .eq('id', existingQuote.id)
    .select()
    .single();

  if (error) {
    console.error('Error completing quote:', error);
    throw new Error(`Failed to complete quote: ${error.message}`);
  }

  return data as QuoteData;
}
