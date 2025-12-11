/**
 * Basement Rental Suite Initiative - TypeScript Types
 */

// Project types that can be selected (multi-select)
export enum BasementProjectType {
  FULL_REMODEL = 'Full Basement Remodel',
  BATHROOM_ADDITION = 'Basement Bathroom Addition',
  FLOORING_CARPETING = 'Flooring & Carpeting',
  DRYWALL_INSULATION = 'Drywall & Insulation',
  SEPARATE_ENTRANCE = 'Separate Entrance Addition',
  OTHER = 'Other',
}

// Project urgency options
export enum ProjectUrgency {
  ASAP = 'ASAP',
  ONE_TO_THREE_MONTHS = '1-3 months',
}

// Plan/design status
export enum PlanDesignStatus {
  HAS_PLANS = 'Yes, I already have plans/designs',
  NEEDS_HELP = 'No, I need design help',
}

// Step IDs for the basement form
// Note: SUCCESS is now a separate route (/basement-suite/confirmation)
export type BasementStepId =
  | 'PROJECT_TYPES'
  | 'SEPARATE_ENTRANCE'
  | 'PLAN_DESIGN'
  | 'PROJECT_URGENCY'
  | 'ADDITIONAL_DETAILS'
  | 'PROJECT_LOCATION'
  | 'EMAIL'
  | 'CONTACT';

// Form data structure for basement form state
export interface BasementFormData {
  projectTypes: BasementProjectType[];
  needsSeparateEntrance: boolean | null;
  hasPlanDesign: boolean | null;
  projectUrgency: ProjectUrgency | null;
  additionalDetails: string;
  projectLocation: string;
  email: string;
  fullName: string;
  phone: string;
}

// Database record structure (matches Supabase table)
export interface BasementInquiryData {
  id: string;
  created_at: string;
  updated_at: string;
  project_types: string[];
  needs_separate_entrance: boolean;
  has_plan_design: boolean;
  project_urgency: string;
  additional_details: string | null;
  project_location: string;
  email: string;
  full_name: string;
  phone: string;
  status: string;
  notes: string | null;
  session_id: string | null; // Links to funnel_sessions for attribution tracking
}

