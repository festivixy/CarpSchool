import { Accounts } from "meteor/accounts-base";

Accounts.emailTemplates.resetPassword.from = () => "CarpSchool Password Reset <contact@carp.school>";
