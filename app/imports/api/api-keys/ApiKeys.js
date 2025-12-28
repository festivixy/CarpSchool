import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Random } from "meteor/random";

export const ApiKeys = new Mongo.Collection("ApiKeys");

// Ensure index for fast lookups
if (Meteor.isServer) {
  ApiKeys.createIndex({ key: 1 }, { unique: true });
  ApiKeys.createIndex({ userId: 1 });
}

Meteor.methods({
  async "apiKeys.generate"() {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-authorized");
    }

    const key = `carp_${Random.secret(32)}`;
    
    await ApiKeys.insertAsync({
      userId,
      key,
      createdAt: new Date(),
    });

    return key;
  },

  async "apiKeys.revoke"(keyId) {
    check(keyId, String);
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-authorized");
    }

    await ApiKeys.removeAsync({ _id: keyId, userId });
  },

  async "apiKeys.list"() {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-authorized");
    }

    return ApiKeys.find({ userId }).fetchAsync();
  }
});
