import { Meteor } from "meteor/meteor";
import { Profiles } from "../../api/profile/Profile";
import { Rides } from "../../api/ride/Rides";
import { Images } from "../../api/images/Images";
import { Chats } from "../../api/chat/Chat";

Meteor.publish("Profiles", async function publish() {
  if (this.userId) {
    const user = await Meteor.users.findOneAsync(this.userId);
    const username = user._id;
    return Profiles.find({ Owner: username });
  }
  return this.ready();
});

/** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */
Meteor.publish("ProfilesAdmin", async function publish() {
  if (this.userId) {
    // Check role assignments directly from the database
    const user = await Meteor.users.findOneAsync(this.userId);
    if (user && user.roles && user.roles.includes("admin")) {
      return Profiles.find();
    }
  }
  return this.ready();
});

/** This subscription publishes all rides regardless of user. */
Meteor.publish("Rides", function publish() {
  if (this.userId) {
    return Rides.find();
  }
  return this.ready();
});

/** Publish user roles for the current user */
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.users.find(this.userId, { fields: { roles: 1 } });
  }
  return this.ready();
});

/** Publish all users for admin management */
Meteor.publish("AllUsers", async function () {
  if (this.userId) {
    const user = await Meteor.users.findOneAsync(this.userId);
    if (user && user.roles && user.roles.includes("admin")) {
      return Meteor.users.find(
        {},
        {
          fields: {
            username: 1,
            emails: 1,
            profile: 1,
            roles: 1,
            createdAt: 1,
          },
        },
      );
    }
  }
  return this.ready();
});

/** This subscription publishes image metadata (without image data) for admin users */
Meteor.publish("ImagesMetadata", async function () {
  if (this.userId) {
    const user = await Meteor.users.findOneAsync(this.userId);
    if (user && user.roles && user.roles.includes("admin")) {
      return Images.find(
        {},
        {
          fields: {
            uuid: 1,
            sha256Hash: 1,
            fileName: 1,
            mimeType: 1,
            fileSize: 1,
            uploadedAt: 1,
            uploadedBy: 1,
            // Exclude imageData for performance
          },
        },
      );
    }
  }
  return this.ready();
});

/** Publish chats for the current user */
Meteor.publish("chats", async function publishChats() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.username) {
    return this.ready();
  }

  // Return chats where user is a participant
  return Chats.find({ Participants: currentUser.username });
});

/** Publish all chats for admin users */
Meteor.publish("chats.admin", async function publishAllChats() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (
    !currentUser ||
    !currentUser.roles ||
    !currentUser.roles.includes("admin")
  ) {
    return this.ready();
  }

  return Chats.find({});
});
