import { Accounts } from "meteor/accounts-base";

Accounts.emailTemplates.resetPassword.from = () => "CarpSchool <no-reply@carp.school>";

// Configure other email templates
Accounts.emailTemplates.verifyEmail.from = () => "CarpSchool <no-reply@carp.school>";
Accounts.emailTemplates.enrollAccount.from = () => "CarpSchool <no-reply@carp.school>";

// Email subject lines
Accounts.emailTemplates.resetPassword.subject = () => "Reset Your Password";
Accounts.emailTemplates.verifyEmail.subject = () => "Verify Your Email";
Accounts.emailTemplates.enrollAccount.subject = () => "Complete Your CarpSchool Account Setup";
