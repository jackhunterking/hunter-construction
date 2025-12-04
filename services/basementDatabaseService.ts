import { supabase } from './supabaseClient';
import { BasementFormData, BasementInquiryData } from '../types/basement';

/**
 * Generate a mock ID for when Supabase is not configured
 */
function generateMockId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new basement inquiry in the database
 */
export async function createBasementInquiry(
  formData: BasementFormData
): Promise<BasementInquiryData> {
  const now = new Date().toISOString();
  const generatedId = crypto.randomUUID();

  if (!supabase) {
    console.warn('Supabase not configured, returning mock basement inquiry');
    return {
      id: generateMockId(),
      created_at: now,
      updated_at: now,
      project_types: formData.projectTypes,
      needs_separate_entrance: formData.needsSeparateEntrance ?? false,
      has_plan_design: formData.hasPlanDesign ?? false,
      project_urgency: formData.projectUrgency || '',
      additional_details: formData.additionalDetails || null,
      project_location: formData.projectLocation,
      email: formData.email,
      full_name: formData.fullName,
      phone: formData.phone,
      status: 'submitted',
      notes: null,
    };
  }

  // Insert without .select() to avoid requiring SELECT permission for anon role
  // This is more secure for public forms - we construct the response from input data
  const { error } = await supabase
    .from('basement_inquiries')
    .insert({
      project_types: formData.projectTypes,
      needs_separate_entrance: formData.needsSeparateEntrance,
      has_plan_design: formData.hasPlanDesign,
      project_urgency: formData.projectUrgency,
      additional_details: formData.additionalDetails || null,
      project_location: formData.projectLocation,
      email: formData.email,
      full_name: formData.fullName,
      phone: formData.phone,
      status: 'submitted',
    });

  if (error) {
    console.error('Error creating basement inquiry:', error);
    throw new Error(`Failed to save basement inquiry: ${error.message}`);
  }

  // Return constructed response since we can't SELECT back the inserted row
  // The actual DB-generated UUID is different, but we only need a reference ID for emails
  return {
    id: generatedId,
    created_at: now,
    updated_at: now,
    project_types: formData.projectTypes,
    needs_separate_entrance: formData.needsSeparateEntrance ?? false,
    has_plan_design: formData.hasPlanDesign ?? false,
    project_urgency: formData.projectUrgency || '',
    additional_details: formData.additionalDetails || null,
    project_location: formData.projectLocation,
    email: formData.email,
    full_name: formData.fullName,
    phone: formData.phone,
    status: 'submitted',
    notes: null,
  };
}

/**
 * Get a basement inquiry by ID
 */
export async function getBasementInquiry(id: string): Promise<BasementInquiryData | null> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot fetch basement inquiry');
    return null;
  }

  const { data, error } = await supabase
    .from('basement_inquiries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching basement inquiry:', error);
    return null;
  }

  return data as BasementInquiryData;
}

/**
 * Update the status of a basement inquiry
 */
export async function updateBasementInquiryStatus(
  id: string,
  status: 'submitted' | 'reviewed' | 'contacted' | 'converted' | 'rejected',
  notes?: string
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot update basement inquiry status');
    return true;
  }

  const updateData: Record<string, any> = { status };
  if (notes !== undefined) {
    updateData.notes = notes;
  }

  const { error } = await supabase
    .from('basement_inquiries')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating basement inquiry status:', error);
    return false;
  }

  return true;
}

