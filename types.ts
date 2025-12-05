// ===== CONSTRUCTION PROJECT TYPES =====

export enum ProjectType {
  BASEMENT_UNIT = 'Basement Unit',
  GARDEN_SUITE = 'Garden Suite / ADU',
  ADDITION = 'Addition / Extension',
  GARAGE_CONVERSION = 'Garage Conversion',
  OTHER = 'Other / Consultation',
}

export enum PropertyType {
  SINGLE_FAMILY = 'Single Family',
  SEMI_DETACHED = 'Semi-Detached',
  DETACHED = 'Detached',
  TOWNHOUSE = 'Townhouse',
  OTHER = 'Other',
}

export enum LotSize {
  SMALL = 'Small (< 25ft wide)',
  MEDIUM = 'Medium (25-40ft wide)',
  LARGE = 'Large (40-60ft wide)',
  VERY_LARGE = 'Very Large (> 60ft wide)',
}

export enum Timeline {
  ASAP = 'ASAP (< 3 months)',
  THREE_MONTHS = '3-6 months',
  SIX_MONTHS = '6-12 months',
  TWELVE_MONTHS = '12+ months',
  FLEXIBLE = 'Flexible',
}

export enum BudgetRange {
  UNDER_100K = 'Under $100k',
  RANGE_100K_200K = '$100k - $200k',
  RANGE_200K_300K = '$200k - $300k',
  OVER_300K = 'Over $300k',
  NOT_SURE = 'Not Sure',
}

export interface ProjectDetails {
  propertyType: PropertyType | null;
  lotSize: LotSize | null;
  existingUnits: number;
  desiredUnits: number;
  bedroomsNeeded: number | null;
  bathroomsNeeded: number | null;
  hasExistingPlans: boolean;
  additionalDetails: string;
}

export interface TimelineBudget {
  timeline: Timeline | null;
  budgetRange: BudgetRange | null;
  financingNeeded: boolean;
}

export interface ProjectConfiguration {
  projectType: ProjectType | null;
  details: ProjectDetails;
  timelineBudget: TimelineBudget;
}

// ===== LEGACY POD TYPES (for backward compatibility during migration) =====

export enum UseCase {
  HOME_OFFICE = 'Home Office',
  HOME_GYM = 'Home Gym',
  SIDE_BUSINESS = 'Side Business',
  OTHER = 'Other',
}

export enum ExteriorColor {
  LIGHT = 'Light',
  BROWN = 'Brown',
  DARK = 'Dark',
}

export enum Flooring {
  CARPET = 'Carpet',
  VINYL = 'Vinyl',
  CONCRETE = 'Concrete',
}

export enum HvacOption {
  YES = 'Yes',
  NO = 'No',
}

export interface PodConfiguration {
  useCase: UseCase | null;
  exteriorColor: ExteriorColor | null;
  flooring: Flooring | null;
  hvac: HvacOption | null;
  additionalDetails: string;
}

// ===== SHARED TYPES =====

export interface AddressData {
  fullAddress: string;
  lat: number | null;
  lng: number | null;
}

export interface ContactData {
  email: string;
  fullName: string;
  phone: string;
}

export interface EstimateResult {
  low: number;
  high: number;
  summary: string;
}

// ===== PRICING CONFIGURATION =====

export interface PricingConfig {
  baseLow: number;
  baseHigh: number;
  flooringUpcharges: Record<Flooring, number>;
  hvacUpcharges: Record<HvacOption, number>;
  colorUpcharges: Record<ExteriorColor, number>;
}

export interface ConstructionPricingConfig {
  baseRanges: Record<ProjectType, { low: number; high: number }>;
  modifiers: {
    propertyType?: Record<PropertyType, number>;
    lotSize?: Record<LotSize, number>;
    bedroomsMultiplier?: number;
    bathroomsMultiplier?: number;
  };
}

// ===== STEP IDS =====

// Legacy pod steps
export type LegacyStepId =
  | 'INTENT'
  | 'COLOR'
  | 'FLOORING'
  | 'HVAC'
  | 'EMAIL_CAPTURE'
  | 'RESULT'
  | 'ADDRESS'
  | 'CONTACT'
  | 'SUCCESS';

// New construction steps
export type ConstructionStepId =
  | 'PROJECT_TYPE'
  | 'PROJECT_DETAILS'
  | 'TIMELINE_BUDGET'
  | 'EMAIL_CAPTURE'
  | 'RESULT'
  | 'ADDRESS'
  | 'CONTACT'
  | 'SUCCESS';

// Union type for current step (supports both during migration)
export type StepId = LegacyStepId | ConstructionStepId;
