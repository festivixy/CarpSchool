import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { SystemContent } from "./System";

/** Publish specific system content by type (public access) */
Meteor.publish("systemContent.byType", function publishSystemContentByType(type) {
  check(type, String);

  // Validate type
  if (!["tos", "privacy", "credits"].includes(type)) {
    return this.ready();
  }

  return SystemContent.find({ type }, {
    fields: {
      type: 1,
      content: 1,
      lastUpdated: 1,
    },
  });
});

/** Publish all system content for admin/system users */
Meteor.publish("systemContent.admin", async function publishAllSystemContent() {
  if (!this.userId) {
    return this.ready();
  }

  // Get current user and check permissions
  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.roles) {
    return this.ready();
  }

  // Check if user has system role
  const hasPermission = currentUser.roles.includes("system");
  if (!hasPermission) {
    return this.ready();
  }

  return SystemContent.find({}, {
    fields: {
      type: 1,
      content: 1,
      lastUpdated: 1,
      updatedBy: 1,
    },
  });
});
