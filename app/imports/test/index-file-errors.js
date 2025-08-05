// Test file for index file import issues
// Tests directory imports that should resolve to index.js

// Valid directory import (should resolve to ../ui/components/index.js)
import { Button, MapView } from '../ui/components';

// Invalid directory import - directory doesn't exist
import { Something } from '../fake-directory';

// Invalid named imports from valid directory
import { FakeExport, NonExistent } from '../ui/components';

// Import from directory that exists but has no index.js
import { Tool } from '../api'; // api directory exists but no index.js

export default function IndexFileErrors() {
  return null;
}
