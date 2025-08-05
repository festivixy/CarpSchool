// Test file for broken named import references
// These named imports should be flagged as errors

import React from 'react';

// Import from a file that exists but doesn't export these names
import { NonExistentComponent, FakeButton } from '../ui/components/Button';

// Import from index.js with wrong names
import { WrongName, AnotherWrong } from '../ui/components';

// Import from a real file with mixed valid/invalid names
import { MapView, FakeMapComponent } from '../ui/components/MapView';

// Valid imports for comparison (should not be flagged)
import { Button, TextInput } from '../ui/components';
import { MapContainer } from '../ui/styles/MapView';

export default function BrokenNamedImports() {
  return null;
}
