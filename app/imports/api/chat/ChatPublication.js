import { Meteor } from "meteor/meteor";
import { Chats } from "./Chat";

/** Publish chats for the current user */
Meteor.publish("chats", function publishChats() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = Meteor.users.findOne(this.userId);
  if (!currentUser || !currentUser.username) {
    return this.ready();
  }

  // Return chats where user is a participant
  return Chats.find({ Participants: currentUser.username });
});

/** Publish all chats for admin users */
Meteor.publish("chats.admin", function publishAllChats() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = Meteor.users.findOne(this.userId);
  if (
    !currentUser ||
    !currentUser.roles ||
    !currentUser.roles.includes("admin")
  ) {
    return this.ready();
  }

  return Chats.find({});
});
