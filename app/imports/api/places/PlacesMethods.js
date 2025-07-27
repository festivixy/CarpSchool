import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Places, PlacesSchema } from "./Places.js";

/**
 * Create a new place (user can only create places for themselves)
 */
Meteor.methods({
  async "places.insert"(placeData) {
    check(placeData, Object);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to create places",
      );
    }

    // Validate input
    const { error, value } = PlacesSchema.validate({
      ...placeData,
      createdBy: this.userId,
      createdAt: new Date(),
    });

    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Check if place with same name already exists for this user
    const existingPlace = await Places.findOneAsync({
      text: value.text,
      createdBy: this.userId,
    });

    if (existingPlace) {
      throw new Meteor.Error(
        "duplicate-place",
        "You already have a place with this name",
      );
    }

    return await Places.insertAsync(value); // eslint-disable-line
  },

  async "places.update"(placeId, updateData) {
    check(placeId, String);
    check(updateData, Object);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to update places",
      );
    }

    const place = await Places.findOneAsync(placeId);
    if (!place) {
      throw new Meteor.Error("not-found", "Place not found");
    }

    const currentUser = await Meteor.users.findOneAsync(this.userId);
    const isAdmin =
      currentUser && currentUser.roles && currentUser.roles.includes("admin");

    // Only the creator or admin can update
    if (place.createdBy !== this.userId && !isAdmin) {
      throw new Meteor.Error(
        "access-denied",
        "You can only update places you created",
      );
    }

    // Validate update data
    const allowedFields = ["text", "value"];
    const filteredUpdate = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    });

    if (Object.keys(filteredUpdate).length === 0) {
      throw new Meteor.Error("no-data", "No valid fields to update");
    }

    // Add timestamp
    filteredUpdate.updatedAt = new Date();

    // Validate the update
    const { error } = PlacesSchema.validate({
      ...place,
      ...filteredUpdate,
    });

    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Check for duplicate names (excluding current place)
    if (filteredUpdate.text) {
      const existingPlace = await Places.findOneAsync({
        _id: { $ne: placeId },
        text: filteredUpdate.text,
        createdBy: place.createdBy,
      });

      if (existingPlace) {
        throw new Meteor.Error(
          "duplicate-place",
          "A place with this name already exists",
        );
      }
    }

    await Places.updateAsync(placeId, { $set: filteredUpdate });
    return placeId;
  },

  async "places.remove"(placeId) {
    check(placeId, String);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to delete places",
      );
    }

    const place = await Places.findOneAsync(placeId);
    if (!place) {
      throw new Meteor.Error("not-found", "Place not found");
    }

    const currentUser = await Meteor.users.findOneAsync(this.userId);
    const isAdmin =
      currentUser && currentUser.roles && currentUser.roles.includes("admin");

    // Only the creator or admin can delete
    if (place.createdBy !== this.userId && !isAdmin) {
      throw new Meteor.Error(
        "access-denied",
        "You can only delete places you created",
      );
    }

    await Places.removeAsync(placeId);
    return placeId;
  },
});
