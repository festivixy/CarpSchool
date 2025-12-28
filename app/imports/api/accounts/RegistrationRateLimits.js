import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

// Only run on server
if (Meteor.isServer) {
  // 1. Definition for Registration
  const registrationRule = {
    userId: null, // Allow anonymous
    clientAddress: null, // Limit by IP
    type: 'method',
    name: 'accounts.registerStudent',
  };

  // Limit: 5 attempts per hour per IP
  DDPRateLimiter.addRule(registrationRule, 5, 60 * 60 * 1000);

  // 2. Definition for Domain Checks
  const domainCheckRule = {
    userId: null,
    clientAddress: null,
    type: 'method',
    name: 'schools.checkDomain',
  };

  // Limit: 20 checks per minute per IP (allow for typo correction)
  DDPRateLimiter.addRule(domainCheckRule, 20, 60 * 1000);
}
