// Test file for missing package dependencies
// These package imports should be flagged as errors

import React from 'react'; // Valid - should not be flagged

// Missing packages that should be flagged
import { someFunction } from 'non-existent-package';
import lodash from 'lodash-missing';
import { createStore } from 'redux-fake';
import moment from 'moment-fake';

// Scoped packages that don't exist
import { parser } from '@fake/parser';
import babel from '@babel/fake-preset';

// Built-in Node.js modules (should not be flagged)
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Meteor packages (should not be flagged)
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

export default function MissingPackages() {
  return null;
}
