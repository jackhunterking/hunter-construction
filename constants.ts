import { PricingConfig, Flooring, HvacOption, ExteriorColor, UseCase } from './types';

export const PRICING_CONFIG: PricingConfig = {
  baseLow: 19000,
  baseHigh: 25000,
  flooringUpcharges: {
    [Flooring.CARPET]: 0,
    [Flooring.VINYL]: 800,
    [Flooring.CONCRETE]: 1500,
  },
  hvacUpcharges: {
    [HvacOption.YES]: 3000,
    [HvacOption.NO]: 0,
  },
  colorUpcharges: {
    [ExteriorColor.LIGHT]: 0,
    [ExteriorColor.BROWN]: 0,
    [ExteriorColor.DARK]: 0,
  },
};

export const STEPS_ORDER = [
  'INTENT',
  'COLOR',
  'FLOORING',
  'HVAC',
  'EMAIL_CAPTURE',
  'RESULT',   // End of Phase 1
  'ADDRESS',  // Start of Phase 2
  'CONTACT',
  'SUCCESS',
] as const;

export const USE_CASE_OPTIONS = [
  { value: UseCase.HOME_OFFICE, label: 'Home Office', icon: '💻' },
  { value: UseCase.HOME_GYM, label: 'Home Gym', icon: '🏋️' },
  { value: UseCase.SIDE_BUSINESS, label: 'Side Business', icon: '💈' },
  { value: UseCase.OTHER, label: 'Other', icon: '✨' },
];

export const COLOR_OPTIONS = [
  { 
    value: ExteriorColor.LIGHT, 
    label: 'Light Composite', 
    hex: '#e2e8f0',
    image: 'https://placehold.co/600x400/e2e8f0/033A3F?text=Light+Composite+Model'
  },
  { 
    value: ExteriorColor.BROWN, 
    label: 'Brown Composite', 
    hex: '#78350f',
    image: 'https://placehold.co/600x400/78350f/ffffff?text=Brown+Composite+Model'
  },
  { 
    value: ExteriorColor.DARK, 
    label: 'Dark Composite', 
    hex: '#1e293b',
    image: 'https://placehold.co/600x400/1e293b/ffffff?text=Dark+Composite+Model'
  },
];

export const FLOORING_OPTIONS = [
  { value: Flooring.CARPET, label: 'Carpet' },
  { value: Flooring.VINYL, label: 'Vinyl' },
  { value: Flooring.CONCRETE, label: 'Polished Concrete' },
];