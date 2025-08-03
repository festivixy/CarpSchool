import { Accounts } from "meteor/accounts-base";

Accounts.emailTemplates.resetPassword.from = () => "carp.school Password Reset <contact@carp.school>";
