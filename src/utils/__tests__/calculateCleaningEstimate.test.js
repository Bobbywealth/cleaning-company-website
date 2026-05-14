import { describe, it, expect } from 'vitest';
import { calculateCleaningEstimate, formatPrice, getSavingsMessage } from '../calculateCleaningEstimate';
import {
  PROPERTY_BASE_PRICES,
  SERVICE_MULTIPLIERS,
  BATHROOM_ADJUSTMENTS,
  FREQUENCY_DISCOUNTS,
  COUNTY_ADJUSTMENTS,
} from '../pricingConstants';

describe('Pricing Constants', () => {
  describe('PROPERTY_BASE_PRICES', () => {
    it('should have residential property prices', () => {
      expect(PROPERTY_BASE_PRICES['Studio/1 Bedroom']).toBe(120);
      expect(PROPERTY_BASE_PRICES['2 Bedrooms']).toBe(180);
      expect(PROPERTY_BASE_PRICES['3 Bedrooms']).toBe(260);
      expect(PROPERTY_BASE_PRICES['4+ Bedrooms']).toBe(380);
      expect(PROPERTY_BASE_PRICES['Large Home']).toBe(500);
    });

    it('should have commercial property prices', () => {
      expect(PROPERTY_BASE_PRICES['Small Office']).toBe(180);
      expect(PROPERTY_BASE_PRICES['Medium Office']).toBe(450);
      expect(PROPERTY_BASE_PRICES['Large Office']).toBe(850);
    });
  });

  describe('SERVICE_MULTIPLIERS', () => {
    it('should have correct multipliers for each service type', () => {
      expect(SERVICE_MULTIPLIERS['Residential Cleaning']).toBe(1.0);
      expect(SERVICE_MULTIPLIERS['Commercial Cleaning']).toBe(1.15);
      expect(SERVICE_MULTIPLIERS['Deep Cleaning']).toBe(1.6);
      expect(SERVICE_MULTIPLIERS['Move In/Out']).toBe(1.8);
      expect(SERVICE_MULTIPLIERS['Post-Construction']).toBe(2.2);
    });
  });

  describe('BATHROOM_ADJUSTMENTS', () => {
    it('should have correct bathroom adjustments', () => {
      expect(BATHROOM_ADJUSTMENTS['1']).toBe(0);
      expect(BATHROOM_ADJUSTMENTS['1.5']).toBe(20);
      expect(BATHROOM_ADJUSTMENTS['2']).toBe(40);
      expect(BATHROOM_ADJUSTMENTS['3']).toBe(90);
      expect(BATHROOM_ADJUSTMENTS['4+']).toBe(140);
    });
  });

  describe('FREQUENCY_DISCOUNTS', () => {
    it('should have correct frequency discounts', () => {
      expect(FREQUENCY_DISCOUNTS['One-time']).toBe(0);
      expect(FREQUENCY_DISCOUNTS['Weekly']).toBe(0.15);
      expect(FREQUENCY_DISCOUNTS['Bi-weekly']).toBe(0.10);
      expect(FREQUENCY_DISCOUNTS['Monthly']).toBe(0.05);
    });
  });

  describe('COUNTY_ADJUSTMENTS', () => {
    it('should have correct county adjustments', () => {
      expect(COUNTY_ADJUSTMENTS['Union County']).toBe(0);
      expect(COUNTY_ADJUSTMENTS['Essex County']).toBe(10);
      expect(COUNTY_ADJUSTMENTS['Hudson County']).toBe(25);
      expect(COUNTY_ADJUSTMENTS['Bergen County']).toBe(20);
    });
  });
});

describe('calculateCleaningEstimate', () => {
  describe('Basic Residential Calculations', () => {
    it('should calculate basic 2 bedroom residential cleaning', () => {
      const result = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      expect(result.lowEstimate).toBeGreaterThanOrEqual(100);
      expect(result.highEstimate).toBeGreaterThanOrEqual(result.lowEstimate);
      expect(result.basePrice).toBe(180);
      expect(result.serviceMultiplier).toBe(1.0);
    });

    it('should apply deep cleaning multiplier', () => {
      const result = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Deep Cleaning',
        bathrooms: '2',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      expect(result.serviceMultiplier).toBe(1.6);
      expect(result.lowEstimate).toBeGreaterThan(180);
    });

    it('should apply bathroom adjustments', () => {
      const result1bath = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      const result3bath = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '3',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      expect(result3bath.bathroomAdjustment).toBeGreaterThan(result1bath.bathroomAdjustment);
      expect(result3bath.bathroomAdjustment).toBe(90);
    });
  });

  describe('Frequency Discounts', () => {
    it('should apply 15% discount for weekly service', () => {
      const oneTime = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      const weekly = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'Weekly',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      expect(weekly.frequencyDiscountRate).toBe(0.15);
      expect(weekly.lowEstimate).toBeLessThan(oneTime.lowEstimate);
    });

    it('should apply 10% discount for bi-weekly service', () => {
      const result = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'Bi-weekly',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      expect(result.frequencyDiscountRate).toBe(0.10);
    });

    it('should apply 5% discount for monthly service', () => {
      const result = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'Monthly',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      expect(result.frequencyDiscountRate).toBe(0.05);
    });
  });

  describe('Location Adjustments', () => {
    it('should apply county adjustments', () => {
      const unionCounty = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      const hudsonCounty = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Hudson County',
        cityArea: 'Other',
        addOns: [],
      });

      expect(hudsonCounty.countyAdjustment).toBe(25);
      expect(unionCounty.countyAdjustment).toBe(0);
      expect(hudsonCounty.lowEstimate).toBeGreaterThan(unionCounty.lowEstimate);
    });

    it('should apply city surcharges for Hoboken', () => {
      const other = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      const hoboken = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Hoboken',
        addOns: [],
      });

      expect(hoboken.cityAreaSurcharge).toBe(35);
      expect(other.cityAreaSurcharge).toBe(0);
    });
  });

  describe('Add-ons', () => {
    it('should calculate add-on prices', () => {
      const noAddOns = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      const withAddOns = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: ['insideFridge', 'insideOven'],
      });

      expect(withAddOns.addOnsTotal).toBe(90); // 40 + 50
      expect(withAddOns.lowEstimate).toBeGreaterThan(noAddOns.lowEstimate);
    });
  });

  describe('Warning Notes', () => {
    it('should add note for large homes', () => {
      const result = calculateCleaningEstimate({
        propertySize: 'Large Home',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      expect(result.notes).toContain('Large homes may require a walkthrough or photo review before final pricing.');
    });

    it('should add note for post-construction', () => {
      const result = calculateCleaningEstimate({
        propertySize: '3 Bedrooms',
        serviceType: 'Post-Construction',
        bathrooms: '2',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      expect(result.notes).toContain('Post-construction cleaning may require a custom quote depending on dust, debris, and cleanup scope.');
    });

    it('should add parking note for Hoboken/Jersey City', () => {
      const result = calculateCleaningEstimate({
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'One-time',
        county: 'Hudson County',
        cityArea: 'Hoboken',
        addOns: [],
      });

      expect(result.notes).toContain('Parking, building access, elevators, and travel time may affect final pricing.');
    });
  });

  describe('Price Range Calculation', () => {
    it('should enforce minimum price of $100', () => {
      const result = calculateCleaningEstimate({
        propertySize: 'Studio/1 Bedroom',
        serviceType: 'Residential Cleaning',
        bathrooms: '1',
        frequency: 'Weekly',
        county: 'Union County',
        cityArea: 'Other',
        addOns: [],
      });

      expect(result.lowEstimate).toBeGreaterThanOrEqual(100);
    });

    it('should calculate price range (90% to 115%)', () => {
      const result = calculateCleaningEstimate({
        propertySize: '3 Bedrooms',
        serviceType: 'Deep Cleaning',
        bathrooms: '2',
        frequency: 'One-time',
        county: 'Union County',
        cityArea: 'Other',
        addOns: ['petHair'],
      });

      expect(result.highEstimate).toBeGreaterThan(result.lowEstimate);
    });
  });
});

describe('formatPrice', () => {
  it('should format price with dollar sign', () => {
    expect(formatPrice(100)).toBe('$100');
    expect(formatPrice(250)).toBe('$250');
  });

  it('should format large numbers with commas', () => {
    expect(formatPrice(1000)).toBe('$1,000');
  });
});

describe('getSavingsMessage', () => {
  it('should return savings message for weekly service', () => {
    const message = getSavingsMessage('Weekly', 25);
    expect(message).toContain('15%');
    expect(message).toContain('recurring discount');
    expect(message).toContain('$25.00');
  });

  it('should return null for one-time service', () => {
    const message = getSavingsMessage('One-time', 0);
    expect(message).toBeNull();
  });
});
