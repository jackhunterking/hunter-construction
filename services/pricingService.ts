import {
  // Legacy types
  PodConfiguration,
  EstimateResult,
  // New construction types
  ProjectConfiguration,
} from '../types';
import { PRICING_CONFIG, CONSTRUCTION_PRICING } from '../constants';

// ===== CONSTRUCTION PRICING =====

export const calculateConstructionEstimate = (
  config: ProjectConfiguration
): Omit<EstimateResult, 'summary'> => {
  // Start with base range for project type
  if (!config.projectType) {
    return {
      low: 50000,
      high: 200000,
      currency: 'CAD',
    };
  }

  const baseRange = CONSTRUCTION_PRICING.baseRanges[config.projectType];
  let low = baseRange.low;
  let high = baseRange.high;

  // Apply property type modifier
  if (config.details.propertyType && CONSTRUCTION_PRICING.modifiers.propertyType) {
    const modifier = CONSTRUCTION_PRICING.modifiers.propertyType[config.details.propertyType];
    low *= modifier;
    high *= modifier;
  }

  // Apply lot size modifier
  if (config.details.lotSize && CONSTRUCTION_PRICING.modifiers.lotSize) {
    const modifier = CONSTRUCTION_PRICING.modifiers.lotSize[config.details.lotSize];
    low *= modifier;
    high *= modifier;
  }

  // Add bedroom costs
  if (config.details.bedroomsNeeded && CONSTRUCTION_PRICING.modifiers.bedroomsMultiplier) {
    const additionalBedrooms = Math.max(0, config.details.bedroomsNeeded - 1); // First bedroom included
    const bedroomCost = additionalBedrooms * CONSTRUCTION_PRICING.modifiers.bedroomsMultiplier;
    low += bedroomCost;
    high += bedroomCost;
  }

  // Add bathroom costs
  if (config.details.bathroomsNeeded && CONSTRUCTION_PRICING.modifiers.bathroomsMultiplier) {
    const additionalBathrooms = Math.max(0, config.details.bathroomsNeeded - 1); // First bathroom included
    const bathroomCost = additionalBathrooms * CONSTRUCTION_PRICING.modifiers.bathroomsMultiplier;
    low += bathroomCost;
    high += bathroomCost;
  }

  // Add complexity for multiple units
  if (config.details.desiredUnits > config.details.existingUnits) {
    const additionalUnits = config.details.desiredUnits - config.details.existingUnits;
    // Each additional unit adds complexity/cost
    const unitMultiplier = 1 + (additionalUnits - 1) * 0.15; // 15% more per unit beyond first
    low *= unitMultiplier;
    high *= unitMultiplier;
  }

  // Round to nearest thousand for cleaner display
  low = Math.round(low / 1000) * 1000;
  high = Math.round(high / 1000) * 1000;

  return {
    low,
    high,
    currency: 'CAD',
  };
};

// ===== LEGACY POD PRICING (for backward compatibility) =====

export const calculateEstimate = (config: PodConfiguration): Omit<EstimateResult, 'summary'> => {
  let low = PRICING_CONFIG.baseLow;
  let high = PRICING_CONFIG.baseHigh;

  // Flooring
  if (config.flooring) {
    const floorCost = PRICING_CONFIG.flooringUpcharges[config.flooring];
    low += floorCost;
    high += floorCost;
  }

  // HVAC
  if (config.hvac) {
    const hvacCost = PRICING_CONFIG.hvacUpcharges[config.hvac];
    low += hvacCost;
    high += hvacCost;
  }

  // Color
  if (config.exteriorColor) {
    const colorCost = PRICING_CONFIG.colorUpcharges[config.exteriorColor];
    low += colorCost;
    high += colorCost;
  }

  return {
    low,
    high,
    currency: 'CAD',
  };
};
