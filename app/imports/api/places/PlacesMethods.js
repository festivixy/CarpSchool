import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Places, PlacesSchema } from "./Places";
import { Rides } from "../ride/Rides";
import { assertProfileApproved } from "../profile/approvalGuard";

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

    // Places feed the ride pickers; a pending or rejected account may not add them.
    await assertProfileApproved(this.userId);

    const currentUser = await Meteor.users.findOneAsync(this.userId);

    // The server owns schoolId: PlacesSchema allows it, so a client could
    // otherwise plant a place into another school's admin list.
    const { schoolId: clientSchoolId, ...clientPlaceData } = placeData;

    // Validate input
    const { error, value } = PlacesSchema.validate({
      ...clientPlaceData,
      // Only set the key when there is a school, so the stored document keeps
      // matching `{ schoolId: ... }` filters without an explicit null/undefined.
      ...(currentUser?.schoolId ? { schoolId: currentUser.schoolId } : {}),
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
    const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");

    // Check if user can manage this place (same school or system admin)
    const canManagePlace = await isSystemAdmin(this.userId) ||
      (await isSchoolAdmin(this.userId) && currentUser.schoolId === place.schoolId);

    // Only the creator or school/system admin can update
    if (place.createdBy !== this.userId && !canManagePlace) {
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
    const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");

    // Check if user can manage this place (same school or system admin)
    const canManagePlace = await isSystemAdmin(this.userId) ||
      (await isSchoolAdmin(this.userId) && currentUser.schoolId === place.schoolId);

    // Only the creator or school/system admin can delete
    if (place.createdBy !== this.userId && !canManagePlace) {
      throw new Meteor.Error(
        "access-denied",
        "You can only delete places you created",
      );
    }

    /* A place that an upcoming ride still starts at, ends at or stops by
     * cannot go: the ride would lose its route. Past rides keep their ids
     * and resolve to nothing, which the readers already tolerate. */
    const inUse = await Rides.findOneAsync(
      {
        date: { $gte: new Date() },
        $or: [{ origin: placeId }, { destination: placeId }, { waypoints: placeId }],
      },
      { fields: { _id: 1 } },
    );
    if (inUse) {
      throw new Meteor.Error(
        "place-in-use",
        "This place is part of an upcoming ride and cannot be deleted",
      );
    }

    await Places.removeAsync(placeId);
    return placeId;
  },

  /**
   * Migration method to fix existing places without createdBy/createdAt fields
   * This should be called by admins to update legacy places
   */
  async "places.fixLegacyPlaces"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in");
    }

    const { isSystemAdmin } = await import("../accounts/RoleUtils");

    if (!await isSystemAdmin(this.userId)) {
      throw new Meteor.Error("access-denied", "System admin access required");
    }

    // Find places without createdBy or createdAt, including null values
    const legacyPlaces = await Places.find({
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
        { createdAt: { $exists: false } },
        { createdAt: null },
      ],
    }).fetchAsync();

    let updatedCount = 0;
    const now = new Date();

    await Promise.all(legacyPlaces.map(async (place) => {
      const updateFields = {};

      if (!place.createdBy) {
        updateFields.createdBy = this.userId; // Assign to current admin
      }

      if (!place.createdAt) {
        updateFields.createdAt = now;
      }

      if (Object.keys(updateFields).length > 0) {
        await Places.updateAsync(place._id, { $set: updateFields });
        updatedCount += 1;
      }
    }));

    return { message: `Updated ${updatedCount} legacy places`, count: updatedCount };
  },

});
