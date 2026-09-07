import { expect } from "chai";
import { validateUserCanJoinRide } from "../../imports/api/ride/RideValidation";

describe("RideValidation.validateUserCanJoinRide", function () {
  const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  const baseRide = {
    _id: "ride1",
    driver: "driver1",
    riders: [],
    seats: 3,
    date: futureDate,
  };
  const rider = { _id: "rider1" };

  it("rejects when the ride does not exist", function () {
    const result = validateUserCanJoinRide(null, rider);
    expect(result.isValid).to.equal(false);
    expect(result.error).to.match(/not found/i);
  });

  it("rejects when there is no logged-in user", function () {
    const result = validateUserCanJoinRide(baseRide, null);
    expect(result.isValid).to.equal(false);
    expect(result.error).to.match(/logged in/i);
  });

  it("rejects a full ride", function () {
    const fullRide = { ...baseRide, riders: ["a", "b", "c"], seats: 3 };
    const result = validateUserCanJoinRide(fullRide, rider);
    expect(result.isValid).to.equal(false);
    expect(result.error).to.match(/full/i);
  });

  it("rejects a duplicate rider", function () {
    const rideWithRider = { ...baseRide, riders: ["rider1"] };
    const result = validateUserCanJoinRide(rideWithRider, rider);
    expect(result.isValid).to.equal(false);
    expect(result.error).to.match(/already a rider/i);
  });

  it("rejects the driver joining their own ride", function () {
    const result = validateUserCanJoinRide(baseRide, { _id: "driver1" });
    expect(result.isValid).to.equal(false);
    expect(result.error).to.match(/own ride/i);
  });

  it("rejects a ride that started more than the 30-minute grace period ago", function () {
    const pastRide = {
      ...baseRide,
      date: new Date(Date.now() - 31 * 60 * 1000),
    };
    const result = validateUserCanJoinRide(pastRide, rider);
    expect(result.isValid).to.equal(false);
    expect(result.error).to.match(/already started or passed/i);
  });

  it("allows a ride that started less than the 30-minute grace period ago", function () {
    const justStartedRide = {
      ...baseRide,
      date: new Date(Date.now() - 10 * 60 * 1000),
    };
    const result = validateUserCanJoinRide(justStartedRide, rider);
    expect(result.isValid).to.equal(true);
  });

  it("rejects a Driver-only profile", function () {
    const result = validateUserCanJoinRide(baseRide, rider, { UserType: "Driver" });
    expect(result.isValid).to.equal(false);
    expect(result.error).to.match(/registered as a Driver only/i);
  });

  it("allows a Rider or Both profile", function () {
    expect(validateUserCanJoinRide(baseRide, rider, { UserType: "Rider" }).isValid).to.equal(true);
    expect(validateUserCanJoinRide(baseRide, rider, { UserType: "Both" }).isValid).to.equal(true);
  });

  it("allows a valid join with no profile passed", function () {
    const result = validateUserCanJoinRide(baseRide, rider);
    expect(result).to.deep.equal({ isValid: true, error: null });
  });
});
