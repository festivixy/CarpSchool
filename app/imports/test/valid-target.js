// Valid target file that exports several things
// Used by other test files to test named import validation

import React from 'react';

export const ValidExport1 = 'test1';
export const ValidExport2 = 'test2';

export function ValidFunction() {
  return 'valid';
}

export class ValidClass {
  constructor() {
    this.value = 'valid';
  }
}

// Default export
export default function ValidTarget() {
  return React.createElement('div', null, 'Valid Target Component');
}

// Re-export from another module
export { Button } from '../ui/components';
