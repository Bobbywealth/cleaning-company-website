import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window functions
window.trackQuoteClick = vi.fn();
window.trackMetaQuoteClick = vi.fn();
window.trackPhoneClick = vi.fn();
window.trackMetaPhoneClick = vi.fn();
window.trackQuoteSubmit = vi.fn();
window.trackMetaLead = vi.fn();
window.trackQuoteEstimate = vi.fn();
