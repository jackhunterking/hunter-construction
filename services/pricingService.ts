import { PodConfiguration, EstimateResult } from '../types';
import { PRICING_CONFIG } from '../constants';

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
