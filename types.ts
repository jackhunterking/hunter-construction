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

export interface PricingConfig {
  baseLow: number;
  baseHigh: number;
  flooringUpcharges: Record<Flooring, number>;
  hvacUpcharges: Record<HvacOption, number>;
  colorUpcharges: Record<ExteriorColor, number>;
}

export interface EstimateResult {
  low: number;
  high: number;
  currency: string;
  summary: string;
}

export type StepId = 
  | 'INTENT' 
  | 'COLOR' 
  | 'FLOORING' 
  | 'HVAC' 
  | 'EMAIL_CAPTURE'
  | 'RESULT'
  | 'ADDRESS' 
  | 'CONTACT' 
  | 'SUCCESS';