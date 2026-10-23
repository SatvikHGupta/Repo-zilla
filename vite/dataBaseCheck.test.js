// Author: Satvik Hemant Gupta
import { describe, it, expect } from 'vitest';
import { checkDataBase } from './dataBaseCheck.js';

describe('checkDataBase', () => {
  it('accepts the stable https origin', () => {
    expect(checkDataBase('https://repozilla-data.pages.dev')).toBeNull();
    expect(checkDataBase('https://data.example.com:8443')).toBeNull();
  });
  it('refuses empty, local, path and trailing-slash values', () => {
    for (const v of ['', undefined, '/local-data', 'http://repozilla-data.pages.dev', 'https://repozilla-data.pages.dev/', 'https://repozilla-data.pages.dev/data']) expect(checkDataBase(v), String(v)).toMatch(/VITE_DATA_BASE/);
  });
  it('refuses a one-snapshot hashed URL unless explicitly allowed', () => {
    expect(checkDataBase('https://34738650.repozilla-data.pages.dev')).toMatch(/one-snapshot/);
    expect(checkDataBase('https://34738650.repozilla-data.pages.dev', { allowPinned: true })).toBeNull();
  });
});
