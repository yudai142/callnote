// Jest setup file for React Testing Library
import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods if needed
global.console.error = jest.fn();
global.console.warn = jest.fn();
