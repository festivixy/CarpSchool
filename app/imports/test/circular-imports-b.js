// Test file B for circular import detection
// This file imports from A, which imports from B, creating a circular dependency

import { functionA, constantA } from './circular-imports-a';

export function functionB() {
  return constantA + functionA();
}

export const constantB = 'value-b';
