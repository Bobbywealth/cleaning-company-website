// ==========================================
// PRICING CONSTANTS FOR 360 CLEANING CO.
// ==========================================

// Property Base Prices
export const PROPERTY_BASE_PRICES = {
  // Residential
  'Studio/1 Bedroom': 120,
  '2 Bedrooms': 180,
  '3 Bedrooms': 260,
  '4+ Bedrooms': 380,
  'Large Home': 500,
  // Commercial
  'Small Office': 180,
  'Medium Office': 450,
  'Large Office': 850,
};

// Service Type Multipliers
export const SERVICE_MULTIPLIERS = {
  'Residential Cleaning': 1.0,
  'Commercial Cleaning': 1.15,
  'Deep Cleaning': 1.6,
  'Move In/Out': 1.8,
  'Post-Construction': 2.2,
};

// Bathroom Adjustments
export const BATHROOM_ADJUSTMENTS = {
  '1': 0,
  '1.5': 20,
  '2': 40,
  '2.5': 60,
  '3': 90,
  '4+': 140,
};

// Frequency Discounts (as decimal, 0.15 = 15% off)
export const FREQUENCY_DISCOUNTS = {
  'One-time': 0,
  'Weekly': 0.15,
  'Bi-weekly': 0.10,
  'Monthly': 0.05,
};

// Add-on Prices
export const ADD_ON_PRICES = {
  'Inside Fridge': 40,
  'Inside Oven': 50,
  'Pet Hair': 40,
  'Heavy Dirt/Buildup': 100,
  'Interior Windows': 100,
  'Laundry': 35,
  'Cabinet Interior': 60,
};

// County Location Adjustments
export const COUNTY_ADJUSTMENTS = {
  'Essex County': 10,
  'Union County': 0,
  'Hudson County': 25,
  'Bergen County': 20,
};

// City/Area Surcharges
export const CITY_AREA_SURCHARGES = {
  'Hoboken': 35,
  'Jersey City': 35,
  'Newark': 15,
  'Montclair': 20,
  'Bergen County Luxury Home Area': 50,
  'Other': 0,
};

// Available Add-ons List
export const AVAILABLE_ADD_ONS = [
  { id: 'insideFridge', name: 'Inside Fridge', price: 40 },
  { id: 'insideOven', name: 'Inside Oven', price: 50 },
  { id: 'petHair', name: 'Pet Hair', price: 40 },
  { id: 'heavyDirt', name: 'Heavy Dirt/Buildup', price: 100 },
  { id: 'interiorWindows', name: 'Interior Windows', price: 100 },
  { id: 'laundry', name: 'Laundry', price: 35 },
  { id: 'cabinetInterior', name: 'Cabinet Interior', price: 60 },
];

// Counties List
export const COUNTIES = [
  'Essex County',
  'Union County',
  'Hudson County',
  'Bergen County',
];

// City/Area List
export const CITY_AREAS = [
  'Hoboken',
  'Jersey City',
  'Newark',
  'Montclair',
  'Bergen County Luxury Home Area',
  'Other',
];
