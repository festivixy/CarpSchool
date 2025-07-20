import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

Accounts.emailTemplates.resetPassword.from = () => "Carpool Password Reset <no-reply@carpool.com>";
