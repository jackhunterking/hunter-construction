import {
  // Legacy types
  PricingConfig,
  Flooring,
  HvacOption,
  ExteriorColor,
  UseCase,
  // New construction types
  ProjectType,
  PropertyType,
  LotSize,
  Timeline,
  BudgetRange,
  ConstructionPricingConfig,
} from './types';

// ===== CONSTRUCTION PROJECT CONFIGURATION =====

export const CONSTRUCTION_PRICING: ConstructionPricingConfig = {
  baseRanges: {
    [ProjectType.BASEMENT_UNIT]: { low: 60000, high: 120000 },
    [ProjectType.GARDEN_SUITE]: { low: 180000, high: 300000 },
    [ProjectType.ADDITION]: { low: 100000, high: 250000 },
    [ProjectType.GARAGE_CONVERSION]: { low: 80000, high: 150000 },
    [ProjectType.OTHER]: { low: 50000, high: 200000 },
  },
  modifiers: {
    propertyType: {
      [PropertyType.SINGLE_FAMILY]: 1.0,
      [PropertyType.SEMI_DETACHED]: 1.05,
      [PropertyType.DETACHED]: 1.0,
      [PropertyType.TOWNHOUSE]: 1.1,
      [PropertyType.OTHER]: 1.0,
    },
    lotSize: {
      [LotSize.SMALL]: 1.05,       // Small lots = more complexity
      [LotSize.MEDIUM]: 1.0,
      [LotSize.LARGE]: 0.98,
      [LotSize.VERY_LARGE]: 0.95,
    },
    bedroomsMultiplier: 8000,      // $8k per additional bedroom
    bathroomsMultiplier: 12000,    // $12k per additional bathroom
  },
};

export const CONSTRUCTION_STEPS_ORDER = [
  'PROJECT_TYPE',
  'PROJECT_DETAILS',
  'TIMELINE_BUDGET',
  'EMAIL_CAPTURE',
  'RESULT',     // End of Phase 1
  'ADDRESS',    // Start of Phase 2
  'CONTACT',
  'SUCCESS',
] as const;

export const PROJECT_TYPE_OPTIONS = [
  {
    value: ProjectType.BASEMENT_UNIT,
    label: 'Basement Unit',
    description: 'Legal rental apartment with premium finishes',
    icon: '🏠',
    estimateRange: '$60,000 - $120,000',
    features: ['Self-contained unit', 'Separate entrance', 'Full kitchen & bathroom', 'High ROI potential'],
  },
  {
    value: ProjectType.GARDEN_SUITE,
    label: 'Garden Suite / ADU',
    description: 'Standalone accessory dwelling unit',
    icon: '🏡',
    estimateRange: '$180,000 - $300,000',
    features: ['Detached structure', 'Complete living space', 'Modern design', 'Maximum rental income'],
  },
  {
    value: ProjectType.ADDITION,
    label: 'Addition / Extension',
    description: 'Expand footprint for multi-unit dwelling',
    icon: '📐',
    estimateRange: '$100,000 - $250,000',
    features: ['Increased square footage', 'Structural integration', 'Multiple unit potential', 'Property value boost'],
  },
  {
    value: ProjectType.GARAGE_CONVERSION,
    label: 'Garage Conversion',
    description: 'Modern studio or laneway house',
    icon: '🚗',
    estimateRange: '$80,000 - $150,000',
    features: ['Existing structure use', 'Cost-effective', 'Quick turnaround', 'Urban living appeal'],
  },
  {
    value: ProjectType.OTHER,
    label: 'Other / Consultation',
    description: 'Custom project or expert advice',
    icon: '💬',
    estimateRange: 'Custom Quote',
    features: ['Tailored solutions', 'Expert consultation', 'Flexible options', 'Creative approaches'],
  },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: PropertyType.SINGLE_FAMILY, label: 'Single Family Home', icon: '🏘️' },
  { value: PropertyType.SEMI_DETACHED, label: 'Semi-Detached', icon: '🏡' },
  { value: PropertyType.DETACHED, label: 'Detached', icon: '🏠' },
  { value: PropertyType.TOWNHOUSE, label: 'Townhouse', icon: '🏘️' },
  { value: PropertyType.OTHER, label: 'Other', icon: '🏗️' },
];

export const LOT_SIZE_OPTIONS = [
  { value: LotSize.SMALL, label: 'Small', description: '< 25ft wide', icon: '📏' },
  { value: LotSize.MEDIUM, label: 'Medium', description: '25-40ft wide', icon: '📐' },
  { value: LotSize.LARGE, label: 'Large', description: '40-60ft wide', icon: '📊' },
  { value: LotSize.VERY_LARGE, label: 'Very Large', description: '> 60ft wide', icon: '📏📊' },
];

export const TIMELINE_OPTIONS = [
  { value: Timeline.ASAP, label: 'ASAP', description: '< 3 months', icon: '⚡' },
  { value: Timeline.THREE_MONTHS, label: '3-6 months', description: 'Standard timeline', icon: '📅' },
  { value: Timeline.SIX_MONTHS, label: '6-12 months', description: 'Planned project', icon: '📆' },
  { value: Timeline.TWELVE_MONTHS, label: '12+ months', description: 'Long-term planning', icon: '🗓️' },
  { value: Timeline.FLEXIBLE, label: 'Flexible', description: 'No rush', icon: '⏰' },
];

export const BUDGET_OPTIONS = [
  { value: BudgetRange.UNDER_100K, label: 'Under $100k', icon: '💵' },
  { value: BudgetRange.RANGE_100K_200K, label: '$100k - $200k', icon: '💰' },
  { value: BudgetRange.RANGE_200K_300K, label: '$200k - $300k', icon: '💎' },
  { value: BudgetRange.OVER_300K, label: 'Over $300k', icon: '🏆' },
  { value: BudgetRange.NOT_SURE, label: 'Not Sure', icon: '🤔' },
];

// ===== LEGACY POD CONFIGURATION (for backward compatibility) =====

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
    image: 'https://placehold.co/600x400/e2e8f0/033A3F?text=Light+Composite+Model',
  },
  {
    value: ExteriorColor.BROWN,
    label: 'Brown Composite',
    hex: '#78350f',
    image: 'https://placehold.co/600x400/78350f/ffffff?text=Brown+Composite+Model',
  },
  {
    value: ExteriorColor.DARK,
    label: 'Dark Composite',
    hex: '#1e293b',
    image: 'https://placehold.co/600x400/1e293b/ffffff?text=Dark+Composite+Model',
  },
];

export const FLOORING_OPTIONS = [
  { value: Flooring.CARPET, label: 'Carpet' },
  { value: Flooring.VINYL, label: 'Vinyl' },
  { value: Flooring.CONCRETE, label: 'Polished Concrete' },
];
