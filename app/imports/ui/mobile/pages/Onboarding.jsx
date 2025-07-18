import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Profiles } from "../../../api/profile/Profile";

/**
 * Mobile Onboarding component - Interactive profile creation flow
 */
class MobileOnboarding extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      currentStep: 1,
      totalSteps: 4, // Reduced from 5 since we removed the captcha step
      // Profile data
      name: "",
      location: "",
      userType: "Both",
      phone: "",
      other: "",
      profileImage: "",
      rideImage: "",
      // UI states
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
    // If user already has a profile, redirect to dashboard
    if (this.props.profileData) {
      this.setState({ redirectToReferer: true });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps) {
    if (this.props.profileData && !prevProps.profileData) {
      this.setState({ redirectToReferer: true });
    }
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  nextStep = () => {
    const { currentStep, totalSteps } = this.state;
    if (currentStep < totalSteps) {
      this.setState({ currentStep: currentStep + 1 });
    }
  };

  prevStep = () => {
    const { currentStep } = this.state;
    if (currentStep > 1) {
      this.setState({ currentStep: currentStep - 1, error: "" });
    }
  };

  validateStep = (step) => {
    switch (step) {
      case 1:
        return this.state.name.trim().length >= 2;
      case 2:
        return this.state.location.trim().length >= 2;
      case 3:
        return true; // User type selection is optional
      case 4:
        return true; // Final step - ready to finish
      default:
        return false;
    }
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

  handleFinish = () => {
    const { name, location, userType, phone, other, profileImage, rideImage } =
      this.state;

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

    // Insert new profile
    Profiles.insert(profileData, (error) => {
      if (!this._isMounted) return;
      this.setState({ isSubmitting: false });
      if (error) {
        this.setState({ error: error.message });
      } else {
        this.setState({
          success:
            "Welcome to Carpool! Your profile has been created successfully!",
          redirectToReferer: true,
        });
      }
    });
  };

  renderProgressBar = () => {
    const { currentStep, totalSteps } = this.state;
    const progress = (currentStep / totalSteps) * 100;

    return (
      <div className="onboarding-progress-container">
        <div className="onboarding-progress-bar">
          <div
            className="onboarding-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="onboarding-progress-text">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    );
  };

  renderStep1 = () => (
    <div className="onboarding-step">
      <div className="onboarding-step-icon">👋</div>
      <h2 className="onboarding-step-title">Welcome to Carpool!</h2>
      <p className="onboarding-step-subtitle">
        Let's start by getting your name. This helps other users identify you.
      </p>

      <div className="onboarding-input-group">
        <label className="onboarding-label">What's your full name? *</label>
        <input
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={this.state.name}
          onChange={this.handleChange}
          className="onboarding-input"
          maxLength="50"
        />
        <div className="onboarding-input-hint">
          Use your real name so other carpoolers can recognize you
        </div>
      </div>
    </div>
  );

  renderStep2 = () => (
    <div className="onboarding-step">
      <div className="onboarding-step-icon">📍</div>
      <h2 className="onboarding-step-title">Where are you located?</h2>
      <p className="onboarding-step-subtitle">
        This helps us connect you with nearby rides and carpoolers.
      </p>

      <div className="onboarding-input-group">
        <label className="onboarding-label">Your home city *</label>
        <input
          type="text"
          name="location"
          placeholder="e.g., Honolulu, Hawaii"
          value={this.state.location}
          onChange={this.handleChange}
          className="onboarding-input"
          maxLength="100"
        />
        <div className="onboarding-input-hint">
          Enter your city and state/country
        </div>
      </div>
    </div>
  );

  renderStep3 = () => (
    <div className="onboarding-step">
      <div className="onboarding-step-icon">🚗</div>
      <h2 className="onboarding-step-title">How do you carpool?</h2>
      <p className="onboarding-step-subtitle">
        Tell us if you drive, ride, or do both. You can change this later.
      </p>

      <div className="onboarding-user-type-options">
        <div
          className={`onboarding-user-type-option ${this.state.userType === "Driver" ? "selected" : ""}`}
          onClick={() => this.setState({ userType: "Driver" })}
        >
          <div className="onboarding-user-type-icon">🚙</div>
          <div className="onboarding-user-type-title">Driver</div>
          <div className="onboarding-user-type-desc">
            I drive and offer rides
          </div>
        </div>

        <div
          className={`onboarding-user-type-option ${this.state.userType === "Rider" ? "selected" : ""}`}
          onClick={() => this.setState({ userType: "Rider" })}
        >
          <div className="onboarding-user-type-icon">🎒</div>
          <div className="onboarding-user-type-title">Rider</div>
          <div className="onboarding-user-type-desc">
            I need rides from others
          </div>
        </div>

        <div
          className={`onboarding-user-type-option ${this.state.userType === "Both" ? "selected" : ""}`}
          onClick={() => this.setState({ userType: "Both" })}
        >
          <div className="onboarding-user-type-icon">🔄</div>
          <div className="onboarding-user-type-title">Both</div>
          <div className="onboarding-user-type-desc">
            I drive sometimes and ride sometimes
          </div>
        </div>
      </div>

      <div className="onboarding-contact-section">
        <h3>Contact Information (Optional)</h3>
        <div className="onboarding-input-group">
          <label className="onboarding-label">Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="Your phone number"
            value={this.state.phone}
            onChange={this.handleChange}
            className="onboarding-input"
          />
        </div>

        <div className="onboarding-input-group">
          <label className="onboarding-label">Other Contact</label>
          <input
            type="text"
            name="other"
            placeholder="Email, social media, etc."
            value={this.state.other}
            onChange={this.handleChange}
            className="onboarding-input"
          />
        </div>
      </div>
    </div>
  );

  renderStep4 = () => (
    <div className="onboarding-step">
      <div className="onboarding-step-icon">📸</div>
      <h2 className="onboarding-step-title">Add some photos!</h2>
      <p className="onboarding-step-subtitle">
        Photos help build trust with other carpoolers. These are optional but
        recommended. Upload photos one at a time with security verification.
      </p>

      <div className="onboarding-photo-sections">
        {/* Profile Photo */}
        <div className="onboarding-photo-section">
          <h3>Profile Photo</h3>
          {(this.state.profileImagePreview || this.state.profileImage) && (
            <div className="onboarding-photo-preview">
              <img
                src={
                  this.state.profileImagePreview ||
                  (this.state.profileImage
                    ? `/image/${this.state.profileImage}`
                    : "")
                }
                alt="Profile preview"
                className="onboarding-preview-img"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => this.handleImageSelect(e, "profile")}
            className="onboarding-file-input"
            id="profile-upload"
            disabled={this.state.isUploadingProfile}
          />
          <label htmlFor="profile-upload" className="onboarding-file-label">
            {this.state.profileImage
              ? "Change Profile Photo"
              : this.state.profileImagePreview
                ? "Upload This Photo"
                : "Add Profile Photo"}
          </label>

          {/* Profile Image Upload with Captcha */}
          {this.state.showProfileUpload && (
            <div className="onboarding-upload-section">
              <div className="onboarding-captcha-container">
                {this.state.isLoadingProfileCaptcha ? (
                  <div className="onboarding-captcha-loading">Loading...</div>
                ) : (
                  <div
                    className="onboarding-captcha-display"
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
                  className="onboarding-captcha-refresh"
                  title="Generate new code"
                >
                  <img src="/svg/refresh.svg" alt="Refresh" />
                </button>
              </div>

              <div className="onboarding-input-group">
                <input
                  type="text"
                  name="profileCaptchaInput"
                  placeholder="Enter security code"
                  value={this.state.profileCaptchaInput}
                  onChange={this.handleChange}
                  className="onboarding-input"
                  disabled={this.state.isUploadingProfile}
                />
              </div>

              <button
                type="button"
                onClick={this.uploadProfileImage}
                className="onboarding-upload-button"
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

        {/* Vehicle Photo - Only show for Drivers */}
        {this.state.userType !== "Rider" && (
          <div className="onboarding-photo-section">
            <h3>Vehicle Photo</h3>
            {(this.state.rideImagePreview || this.state.rideImage) && (
              <div className="onboarding-photo-preview">
                <img
                  src={
                    this.state.rideImagePreview ||
                    (this.state.rideImage
                      ? `/image/${this.state.rideImage}`
                      : "")
                  }
                  alt="Vehicle preview"
                  className="onboarding-preview-img"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => this.handleImageSelect(e, "ride")}
              className="onboarding-file-input"
              id="vehicle-upload"
              disabled={this.state.isUploadingRide}
            />
            <label htmlFor="vehicle-upload" className="onboarding-file-label">
              {this.state.rideImage
                ? "Change Vehicle Photo"
                : this.state.rideImagePreview
                  ? "Upload This Photo"
                  : "Add Vehicle Photo"}
            </label>

            {/* Ride Image Upload with Captcha */}
            {this.state.showRideUpload && (
              <div className="onboarding-upload-section">
                <div className="onboarding-captcha-container">
                  {this.state.isLoadingRideCaptcha ? (
                    <div className="onboarding-captcha-loading">Loading...</div>
                  ) : (
                    <div
                      className="onboarding-captcha-display"
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
                    className="onboarding-captcha-refresh"
                    title="Generate new code"
                  >
                    <img src="/svg/refresh.svg" alt="Refresh" />
                  </button>
                </div>

                <div className="onboarding-input-group">
                  <input
                    type="text"
                    name="rideCaptchaInput"
                    placeholder="Enter security code"
                    value={this.state.rideCaptchaInput}
                    onChange={this.handleChange}
                    className="onboarding-input"
                    disabled={this.state.isUploadingRide}
                  />
                </div>

                <button
                  type="button"
                  onClick={this.uploadRideImage}
                  className="onboarding-upload-button"
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
        )}
      </div>

      <div className="onboarding-file-info">
        Supported: JPEG, PNG, GIF, WebP (max 5MB each)
      </div>

      <div className="onboarding-summary">
        <h3>Profile Summary</h3>
        <div className="onboarding-summary-item">
          <strong>Name:</strong> {this.state.name}
        </div>
        <div className="onboarding-summary-item">
          <strong>Location:</strong> {this.state.location}
        </div>
        <div className="onboarding-summary-item">
          <strong>User Type:</strong> {this.state.userType}
        </div>
        {this.state.phone && (
          <div className="onboarding-summary-item">
            <strong>Phone:</strong> {this.state.phone}
          </div>
        )}
        {this.state.profileImage && (
          <div className="onboarding-summary-item">
            <strong>Profile Photo:</strong> ✅ Uploaded
          </div>
        )}
        {this.state.rideImage && (
          <div className="onboarding-summary-item">
            <strong>Vehicle Photo:</strong> ✅ Uploaded
          </div>
        )}
      </div>
    </div>
  );

  renderCurrentStep = () => {
    switch (this.state.currentStep) {
      case 1:
        return this.renderStep1();
      case 2:
        return this.renderStep2();
      case 3:
        return this.renderStep3();
      case 4:
        return this.renderStep4();
      default:
        return this.renderStep1();
    }
  };

  render() {
    if (this.state.redirectToReferer) {
      return <Redirect to="/imDriving" />;
    }

    const { currentStep, totalSteps, isSubmitting } = this.state;
    const canProceed = this.validateStep(currentStep);

    return (
      <>
        <div className="onboarding-container">
          <div className="onboarding-header">
            <div className="onboarding-app-name">Carpool</div>
            {this.renderProgressBar()}
          </div>

          <div className="onboarding-content">
            {this.renderCurrentStep()}

            {this.state.error && (
              <div className="onboarding-error">{this.state.error}</div>
            )}

            {this.state.success && (
              <div className="onboarding-success">{this.state.success}</div>
            )}

            <div
              className={`onboarding-navigation ${currentStep > 1 ? "has-back-button" : ""}`}
            >
              {currentStep > 1 && (
                <button
                  onClick={this.prevStep}
                  className="onboarding-btn onboarding-btn-secondary"
                  disabled={isSubmitting}
                >
                  ← Back
                </button>
              )}

              {currentStep < totalSteps && (
                <button
                  onClick={this.nextStep}
                  className="onboarding-btn onboarding-btn-primary"
                  disabled={!canProceed || isSubmitting}
                >
                  Continue →
                </button>
              )}

              {currentStep === totalSteps && (
                <button
                  onClick={this.handleFinish}
                  className="onboarding-btn onboarding-btn-primary"
                  disabled={!canProceed || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      {this.state.isUploadingProfile &&
                        "Uploading profile photo..."}
                      {this.state.isUploadingRide &&
                        "Uploading vehicle photo..."}
                      {!this.state.isUploadingProfile &&
                        !this.state.isUploadingRide &&
                        "Creating Profile..."}
                    </>
                  ) : (
                    "🎉 Create My Profile!"
                  )}
                </button>
              )}
            </div>
          </div>

          <style jsx>{`
            .onboarding-container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              font-family:
                Inter,
                -apple-system,
                Roboto,
                Helvetica,
                sans-serif;
              color: white;
            }

            .onboarding-header {
              padding: 40px 24px 20px 24px;
              text-align: center;
            }

            .onboarding-app-name {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 24px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .onboarding-progress-container {
              max-width: 300px;
              margin: 0 auto;
            }

            .onboarding-progress-bar {
              width: 100%;
              height: 8px;
              background-color: rgba(255, 255, 255, 0.3);
              border-radius: 4px;
              overflow: hidden;
              margin-bottom: 8px;
            }

            .onboarding-progress-fill {
              height: 100%;
              background-color: white;
              border-radius: 4px;
              transition: width 0.3s ease;
            }

            .onboarding-progress-text {
              font-size: 14px;
              opacity: 0.9;
            }

            .onboarding-content {
              flex: 1;
              background-color: white;
              color: #333;
              border-radius: 24px 24px 0 0;
              padding: 32px 24px 24px 24px;
              margin-top: 20px;
              max-width: 600px;
              margin-left: auto;
              margin-right: auto;
              width: 100%;
              box-sizing: border-box;
            }

            .onboarding-step {
              text-align: center;
              margin-bottom: 32px;
            }

            .onboarding-step-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }

            .onboarding-step-title {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 12px;
              color: #333;
            }

            .onboarding-step-subtitle {
              font-size: 16px;
              color: #666;
              line-height: 1.5;
              margin-bottom: 32px;
            }

            .onboarding-input-group {
              margin-bottom: 24px;
              text-align: left;
            }

            .onboarding-label {
              display: block;
              font-weight: 600;
              font-size: 14px;
              color: #333;
              margin-bottom: 8px;
            }

            .onboarding-input {
              width: 100%;
              padding: 16px;
              border: 2px solid #e1e5e9;
              border-radius: 12px;
              font-size: 16px;
              font-family: inherit;
              transition: border-color 0.2s ease;
              box-sizing: border-box;
            }

            .onboarding-input:focus {
              outline: none;
              border-color: #667eea;
            }

            .onboarding-input-hint {
              font-size: 12px;
              color: #888;
              margin-top: 4px;
            }

            .onboarding-user-type-options {
              display: flex;
              flex-direction: column;
              gap: 16px;
              margin-bottom: 32px;
            }

            .onboarding-user-type-option {
              border: 2px solid #e1e5e9;
              border-radius: 16px;
              padding: 20px;
              cursor: pointer;
              transition: all 0.2s ease;
              text-align: center;
            }

            .onboarding-user-type-option:hover {
              border-color: #667eea;
              background-color: #f8f9ff;
            }

            .onboarding-user-type-option.selected {
              border-color: #667eea;
              background-color: #667eea;
              color: white;
            }

            .onboarding-user-type-icon {
              font-size: 32px;
              margin-bottom: 8px;
            }

            .onboarding-user-type-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 4px;
            }

            .onboarding-user-type-desc {
              font-size: 14px;
              opacity: 0.8;
            }

            .onboarding-contact-section {
              background-color: #f8f9fa;
              border-radius: 16px;
              padding: 24px;
              text-align: left;
            }

            .onboarding-contact-section h3 {
              margin: 0 0 20px 0;
              color: #333;
              font-size: 18px;
            }

            .onboarding-photo-sections {
              display: flex;
              flex-direction: column;
              gap: 24px;
              margin-bottom: 20px;
            }

            .onboarding-photo-section {
              text-align: left;
            }

            .onboarding-photo-section h3 {
              margin: 0 0 16px 0;
              color: #333;
              font-size: 18px;
            }

            .onboarding-photo-preview {
              margin-bottom: 16px;
              text-align: center;
            }

            .onboarding-preview-img {
              max-width: 150px;
              max-height: 150px;
              border-radius: 12px;
              border: 2px solid #e1e5e9;
              object-fit: cover;
            }

            .onboarding-file-input {
              display: none;
            }

            .onboarding-file-label {
              display: inline-block;
              padding: 12px 24px;
              background-color: #667eea;
              color: white;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 500;
              transition: background-color 0.2s ease;
            }

            .onboarding-file-label:hover {
              background-color: #5a6fd8;
            }

            .onboarding-file-info {
              font-size: 12px;
              color: #888;
              text-align: center;
            }

            .onboarding-captcha-section {
              margin-bottom: 24px;
            }

            .onboarding-captcha-container {
              border: 2px solid #e1e5e9;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 16px;
              background-color: #f9f9f9;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 80px;
              position: relative;
            }

            .onboarding-captcha-loading {
              color: #888;
              font-size: 14px;
            }

            .onboarding-captcha-display {
              line-height: 1;
            }

            .onboarding-captcha-refresh {
              position: absolute;
              bottom: 8px;
              right: 8px;
              background-color: rgba(255, 255, 255, 0.9);
              border: 1px solid rgba(200, 200, 200, 1);
              border-radius: 50%;
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s ease;
              padding: 0;
            }

            .onboarding-captcha-refresh img {
              width: 16px;
              height: 16px;
              opacity: 0.7;
            }

            .onboarding-captcha-refresh:hover:not(:disabled) {
              background-color: rgba(255, 255, 255, 1);
              border-color: #667eea;
              transform: scale(1.05);
            }

            .onboarding-captcha-refresh:hover:not(:disabled) img {
              opacity: 1;
            }

            .onboarding-captcha-refresh:disabled {
              background-color: rgba(245, 245, 245, 0.8);
              cursor: not-allowed;
              transform: none;
            }

            .onboarding-captcha-refresh:disabled img {
              opacity: 0.3;
            }

            .onboarding-upload-section {
              margin-top: 16px;
              padding: 16px;
              background-color: rgba(240, 248, 255, 0.8);
              border-radius: 12px;
              border: 2px solid rgba(200, 220, 240, 0.5);
            }

            .onboarding-upload-button {
              border-radius: 8px;
              background-color: #5a6fd8;
              color: white;
              padding: 12px 20px;
              border: none;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              width: 100%;
              margin-top: 12px;
              transition: background-color 0.2s ease;
            }

            .onboarding-upload-button:hover:not(:disabled) {
              background-color: #4a5fc8;
            }

            .onboarding-upload-button:disabled {
              background-color: #ccc;
              cursor: not-allowed;
            }

            .onboarding-summary {
              background-color: #f8f9fa;
              border-radius: 12px;
              padding: 20px;
              text-align: left;
              margin-bottom: 24px;
            }

            .onboarding-summary h3 {
              margin: 0 0 16px 0;
              color: #333;
            }

            .onboarding-summary-item {
              margin-bottom: 8px;
              font-size: 14px;
            }

            .onboarding-error {
              background-color: #fee;
              border: 1px solid #fcc;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 20px;
              color: #c00;
              text-align: center;
              font-size: 14px;
            }

            .onboarding-success {
              background-color: #efe;
              border: 1px solid #cfc;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 20px;
              color: #060;
              text-align: center;
              font-size: 14px;
            }

            .onboarding-navigation {
              display: flex;
              gap: 16px;
              justify-content: flex-end;
              margin-top: 32px;
            }

            .onboarding-navigation.has-back-button {
              justify-content: space-between;
            }

            .onboarding-btn {
              padding: 16px 32px;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              border: none;
              flex: 1;
              max-width: 200px;
            }

            .onboarding-btn:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            .onboarding-btn-primary {
              background-color: #667eea;
              color: white;
            }

            .onboarding-btn-primary:hover:not(:disabled) {
              background-color: #5a6fd8;
            }

            .onboarding-btn-secondary {
              background-color: #f8f9fa;
              color: #333;
              border: 2px solid #e1e5e9;
            }

            .onboarding-btn-secondary:hover:not(:disabled) {
              background-color: #e9ecef;
            }

            @media (max-width: 480px) {
              .onboarding-header {
                padding: 20px 16px 16px 16px;
              }

              .onboarding-app-name {
                font-size: 24px;
              }

              .onboarding-content {
                padding: 24px 16px 16px 16px;
                border-radius: 16px 16px 0 0;
              }

              .onboarding-step-icon {
                font-size: 48px;
              }

              .onboarding-step-title {
                font-size: 20px;
              }

              .onboarding-user-type-options {
                gap: 12px;
              }

              .onboarding-user-type-option {
                padding: 16px;
              }

              .onboarding-navigation {
                flex-direction: column;
              }

              .onboarding-btn {
                max-width: none;
              }
            }
          `}</style>
        </div>
      </>
    );
  }
}

MobileOnboarding.propTypes = {
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
})(MobileOnboarding);
