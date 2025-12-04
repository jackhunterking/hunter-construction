import { BasementProjectType, ProjectUrgency, BasementStepId } from '../types/basement';

/**
 * Basement Rental Suite Initiative - Constants
 */

// Order of steps in the basement form
// Note: SUCCESS is handled by a separate /basement-suite/confirmation route
export const BASEMENT_STEPS_ORDER: BasementStepId[] = [
  'PROJECT_TYPES',
  'SEPARATE_ENTRANCE',
  'PLAN_DESIGN',
  'PROJECT_URGENCY',
  'ADDITIONAL_DETAILS',
  'PROJECT_LOCATION',
  'EMAIL',
  'CONTACT',
];

// Project type options for multi-select
export const PROJECT_TYPE_OPTIONS = [
  { value: BasementProjectType.FULL_REMODEL, label: 'Full Basement Remodel' },
  { value: BasementProjectType.BATHROOM_ADDITION, label: 'Basement Bathroom Addition' },
  { value: BasementProjectType.FLOORING_CARPETING, label: 'Flooring & Carpeting' },
  { value: BasementProjectType.DRYWALL_INSULATION, label: 'Drywall & Insulation' },
  { value: BasementProjectType.SEPARATE_ENTRANCE, label: 'Separate Entrance Addition' },
  { value: BasementProjectType.OTHER, label: 'Other' },
];

// Yes/No options for separate entrance
export const SEPARATE_ENTRANCE_OPTIONS = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];

// Plan/design options
export const PLAN_DESIGN_OPTIONS = [
  { value: true, label: 'Yes, I already have plans/designs' },
  { value: false, label: 'No, I need design help' },
];

// Project urgency options
export const PROJECT_URGENCY_OPTIONS = [
  { value: ProjectUrgency.ASAP, label: 'I need it done ASAP', icon: '⚡' },
  { value: ProjectUrgency.ONE_TO_THREE_MONTHS, label: 'Planning in the next 1–3 months', icon: '📅' },
];

