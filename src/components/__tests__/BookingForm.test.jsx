import { describe, it, expect } from 'vitest';

// Simple validation tests for form inputs
describe('Form Validation', () => {
  describe('Email Validation', () => {
    const isValidEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    it('should accept valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('cleaning@360cleaningco.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    const isValidPhone = (phone) => {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.length === 10 || cleaned.length === 11;
    };

    it('should accept valid phone numbers', () => {
      expect(isValidPhone('8622854949')).toBe(true);
      expect(isValidPhone('(862) 285-4949')).toBe(true);
      expect(isValidPhone('862-285-4949')).toBe(true);
      expect(isValidPhone('+1 862 285 4949')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('123456789')).toBe(false);
    });
  });

  describe('Name Validation', () => {
    const isValidName = (name) => {
      return name && name.trim().length >= 2;
    };

    it('should accept valid names', () => {
      expect(isValidName('John')).toBe(true);
      expect(isValidName('Mary Johnson')).toBe(true);
      expect(isValidName('Bobby')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(isValidName('')).toBeFalsy();
      expect(isValidName(' ')).toBeFalsy();
      expect(isValidName('J')).toBeFalsy();
    });
  });

  describe('Required Field Validation', () => {
    const isRequired = (value) => {
      return value && value.trim().length > 0;
    };

    it('should validate required fields', () => {
      expect(isRequired('Some value')).toBe(true);
      expect(isRequired('')).toBeFalsy();
      expect(isRequired('   ')).toBeFalsy();
      expect(isRequired(null)).toBeFalsy();
      expect(isRequired(undefined)).toBeFalsy();
    });
  });
});

describe('Service Selection', () => {
  const validServiceTypes = [
    'Residential Cleaning',
    'Commercial Cleaning', 
    'Deep Cleaning',
    'Move In/Out',
    'Post-Construction'
  ];

  it('should have all required service types', () => {
    expect(validServiceTypes).toContain('Residential Cleaning');
    expect(validServiceTypes).toContain('Commercial Cleaning');
    expect(validServiceTypes).toContain('Deep Cleaning');
  });
});

describe('Property Size Selection', () => {
  const residentialSizes = [
    'Studio/1 Bedroom',
    '2 Bedrooms',
    '3 Bedrooms',
    '4+ Bedrooms',
    'Large Home'
  ];

  const commercialSizes = [
    'Small Office',
    'Medium Office',
    'Large Office'
  ];

  it('should have residential property sizes', () => {
    expect(residentialSizes.length).toBe(5);
    expect(residentialSizes).toContain('Studio/1 Bedroom');
    expect(residentialSizes).toContain('Large Home');
  });

  it('should have commercial property sizes', () => {
    expect(commercialSizes.length).toBe(3);
    expect(commercialSizes).toContain('Small Office');
    expect(commercialSizes).toContain('Large Office');
  });
});

describe('County Selection', () => {
  const counties = [
    'Essex County',
    'Union County',
    'Hudson County',
    'Bergen County'
  ];

  it('should have all four NJ counties', () => {
    expect(counties.length).toBe(4);
    expect(counties).toContain('Essex County');
    expect(counties).toContain('Union County');
    expect(counties).toContain('Hudson County');
    expect(counties).toContain('Bergen County');
  });
});

describe('Frequency Selection', () => {
  const frequencies = ['One-time', 'Weekly', 'Bi-weekly', 'Monthly'];

  it('should have all frequency options', () => {
    expect(frequencies.length).toBe(4);
    expect(frequencies).toContain('One-time');
    expect(frequencies).toContain('Weekly');
    expect(frequencies).toContain('Bi-weekly');
    expect(frequencies).toContain('Monthly');
  });
});
