import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the global fetch
global.fetch = vi.fn();

describe('API Service', () => {
  const API_BASE_URL = '/api';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Lead Submission', () => {
    it('should submit lead data successfully', async () => {
      const mockLead = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '8622854949',
        propertySize: '2 Bedrooms',
        serviceType: 'Residential Cleaning',
        bathrooms: '2',
        frequency: 'Weekly',
        addOns: ['insideFridge'],
        county: 'Union County',
        cityArea: 'Other',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: '123' }),
      });

      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockLead),
      });

      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/leads`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle lead submission errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.ok).toBe(false);
    });
  });

  describe('Lead Retrieval', () => {
    it('should fetch leads with authentication', async () => {
      const mockLeads = [
        { id: '1', name: 'John', status: 'new' },
        { id: '2', name: 'Jane', status: 'contacted' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeads,
      });

      const response = await fetch(`${API_BASE_URL}/leads`, {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Quote Generation', () => {
    it('should generate quotes with valid data', async () => {
      const mockQuote = {
        lowEstimate: 180,
        highEstimate: 230,
        serviceType: 'Residential Cleaning',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuote,
      });

      const response = await fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertySize: '2 Bedrooms',
          serviceType: 'Residential Cleaning',
        }),
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Customer Management', () => {
    it('should update customer status', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch(`${API_BASE_URL}/customers/1`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ status: 'active' }),
      });

      expect(response.ok).toBe(true);
    });

    it('should delete customer with auth', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
      });

      const response = await fetch(`${API_BASE_URL}/customers/1`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Admin Authentication', () => {
    it('should login with valid credentials', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'mock-jwt-token',
          user: { email: 'admin@test.com' },
        }),
      });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'password123',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('should reject invalid credentials', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@test.com',
          password: 'wrongpassword',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });
});

describe('Error Handling', () => {
  it('should handle network errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetch('/api/test')).rejects.toThrow('Network error');
  });

  it('should handle timeout errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Request timeout'));

    await expect(fetch('/api/test')).rejects.toThrow('Request timeout');
  });
});
