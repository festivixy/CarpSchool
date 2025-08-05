// Test file for broken file import references
// These imports should all be flagged as errors by the reference checker

// Broken relative imports
import Component1 from './non-existent-file';
import Component2 from '../missing/component';
import { Helper } from './does-not-exist';

// Broken absolute imports
import Something from '/imports/ui/fake/component';
import { FakeUtil } from '/imports/utils/missing';

// File with wrong extension
import Config from './config.json'; // Should be .js

// Directory that doesn't exist
import { Tool } from '../nonexistent-dir/tool';

// Correct import for comparison (should not be flagged)
import { Places } from '/imports/api/places/Places';

export default function BrokenFileImports() {
  return null;
}
