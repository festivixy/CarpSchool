// Test file A for circular import detection
// This file imports from B, which imports from A, creating a circular dependency

import { functionB } from './circular-imports-b';

export function functionA() {
  return functionB();
}

export const constantA = 'value-a';
