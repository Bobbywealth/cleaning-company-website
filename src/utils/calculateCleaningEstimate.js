import {
  PROPERTY_BASE_PRICES,
  SERVICE_MULTIPLIERS,
  BATHROOM_ADJUSTMENTS,
  FREQUENCY_DISCOUNTS,
  ADD_ON_PRICES,
  COUNTY_ADJUSTMENTS,
  CITY_AREA_SURCHARGES,
} from './pricingConstants';

/**
 * Calculate cleaning estimate based on form data
 * @param {Object} formData - Form data containing:
 *   - propertySize: string
 *   - serviceType: string
 *   - bathrooms: string
 *   - frequency: string
 *   - addOns: string[] (array of add-on IDs)
 *   - county: string
 *   - cityArea: string
 * @returns {Object} Estimate breakdown with low/high prices and notes
 */
export const calculateCleaningEstimate = (formData) => {
  const {
    propertySize,
    serviceType,
    bathrooms,
    frequency,
    addOns = [],
    county,
    cityArea,
  } = formData;

  // Default values
  const defaultCounty = county || 'Union County';
  const defaultCityArea = cityArea || 'Other';

  // 1. Get base price from property size
  const basePrice = PROPERTY_BASE_PRICES[propertySize] || 180;

  // 2. Apply service type multiplier
  const serviceMultiplier = SERVICE_MULTIPLIERS[serviceType] || 1.0;
  const serviceAdjustedPrice = basePrice * serviceMultiplier;

  // 3. Get bathroom adjustment
  const bathroomAdjustment = BATHROOM_ADJUSTMENTS[bathrooms] || 0;

  // 4. Calculate add-ons total
  let addOnsTotal = 0;
  const selectedAddOns = [];
  
  if (addOns && addOns.length > 0) {
    addOns.forEach(addOnId => {
      const addOnKey = Object.keys(ADD_ON_PRICES).find(
        key => key.toLowerCase().replace(/\s+/g, '') === addOnId.toLowerCase().replace(/\s+/g, '')
      ) || addOnId;
      
      if (ADD_ON_PRICES[addOnKey]) {
        addOnsTotal += ADD_ON_PRICES[addOnKey];
        selectedAddOns.push(addOnKey);
      }
    });
  }

  // 5. Get location adjustments
  const countyAdjustment = COUNTY_ADJUSTMENTS[defaultCounty] || 0;
  const cityAreaSurcharge = CITY_AREA_SURCHARGES[defaultCityArea] || 0;
  const locationAdjustment = countyAdjustment + cityAreaSurcharge;

  // 6. Calculate subtotal before discount
  const subtotal = serviceAdjustedPrice + bathroomAdjustment + addOnsTotal + locationAdjustment;

  // 7. Apply frequency discount
  const frequencyDiscountRate = FREQUENCY_DISCOUNTS[frequency] || 0;
  const discountAmount = subtotal * frequencyDiscountRate;
  const discountedPrice = subtotal - discountAmount;

  // 8. Calculate price range (90% to 115%)
  let lowEstimate = discountedPrice * 0.90;
  let highEstimate = discountedPrice * 1.15;

  // 9. Round to nearest $5
  const roundedLow = Math.round(lowEstimate / 5) * 5;
  const roundedHigh = Math.round(highEstimate / 5) * 5;

  // 10. Enforce minimum $100
  const finalLow = Math.max(roundedLow, 100);
  const finalHigh = Math.max(roundedHigh, finalLow);

  // Generate warning notes based on conditions
  const notes = [];

  if (propertySize === 'Large Home') {
    notes.push('Large homes may require a walkthrough or photo review before final pricing.');
  }

  if (propertySize === 'Large Office') {
    notes.push('Large offices may require a custom commercial quote based on square footage, frequency, and cleaning scope.');
  }

  if (serviceType === 'Post-Construction') {
    notes.push('Post-construction cleaning may require a custom quote depending on dust, debris, and cleanup scope.');
  }

  if (addOns && addOns.includes('Heavy Dirt/Buildup')) {
    notes.push('Final pricing may increase depending on buildup level.');
  }

  if (county === 'Hudson County' || cityArea === 'Hoboken' || cityArea === 'Jersey City') {
    notes.push('Parking, building access, elevators, and travel time may affect final pricing.');
  }

  // Return breakdown object
  return {
    lowEstimate: finalLow,
    highEstimate: finalHigh,
    basePrice,
    serviceMultiplier,
    serviceAdjustedPrice,
    bathroomAdjustment,
    addOnsTotal,
    countyAdjustment,
    cityAreaSurcharge,
    locationAdjustment,
    frequencyDiscountRate,
    discountAmount,
    finalEstimatedPrice: discountedPrice,
    notes,
    selectedAddOns,
    selectedCounty: defaultCounty,
    selectedCityArea: defaultCityArea,
  };
};

/**
 * Format price for display
 * @param {number} price
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return `$${price.toLocaleString()}`;
};

/**
 * Get savings message if frequency discount applies
 * @param {string} frequency
 * @param {number} discountAmount
 * @returns {string|null}
 */
export const getSavingsMessage = (frequency, discountAmount) => {
  if (FREQUENCY_DISCOUNTS[frequency] > 0 && discountAmount > 0) {
    const percentage = Math.round(FREQUENCY_DISCOUNTS[frequency] * 100);
    return `You selected ${frequency.toLowerCase()} service and received a ${percentage}% recurring discount ($${discountAmount.toFixed(2)} savings).`;
  }
  return null;
};
