// Test file with a mix of valid and invalid imports
// Tests the checker's ability to distinguish between them

import React from 'react';
import PropTypes from 'prop-types';

// Valid imports (should not be flagged)
import { Button, TextInput } from '../ui/components';
import { ValidExport1, ValidFunction } from './valid-target';
import ValidTarget from './valid-target';

// Invalid file imports (should be flagged)
import BrokenComponent from './this-file-does-not-exist';
import { Something } from '../fake/path';

// Invalid named imports from valid files (should be flagged)
import { NonExistentExport, AnotherFake } from './valid-target';
import { FakeComponent } from '../ui/components';

// Valid external packages (should not be flagged)
import { withRouter } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

// Invalid external packages (should be flagged)
import { fakeLib } from 'fake-library';
import badPackage from 'this-package-does-not-exist';

function MixedErrors({ children }) {
  return React.createElement('div', {
    className: 'mixed-errors-test'
  }, children);
}

MixedErrors.propTypes = {
  children: PropTypes.node
};

export default MixedErrors;
