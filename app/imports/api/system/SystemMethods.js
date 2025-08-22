import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { SystemContent, SystemContentSchema } from "./System";

Meteor.methods({
  /**
   * Update system content (admin or system role only)
   */
  async "system.updateContent"(type, content) {
    check(type, String);
    check(content, String);

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to update system content.");
    }

    // Get current user and check permissions
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.roles) {
      throw new Meteor.Error("access-denied", "You do not have permission to update system content.");
    }

    // Check if user has admin or system role
    const hasPermission = currentUser.roles.includes("admin") || currentUser.roles.includes("system");
    if (!hasPermission) {
      throw new Meteor.Error("access-denied", "You must be an admin or system user to update system content.");
    }

    // Validate type
    if (!["tos", "privacy", "credits"].includes(type)) {
      throw new Meteor.Error("invalid-type", "Content type must be tos, privacy, or credits.");
    }

    // Validate content length
    if (content.length > 50000) {
      throw new Meteor.Error("content-too-long", "Content cannot exceed 50,000 characters.");
    }

    // Create content document
    const contentData = {
      type,
      content,
      lastUpdated: new Date(),
      updatedBy: this.userId,
    };

    // Validate against schema
    const { error } = SystemContentSchema.validate(contentData);
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Check if content already exists for this type
    const existingContent = await SystemContent.findOneAsync({ type });

    if (existingContent) {
      // Update existing content
      const result = await SystemContent.updateAsync(
        { type },
        { $set: contentData }
      );
      return { updated: true, contentId: existingContent._id };
    } else {
      // Create new content
      const contentId = await SystemContent.insertAsync(contentData);
      return { created: true, contentId };
    }
  },

  /**
   * Get system content by type
   */
  async "system.getContent"(type) {
    check(type, String);

    // Validate type
    if (!["tos", "privacy", "credits"].includes(type)) {
      throw new Meteor.Error("invalid-type", "Content type must be tos, privacy, or credits.");
    }

    const content = await SystemContent.findOneAsync({ type });
    return content || null;
  },

  /**
   * Get all system content (admin/system only)
   */
  async "system.getAllContent"() {
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to view all system content.");
    }

    // Get current user and check permissions
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.roles) {
      throw new Meteor.Error("access-denied", "You do not have permission to view all system content.");
    }

    // Check if user has admin or system role
    const hasPermission = currentUser.roles.includes("admin") || currentUser.roles.includes("system");
    if (!hasPermission) {
      throw new Meteor.Error("access-denied", "You must be an admin or system user to view all system content.");
    }

    const allContent = await SystemContent.find({}).fetchAsync();
    return allContent;
  },
});
