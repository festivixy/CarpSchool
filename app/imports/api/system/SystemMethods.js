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

    // Check if user has system role
    const hasPermission = currentUser.roles.includes("system");
    if (!hasPermission) {
      throw new Meteor.Error("access-denied", "You must have system role to update system content.");
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

    // Check if user has system role
    const hasPermission = currentUser.roles.includes("system");
    if (!hasPermission) {
      throw new Meteor.Error("access-denied", "You must have system role to view all system content.");
    }

    const allContent = await SystemContent.find({}).fetchAsync();
    return allContent;
  },

  /**
   * Initialize default system content (system role only)
   */
  async "system.initializeDefaults"() {
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to initialize system content.");
    }

    // Get current user and check permissions
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.roles) {
      throw new Meteor.Error("access-denied", "You do not have permission to initialize system content.");
    }

    // Check if user has system role
    const hasPermission = currentUser.roles.includes("system");
    if (!hasPermission) {
      throw new Meteor.Error("access-denied", "You must have system role to initialize system content.");
    }

    const defaultContents = {
      tos: "# **DEV BUILD**",
      privacy: "# **DEV BUILD**",
      credits: `## Development Team

This application was built with dedication and care by our development team.

## Technologies Used

### Frontend
- [React](https://react.dev/)

### Backend
- [Meteor](https://www.meteor.com/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)

## Special Thanks

- **Beef Ramen** 🍜 - For powering the ref checker tool and countless debugging sessions
- **Coffee** ☕ - For fueling late-night coding sessions and morning deployments

## Map Data

[© OpenMapTiles](https://www.openmaptiles.org/) [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

## Contact

For questions about this application or to report issues, please contact lz at kobosh@kobosh.com.

---

*Built with ❤️ for the student community by CarpSchool team*`,
    };

    const results = [];

    for (const [type, content] of Object.entries(defaultContents)) {
      // Check if content already exists
      const existingContent = await SystemContent.findOneAsync({ type });

      if (!existingContent) {
        // Create default content
        const contentData = {
          type,
          content,
          lastUpdated: new Date(),
          updatedBy: this.userId,
        };

        // Validate against schema
        const { error } = SystemContentSchema.validate(contentData);
        if (error) {
          throw new Meteor.Error("validation-error", `${type}: ${error.details[0].message}`);
        }

        const contentId = await SystemContent.insertAsync(contentData);
        results.push({ type, contentId, created: true });
      } else {
        results.push({ type, contentId: existingContent._id, created: false });
      }
    }

    return results;
  },
});
