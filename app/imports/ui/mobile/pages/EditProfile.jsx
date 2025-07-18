import React from "react";
import PropTypes from "prop-types";
import { Link, Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Profiles } from "../../../api/profile/Profile";

/**
 * Mobile EditProfile component with modern design, image upload, and CAPTCHA validation
 */
class MobileEditProfile extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      name: "",
      location: "",
      profileImage: "",
      rideImage: "",
      phone: "",
      other: "",
      userType: "Both",
      error: "",
      success: "",
      isSubmitting: false,
      redirectToReferer: false,
      // Image upload states
      selectedProfileImage: null,
      selectedRideImage: null,
      profileImagePreview: null,
      rideImagePreview: null,
      isUploadingProfile: false,
      isUploadingRide: false,
      // Profile image captcha states
      profileCaptchaInput: "",
      profileCaptchaSvg: "",
      profileCaptchaSessionId: "",
      isLoadingProfileCaptcha: false,
      showProfileUpload: false,
      // Ride image captcha states
      rideCaptchaInput: "",
      rideCaptchaSvg: "",
      rideCaptchaSessionId: "",
      isLoadingRideCaptcha: false,
      showRideUpload: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.populateExistingData();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps) {
    if (this.props.profileData && !prevProps.profileData) {
      this.populateExistingData();
    }
  }

  populateExistingData = () => {
    if (this.props.profileData) {
      const profile = this.props.profileData;
      this.setState({
        name: profile.Name || "",
        location: profile.Location || "",
        profileImage: profile.Image || "",
        rideImage: profile.Ride || "",
        phone: profile.Phone || "",
        other: profile.Other || "",
        userType: profile.UserType || "Both",
      });
    }
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  generateProfileCaptcha = () => {
    if (!this._isMounted) return;
    this.setState({ isLoadingProfileCaptcha: true });
    Meteor.call("captcha.generate", (error, result) => {
      if (!this._isMounted) return;
      if (error) {
        this.setState({
          error: "Failed to load CAPTCHA. Please try again.",
          isLoadingProfileCaptcha: false,
        });
      } else {
        this.setState({
          profileCaptchaSvg: result.svg,
          profileCaptchaSessionId: result.sessionId,
          profileCaptchaInput: "",
          isLoadingProfileCaptcha: false,
          showProfileUpload: true,
        });
      }
    });
  };

  generateRideCaptcha = () => {
    if (!this._isMounted) return;
    this.setState({ isLoadingRideCaptcha: true });
    Meteor.call("captcha.generate", (error, result) => {
      if (!this._isMounted) return;
      if (error) {
        this.setState({
          error: "Failed to load CAPTCHA. Please try again.",
          isLoadingRideCaptcha: false,
        });
      } else {
        this.setState({
          rideCaptchaSvg: result.svg,
          rideCaptchaSessionId: result.sessionId,
          rideCaptchaInput: "",
          isLoadingRideCaptcha: false,
          showRideUpload: true,
        });
      }
    });
  };

  // Convert file to base64
  fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });

  handleImageSelect = (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      this.setState({
        error: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.setState({ error: "File size must be less than 5MB" });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (imageType === "profile") {
        this.setState({
          selectedProfileImage: file,
          profileImagePreview: event.target.result,
        });
        // Generate captcha for profile image upload
        this.generateProfileCaptcha();
      } else {
        this.setState({
          selectedRideImage: file,
          rideImagePreview: event.target.result,
        });
        // Generate captcha for ride image upload
        this.generateRideCaptcha();
      }
    };
    reader.readAsDataURL(file);

    this.setState({ error: "" });
  };

  uploadProfileImage = () => {
    const {
      selectedProfileImage,
      profileCaptchaInput,
      profileCaptchaSessionId,
    } = this.state;

    if (!selectedProfileImage || !profileCaptchaInput.trim()) {
      this.setState({ error: "Please enter the security code and try again." });
      return;
    }

    this.setState({ isUploadingProfile: true, error: "" });

    // First verify CAPTCHA
    Meteor.call(
      "captcha.verify",
      profileCaptchaSessionId,
      profileCaptchaInput,
      (captchaError, isValidCaptcha) => {
        if (!this._isMounted) return;

        if (captchaError || !isValidCaptcha) {
          this.setState({
            error: "Invalid security code. Please try again.",
            isUploadingProfile: false,
          });
          this.generateProfileCaptcha();
          return;
        }

        // CAPTCHA is valid, proceed with upload
        this.fileToBase64(selectedProfileImage)
          .then((base64Data) => {
            const imageData = {
              fileName: selectedProfileImage.name,
              mimeType: selectedProfileImage.type,
              base64Data,
            };

            Meteor.call(
              "images.upload",
              imageData,
              profileCaptchaSessionId,
              (err, result) => {
                if (!this._isMounted) return;

                if (err) {
                  this.setState({
                    error:
                      err.reason ||
                      "Failed to upload profile image. Please try again.",
                    isUploadingProfile: false,
                  });
                  this.generateProfileCaptcha();
                } else {
                  this.setState({
                    profileImage: result.uuid,
                    selectedProfileImage: null,
                    profileImagePreview: null,
                    showProfileUpload: false,
                    isUploadingProfile: false,
                    success: "Profile image uploaded successfully!",
                  });
                }
              },
            );
          })
          .catch((error) => {
            if (!this._isMounted) return;
            this.setState({
              error: "Failed to process profile image. Please try again.",
              isUploadingProfile: false,
            });
          });
      },
    );
  };

  uploadRideImage = () => {
    const { selectedRideImage, rideCaptchaInput, rideCaptchaSessionId } =
      this.state;

    if (!selectedRideImage || !rideCaptchaInput.trim()) {
      this.setState({ error: "Please enter the security code and try again." });
      return;
    }

    this.setState({ isUploadingRide: true, error: "" });

    // First verify CAPTCHA
    Meteor.call(
      "captcha.verify",
      rideCaptchaSessionId,
      rideCaptchaInput,
      (captchaError, isValidCaptcha) => {
        if (!this._isMounted) return;

        if (captchaError || !isValidCaptcha) {
          this.setState({
            error: "Invalid security code. Please try again.",
            isUploadingRide: false,
          });
          this.generateRideCaptcha();
          return;
        }

        // CAPTCHA is valid, proceed with upload
        this.fileToBase64(selectedRideImage)
          .then((base64Data) => {
            const imageData = {
              fileName: selectedRideImage.name,
              mimeType: selectedRideImage.type,
              base64Data,
            };

            Meteor.call(
              "images.upload",
              imageData,
              rideCaptchaSessionId,
              (err, result) => {
                if (!this._isMounted) return;

                if (err) {
                  this.setState({
                    error:
                      err.reason ||
                      "Failed to upload vehicle image. Please try again.",
                    isUploadingRide: false,
                  });
                  this.generateRideCaptcha();
                } else {
                  this.setState({
                    rideImage: result.uuid,
                    selectedRideImage: null,
                    rideImagePreview: null,
                    showRideUpload: false,
                    isUploadingRide: false,
                    success: "Vehicle image uploaded successfully!",
                  });
                }
              },
            );
          })
          .catch((error) => {
            if (!this._isMounted) return;
            this.setState({
              error: "Failed to process vehicle image. Please try again.",
              isUploadingRide: false,
            });
          });
      },
    );
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.submit();
  };

  submit = () => {
    const { name, location, profileImage, rideImage, phone, other, userType } =
      this.state;

    if (!name.trim()) {
      this.setState({ error: "Name is required." });
      return;
    }

    if (!location.trim()) {
      this.setState({ error: "Location is required." });
      return;
    }

    this.setState({ isSubmitting: true, error: "", success: "" });

    const profileData = {
      Name: name,
      Location: location,
      Image: profileImage,
      Ride: rideImage,
      Phone: phone,
      Other: other,
      UserType: userType,
      Owner: Meteor.user()._id,
    };

    // Check if profile exists and update or insert
    const existingProfile = this.props.profileData;

    if (existingProfile) {
      // Update existing profile
      Profiles.update(existingProfile._id, { $set: profileData }, (error) => {
        if (!this._isMounted) return;
        this.setState({ isSubmitting: false });
        if (error) {
          this.setState({ error: error.message });
        } else {
          this.setState({
            success: "Profile updated successfully!",
            redirectToReferer: true,
          });
        }
      });
    } else {
      // Insert new profile
      Profiles.insert(profileData, (error) => {
        if (!this._isMounted) return;
        this.setState({ isSubmitting: false });
        if (error) {
          this.setState({ error: error.message });
        } else {
          this.setState({
            success: "Profile created successfully!",
            redirectToReferer: true,
          });
        }
      });
    }
  };

  render() {
    if (this.state.redirectToReferer) {
      return <Redirect to="/imDriving" />;
    }

    if (!this.props.ready) {
      return (
        <div className="mobile-edit-profile-container">
          <div className="mobile-edit-profile-loading">
            <div className="mobile-edit-profile-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mobile-edit-profile-container">
          <div className="mobile-edit-profile-header">
            <div className="mobile-edit-profile-app-name">Edit Profile</div>
          </div>

          <div className="mobile-edit-profile-content">
            <div className="mobile-edit-profile-copy">
              <div className="mobile-edit-profile-title">
                Update your profile
              </div>
              <div className="mobile-edit-profile-subtitle">
                Keep your information current and upload photos
              </div>
            </div>

            <form
              onSubmit={this.handleSubmit}
              className="mobile-edit-profile-form"
            >
              <div className="mobile-edit-profile-input-section">
                {/* Basic Information */}
                <div className="mobile-edit-profile-section">
                  <h3 className="mobile-edit-profile-section-title">
                    Basic Information
                  </h3>

                  <div className="mobile-edit-profile-field">
                    <label className="mobile-edit-profile-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={this.state.name}
                      onChange={this.handleChange}
                      className="mobile-edit-profile-input"
                      required
                    />
                  </div>

                  <div className="mobile-edit-profile-field">
                    <label className="mobile-edit-profile-label">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="Your home city"
                      value={this.state.location}
                      onChange={this.handleChange}
                      className="mobile-edit-profile-input"
                      required
                    />
                  </div>

                  <div className="mobile-edit-profile-field">
                    <label className="mobile-edit-profile-label">
                      User Type
                    </label>
                    <select
                      name="userType"
                      value={this.state.userType}
                      onChange={this.handleChange}
                      className="mobile-edit-profile-select"
                    >
                      <option value="Driver">Driver</option>
                      <option value="Rider">Rider</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mobile-edit-profile-section">
                  <h3 className="mobile-edit-profile-section-title">
                    Contact Information
                  </h3>

                  <div className="mobile-edit-profile-field">
                    <label className="mobile-edit-profile-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Your phone number"
                      value={this.state.phone}
                      onChange={this.handleChange}
                      className="mobile-edit-profile-input"
                    />
                  </div>

                  <div className="mobile-edit-profile-field">
                    <label className="mobile-edit-profile-label">
                      Other Contact
                    </label>
                    <input
                      type="text"
                      name="other"
                      placeholder="Email, social media, etc."
                      value={this.state.other}
                      onChange={this.handleChange}
                      className="mobile-edit-profile-input"
                    />
                  </div>
                </div>

                {/* Profile Image Upload */}
                <div className="mobile-edit-profile-section">
                  <h3 className="mobile-edit-profile-section-title">
                    Profile Photo
                  </h3>

                  {(this.state.profileImagePreview ||
                    this.state.profileImage) && (
                    <div className="mobile-edit-profile-image-preview">
                      <img
                        src={
                          this.state.profileImagePreview ||
                          (this.state.profileImage
                            ? `/image/${this.state.profileImage}`
                            : "")
                        }
                        alt="Profile preview"
                        className="mobile-edit-profile-preview-img"
                      />
                    </div>
                  )}

                  <div className="mobile-edit-profile-field">
                    <label className="mobile-edit-profile-label">
                      Upload Profile Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => this.handleImageSelect(e, "profile")}
                      className="mobile-edit-profile-file-input"
                      disabled={
                        this.state.isSubmitting || this.state.isUploadingProfile
                      }
                    />
                    <div className="mobile-edit-profile-file-info">
                      Supported: JPEG, PNG, GIF, WebP (max 5MB)
                    </div>
                  </div>

                  {/* Profile Image Upload with Captcha */}
                  {this.state.showProfileUpload && (
                    <div className="mobile-edit-profile-upload-section">
                      <div className="mobile-edit-profile-captcha-container">
                        {this.state.isLoadingProfileCaptcha ? (
                          <div className="mobile-edit-profile-captcha-loading">
                            Loading security code...
                          </div>
                        ) : (
                          <div
                            className="mobile-edit-profile-captcha-display"
                            dangerouslySetInnerHTML={{
                              __html: this.state.profileCaptchaSvg,
                            }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={this.generateProfileCaptcha}
                          disabled={
                            this.state.isLoadingProfileCaptcha ||
                            this.state.isUploadingProfile
                          }
                          className="mobile-edit-profile-captcha-refresh-icon"
                          title="Refresh security code"
                        >
                          <img src="/svg/refresh.svg" alt="Refresh" />
                        </button>
                      </div>

                      <div className="mobile-edit-profile-field">
                        <input
                          type="text"
                          name="profileCaptchaInput"
                          placeholder="Enter the security code"
                          value={this.state.profileCaptchaInput}
                          onChange={this.handleChange}
                          className="mobile-edit-profile-input"
                          disabled={this.state.isUploadingProfile}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={this.uploadProfileImage}
                        className="mobile-edit-profile-upload-button"
                        disabled={
                          this.state.isUploadingProfile ||
                          !this.state.profileCaptchaInput.trim()
                        }
                      >
                        {this.state.isUploadingProfile
                          ? "Uploading..."
                          : "Upload Profile Photo"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Ride Image Upload */}
                <div className="mobile-edit-profile-section">
                  <h3 className="mobile-edit-profile-section-title">
                    Vehicle Photo
                  </h3>

                  {(this.state.rideImagePreview || this.state.rideImage) && (
                    <div className="mobile-edit-profile-image-preview">
                      <img
                        src={
                          this.state.rideImagePreview ||
                          (this.state.rideImage
                            ? `/image/${this.state.rideImage}`
                            : "")
                        }
                        alt="Vehicle preview"
                        className="mobile-edit-profile-preview-img"
                      />
                    </div>
                  )}

                  <div className="mobile-edit-profile-field">
                    <label className="mobile-edit-profile-label">
                      Upload Vehicle Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => this.handleImageSelect(e, "ride")}
                      className="mobile-edit-profile-file-input"
                      disabled={
                        this.state.isSubmitting || this.state.isUploadingRide
                      }
                    />
                    <div className="mobile-edit-profile-file-info">
                      Supported: JPEG, PNG, GIF, WebP (max 5MB)
                    </div>
                  </div>

                  {/* Ride Image Upload with Captcha */}
                  {this.state.showRideUpload && (
                    <div className="mobile-edit-profile-upload-section">
                      <div className="mobile-edit-profile-captcha-container">
                        {this.state.isLoadingRideCaptcha ? (
                          <div className="mobile-edit-profile-captcha-loading">
                            Loading security code...
                          </div>
                        ) : (
                          <div
                            className="mobile-edit-profile-captcha-display"
                            dangerouslySetInnerHTML={{
                              __html: this.state.rideCaptchaSvg,
                            }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={this.generateRideCaptcha}
                          disabled={
                            this.state.isLoadingRideCaptcha ||
                            this.state.isUploadingRide
                          }
                          className="mobile-edit-profile-captcha-refresh-icon"
                          title="Refresh security code"
                        >
                          <img src="/svg/refresh.svg" alt="Refresh" />
                        </button>
                      </div>

                      <div className="mobile-edit-profile-field">
                        <input
                          type="text"
                          name="rideCaptchaInput"
                          placeholder="Enter the security code"
                          value={this.state.rideCaptchaInput}
                          onChange={this.handleChange}
                          className="mobile-edit-profile-input"
                          disabled={this.state.isUploadingRide}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={this.uploadRideImage}
                        className="mobile-edit-profile-upload-button"
                        disabled={
                          this.state.isUploadingRide ||
                          !this.state.rideCaptchaInput.trim()
                        }
                      >
                        {this.state.isUploadingRide
                          ? "Uploading..."
                          : "Upload Vehicle Photo"}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="mobile-edit-profile-button"
                  disabled={
                    this.state.isSubmitting ||
                    !this.state.name.trim() ||
                    !this.state.location.trim()
                  }
                >
                  {this.state.isSubmitting ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>

            {this.state.error && (
              <div className="mobile-edit-profile-error">
                {this.state.error}
              </div>
            )}

            {this.state.success && (
              <div className="mobile-edit-profile-success">
                {this.state.success}
              </div>
            )}

            <div className="mobile-edit-profile-links">
              <Link to="/imDriving" className="mobile-edit-profile-link">
                Back to Dashboard
              </Link>
            </div>
          </div>

          <style jsx>{`
            .mobile-edit-profile-container {
              background-color: rgba(255, 255, 255, 1);
              display: flex;
              width: 100%;
              flex-direction: column;
              align-items: center;
              font-family:
                Inter,
                -apple-system,
                Roboto,
                Helvetica,
                sans-serif;
              margin: 0 auto;
              padding: 10px 0;
              min-height: 100vh;
              box-sizing: border-box;
            }

            .mobile-edit-profile-loading {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 200px;
              color: rgba(100, 100, 100, 1);
            }

            .mobile-edit-profile-spinner {
              width: 40px;
              height: 40px;
              border: 4px solid rgba(240, 240, 240, 1);
              border-top: 4px solid rgba(0, 0, 0, 1);
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 16px;
            }

            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }

            .mobile-edit-profile-header {
              display: flex;
              width: 224px;
              max-width: 100%;
              flex-direction: column;
              font-size: 24px;
              color: rgba(0, 0, 0, 1);
              font-weight: 600;
              text-align: center;
              letter-spacing: -0.24px;
              align-items: center;
            }

            .mobile-edit-profile-app-name {
              margin-top: 75px;
            }

            .mobile-edit-profile-content {
              display: flex;
              margin-top: 40px;
              width: 100%;
              flex-direction: column;
              align-items: center;
              justify-content: start;
              padding: 0 24px;
              max-width: 500px;
            }

            .mobile-edit-profile-copy {
              display: flex;
              flex-direction: column;
              align-items: center;
              color: rgba(0, 0, 0, 1);
              text-align: center;
              justify-content: start;
              margin-bottom: 32px;
            }

            .mobile-edit-profile-title {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 8px;
            }

            .mobile-edit-profile-subtitle {
              font-size: 16px;
              font-weight: 400;
              line-height: 1.5;
              color: rgba(100, 100, 100, 1);
            }

            .mobile-edit-profile-form {
              width: 100%;
              max-width: 500px;
            }

            .mobile-edit-profile-input-section {
              width: 100%;
              font-size: 14px;
              line-height: 1.4;
            }

            .mobile-edit-profile-section {
              margin-bottom: 32px;
              padding: 24px;
              background-color: rgba(248, 249, 250, 1);
              border-radius: 12px;
              border: 1px solid rgba(230, 230, 230, 1);
            }

            .mobile-edit-profile-section-title {
              font-size: 18px;
              font-weight: 600;
              color: rgba(0, 0, 0, 1);
              margin: 0 0 20px 0;
              border-bottom: 2px solid rgba(0, 0, 0, 1);
              padding-bottom: 8px;
            }

            .mobile-edit-profile-field {
              margin-bottom: 20px;
            }

            .mobile-edit-profile-label {
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
              font-size: 14px;
              color: rgba(0, 0, 0, 1);
            }

            .mobile-edit-profile-input,
            .mobile-edit-profile-select {
              border-radius: 8px;
              background-color: rgba(255, 255, 255, 1);
              display: flex;
              min-height: 44px;
              width: 100%;
              color: rgba(130, 130, 130, 1);
              font-weight: 400;
              padding: 12px 16px;
              border: 2px solid rgba(224, 224, 224, 1);
              font-size: 16px;
              font-family: inherit;
              outline: none;
              box-sizing: border-box;
            }

            .mobile-edit-profile-input:focus,
            .mobile-edit-profile-select:focus {
              border-color: rgba(0, 0, 0, 0.3);
              color: rgba(0, 0, 0, 1);
            }

            .mobile-edit-profile-input::placeholder {
              color: rgba(130, 130, 130, 1);
            }

            .mobile-edit-profile-file-input {
              border-radius: 8px;
              background-color: rgba(255, 255, 255, 1);
              width: 100%;
              padding: 12px 16px;
              border: 2px solid rgba(224, 224, 224, 1);
              font-size: 16px;
              font-family: inherit;
              outline: none;
              box-sizing: border-box;
            }

            .mobile-edit-profile-file-input:focus {
              border-color: rgba(0, 0, 0, 0.3);
            }

            .mobile-edit-profile-file-info {
              font-size: 12px;
              color: rgba(100, 100, 100, 1);
              margin-top: 4px;
            }

            .mobile-edit-profile-image-preview {
              margin-bottom: 16px;
              text-align: center;
            }

            .mobile-edit-profile-preview-img {
              max-width: 150px;
              max-height: 150px;
              border-radius: 8px;
              border: 2px solid rgba(224, 224, 224, 1);
              object-fit: cover;
            }

            .mobile-edit-profile-captcha-container {
              border: 2px solid rgba(224, 224, 224, 1);
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 16px;
              background-color: rgba(255, 255, 255, 1);
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 60px;
              position: relative;
            }

            .mobile-edit-profile-captcha-loading {
              color: rgba(130, 130, 130, 1);
              font-size: 14px;
            }

            .mobile-edit-profile-captcha-display {
              line-height: 1;
            }

            .mobile-edit-profile-captcha-refresh-icon {
              position: absolute;
              bottom: 8px;
              right: 8px;
              background-color: rgba(255, 255, 255, 0.9);
              border: 1px solid rgba(200, 200, 200, 1);
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s ease;
              backdrop-filter: blur(2px);
              padding: 0;
            }

            .mobile-edit-profile-captcha-refresh-icon img {
              width: 16px;
              height: 16px;
              opacity: 0.7;
            }

            .mobile-edit-profile-captcha-refresh-icon:hover:not(:disabled) {
              background-color: rgba(255, 255, 255, 1);
              border-color: rgba(0, 0, 0, 0.3);
              transform: scale(1.1);
            }

            .mobile-edit-profile-captcha-refresh-icon:hover:not(:disabled) img {
              opacity: 1;
            }

            .mobile-edit-profile-captcha-refresh-icon:disabled {
              background-color: rgba(245, 245, 245, 0.8);
              cursor: not-allowed;
              transform: none;
            }

            .mobile-edit-profile-captcha-refresh-icon:disabled img {
              opacity: 0.3;
            }

            .mobile-edit-profile-upload-section {
              margin-top: 20px;
              padding: 20px;
              background-color: rgba(240, 248, 255, 1);
              border-radius: 8px;
              border: 2px solid rgba(200, 220, 240, 1);
            }

            .mobile-edit-profile-upload-button {
              border-radius: 8px;
              background-color: rgba(0, 100, 200, 1);
              display: flex;
              min-height: 44px;
              width: 100%;
              align-items: center;
              color: rgba(255, 255, 255, 1);
              font-weight: 600;
              justify-content: center;
              padding: 0 16px;
              border: none;
              font-size: 16px;
              font-family: inherit;
              cursor: pointer;
              margin-top: 16px;
            }

            .mobile-edit-profile-upload-button:hover:not(:disabled) {
              background-color: rgba(0, 80, 160, 1);
            }

            .mobile-edit-profile-upload-button:disabled {
              background-color: rgba(150, 150, 150, 1);
              cursor: not-allowed;
            }

            .mobile-edit-profile-button {
              border-radius: 8px;
              background-color: rgba(0, 0, 0, 1);
              display: flex;
              min-height: 48px;
              width: 100%;
              align-items: center;
              color: rgba(255, 255, 255, 1);
              font-weight: 600;
              justify-content: center;
              padding: 0 16px;
              border: none;
              font-size: 16px;
              font-family: inherit;
              cursor: pointer;
              margin-bottom: 24px;
            }

            .mobile-edit-profile-button:hover:not(:disabled) {
              background-color: rgba(40, 40, 40, 1);
            }

            .mobile-edit-profile-button:disabled {
              background-color: rgba(150, 150, 150, 1);
              cursor: not-allowed;
            }

            .mobile-edit-profile-error {
              background-color: rgba(255, 240, 240, 1);
              border: 1px solid rgba(255, 200, 200, 1);
              border-radius: 8px;
              padding: 12px 16px;
              margin-bottom: 16px;
              color: rgba(200, 0, 0, 1);
              font-size: 14px;
              text-align: center;
              width: 100%;
              max-width: 500px;
              box-sizing: border-box;
            }

            .mobile-edit-profile-success {
              background-color: rgba(240, 255, 240, 1);
              border: 1px solid rgba(200, 255, 200, 1);
              border-radius: 8px;
              padding: 12px 16px;
              margin-bottom: 16px;
              color: rgba(0, 150, 0, 1);
              font-size: 14px;
              text-align: center;
              width: 100%;
              max-width: 500px;
              box-sizing: border-box;
            }

            .mobile-edit-profile-links {
              margin-top: 24px;
              text-align: center;
            }

            .mobile-edit-profile-link {
              color: rgba(0, 0, 0, 1);
              font-size: 14px;
              font-weight: 500;
              text-decoration: none;
              padding: 8px;
            }

            .mobile-edit-profile-link:hover {
              text-decoration: underline;
              color: rgba(0, 0, 0, 1);
            }

            @media (max-width: 480px) {
              .mobile-edit-profile-container {
                padding: 10px;
              }

              .mobile-edit-profile-content {
                padding: 0 16px;
              }

              .mobile-edit-profile-section {
                padding: 20px;
              }

              .mobile-edit-profile-title {
                font-size: 18px;
              }

              .mobile-edit-profile-subtitle {
                font-size: 14px;
              }
            }
          `}</style>
        </div>
      </>
    );
  }
}

MobileEditProfile.propTypes = {
  profileData: PropTypes.object,
  ready: PropTypes.bool.isRequired,
  currentUser: PropTypes.string,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe("Profiles");
  const userId = Meteor.userId();

  return {
    profileData: Profiles.findOne({ Owner: userId }),
    currentUser: Meteor.user() ? Meteor.user().username : "",
    ready: subscription.ready(),
  };
})(MobileEditProfile);
