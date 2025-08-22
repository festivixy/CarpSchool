import { Accounts } from "meteor/accounts-base";

Accounts.emailTemplates.resetPassword.from = () => "CarpSchool Password Reset <no-reply@carp.school>";

// Configure other email templates
Accounts.emailTemplates.verifyEmail.from = () => "CarpSchool Email Verification <no-reply@carp.school>";
Accounts.emailTemplates.enrollAccount.from = () => "CarpSchool Account Setup <no-reply@carp.school>";

// Email subject lines
Accounts.emailTemplates.resetPassword.subject = () => "Reset Your CarpSchool Password";
Accounts.emailTemplates.verifyEmail.subject = () => "Verify Your CarpSchool Email";
Accounts.emailTemplates.enrollAccount.subject = () => "Complete Your CarpSchool Account Setup";
