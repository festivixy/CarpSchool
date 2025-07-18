import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Profiles } from "../../../api/profile/Profile";
import {
  Container,
  Header,
  AppName,
  ProgressContainer,
  ProgressBar,
  ProgressFill,
  ProgressText,
  Content,
  Step,
  StepIcon,
  StepTitle,
  StepSubtitle,
  InputGroup,
  Label,
  Input,
  InputHint,
  UserTypeOptions,
  UserTypeOption,
  UserTypeIcon,
  UserTypeTitle,
  UserTypeDesc,
  ContactSection,
  PhotoSections,
  PhotoSection,
  PhotoPreview,
  PreviewImg,
  FileInput,
  FileLabel,
  FileInfo,
  CaptchaContainer,
  CaptchaLoading,
  CaptchaDisplay,
  CaptchaRefresh,
  UploadSection,
  UploadButton,
  Summary,
  SummaryItem,
  ErrorMessage,
  SuccessMessage,
  Navigation,
  PrimaryButton,
  SecondaryButton,
} from "../styles/Onboarding";

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
      <ProgressContainer>
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
        <ProgressText>
          Step {currentStep} of {totalSteps}
        </ProgressText>
      </ProgressContainer>
    );
  };

  renderStep1 = () => (
    <Step>
      <StepIcon>👋</StepIcon>
      <StepTitle>Welcome to Carpool!</StepTitle>
      <StepSubtitle>
        Let's start by getting your name. This helps other users identify you.
      </StepSubtitle>

      <InputGroup>
        <Label>What's your full name? *</Label>
        <Input
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={this.state.name}
          onChange={this.handleChange}
          maxLength="50"
        />
        <InputHint>
          Use your real name so other carpoolers can recognize you
        </InputHint>
      </InputGroup>
    </Step>
  );

  renderStep2 = () => (
    <Step>
      <StepIcon>📍</StepIcon>
      <StepTitle>Where are you located?</StepTitle>
      <StepSubtitle>
        This helps us connect you with nearby rides and carpoolers.
      </StepSubtitle>

      <InputGroup>
        <Label>Your home city *</Label>
        <Input
          type="text"
          name="location"
          placeholder="e.g., Honolulu, Hawaii"
          value={this.state.location}
          onChange={this.handleChange}
          maxLength="100"
        />
        <InputHint>Enter your city and state/country</InputHint>
      </InputGroup>
    </Step>
  );

  renderStep3 = () => (
    <Step>
      <StepIcon>🚗</StepIcon>
      <StepTitle>How do you carpool?</StepTitle>
      <StepSubtitle>
        Tell us if you drive, ride, or do both. You can change this later.
      </StepSubtitle>

      <UserTypeOptions>
        <UserTypeOption
          selected={this.state.userType === "Driver"}
          onClick={() => this.setState({ userType: "Driver" })}
        >
          <UserTypeIcon>🚙</UserTypeIcon>
          <UserTypeTitle>Driver</UserTypeTitle>
          <UserTypeDesc>I drive and offer rides</UserTypeDesc>
        </UserTypeOption>

        <UserTypeOption
          selected={this.state.userType === "Rider"}
          onClick={() => this.setState({ userType: "Rider" })}
        >
          <UserTypeIcon>🎒</UserTypeIcon>
          <UserTypeTitle>Rider</UserTypeTitle>
          <UserTypeDesc>I need rides from others</UserTypeDesc>
        </UserTypeOption>

        <UserTypeOption
          selected={this.state.userType === "Both"}
          onClick={() => this.setState({ userType: "Both" })}
        >
          <UserTypeIcon>🔄</UserTypeIcon>
          <UserTypeTitle>Both</UserTypeTitle>
          <UserTypeDesc>I drive sometimes and ride sometimes</UserTypeDesc>
        </UserTypeOption>
      </UserTypeOptions>

      <ContactSection>
        <h3>Contact Information (Optional)</h3>
        <InputGroup>
          <Label>Phone Number</Label>
          <Input
            type="tel"
            name="phone"
            placeholder="Your phone number"
            value={this.state.phone}
            onChange={this.handleChange}
          />
        </InputGroup>

        <InputGroup>
          <Label>Other Contact</Label>
          <Input
            type="text"
            name="other"
            placeholder="Email, social media, etc."
            value={this.state.other}
            onChange={this.handleChange}
          />
        </InputGroup>
      </ContactSection>
    </Step>
  );

  renderStep4 = () => (
    <Step>
      <StepIcon>📸</StepIcon>
      <StepTitle>Add some photos!</StepTitle>
      <StepSubtitle>
        Photos help build trust with other carpoolers. These are optional but
        recommended. Upload photos one at a time with security verification.
      </StepSubtitle>

      <PhotoSections>
        {/* Profile Photo */}
        <PhotoSection>
          <h3>Profile Photo</h3>
          {(this.state.profileImagePreview || this.state.profileImage) && (
            <PhotoPreview>
              <PreviewImg
                src={
                  this.state.profileImagePreview ||
                  (this.state.profileImage
                    ? `/image/${this.state.profileImage}`
                    : "")
                }
                alt="Profile preview"
              />
            </PhotoPreview>
          )}
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => this.handleImageSelect(e, "profile")}
            id="profile-upload"
            disabled={this.state.isUploadingProfile}
          />
          <FileLabel htmlFor="profile-upload">
            {this.state.profileImage
              ? "Change Profile Photo"
              : this.state.profileImagePreview
                ? "Upload This Photo"
                : "Add Profile Photo"}
          </FileLabel>

          {/* Profile Image Upload with Captcha */}
          {this.state.showProfileUpload && (
            <UploadSection>
              <CaptchaContainer>
                {this.state.isLoadingProfileCaptcha ? (
                  <CaptchaLoading>Loading...</CaptchaLoading>
                ) : (
                  <CaptchaDisplay
                    dangerouslySetInnerHTML={{
                      __html: this.state.profileCaptchaSvg,
                    }}
                  />
                )}
                <CaptchaRefresh
                  type="button"
                  onClick={this.generateProfileCaptcha}
                  disabled={
                    this.state.isLoadingProfileCaptcha ||
                    this.state.isUploadingProfile
                  }
                  title="Generate new code"
                >
                  <img src="/svg/refresh.svg" alt="Refresh" />
                </CaptchaRefresh>
              </CaptchaContainer>

              <InputGroup>
                <Input
                  type="text"
                  name="profileCaptchaInput"
                  placeholder="Enter security code"
                  value={this.state.profileCaptchaInput}
                  onChange={this.handleChange}
                  disabled={this.state.isUploadingProfile}
                />
              </InputGroup>

              <UploadButton
                type="button"
                onClick={this.uploadProfileImage}
                disabled={
                  this.state.isUploadingProfile ||
                  !this.state.profileCaptchaInput.trim()
                }
              >
                {this.state.isUploadingProfile
                  ? "Uploading..."
                  : "Upload Profile Photo"}
              </UploadButton>
            </UploadSection>
          )}
        </PhotoSection>

        {/* Vehicle Photo - Only show for Drivers */}
        {this.state.userType !== "Rider" && (
          <PhotoSection>
            <h3>Vehicle Photo</h3>
            {(this.state.rideImagePreview || this.state.rideImage) && (
              <PhotoPreview>
                <PreviewImg
                  src={
                    this.state.rideImagePreview ||
                    (this.state.rideImage
                      ? `/image/${this.state.rideImage}`
                      : "")
                  }
                  alt="Vehicle preview"
                />
              </PhotoPreview>
            )}
            <FileInput
              type="file"
              accept="image/*"
              onChange={(e) => this.handleImageSelect(e, "ride")}
              id="vehicle-upload"
              disabled={this.state.isUploadingRide}
            />
            <FileLabel htmlFor="vehicle-upload">
              {this.state.rideImage
                ? "Change Vehicle Photo"
                : this.state.rideImagePreview
                  ? "Upload This Photo"
                  : "Add Vehicle Photo"}
            </FileLabel>

            {/* Ride Image Upload with Captcha */}
            {this.state.showRideUpload && (
              <UploadSection>
                <CaptchaContainer>
                  {this.state.isLoadingRideCaptcha ? (
                    <CaptchaLoading>Loading...</CaptchaLoading>
                  ) : (
                    <CaptchaDisplay
                      dangerouslySetInnerHTML={{
                        __html: this.state.rideCaptchaSvg,
                      }}
                    />
                  )}
                  <CaptchaRefresh
                    type="button"
                    onClick={this.generateRideCaptcha}
                    disabled={
                      this.state.isLoadingRideCaptcha ||
                      this.state.isUploadingRide
                    }
                    title="Generate new code"
                  >
                    <img src="/svg/refresh.svg" alt="Refresh" />
                  </CaptchaRefresh>
                </CaptchaContainer>

                <InputGroup>
                  <Input
                    type="text"
                    name="rideCaptchaInput"
                    placeholder="Enter security code"
                    value={this.state.rideCaptchaInput}
                    onChange={this.handleChange}
                    disabled={this.state.isUploadingRide}
                  />
                </InputGroup>

                <UploadButton
                  type="button"
                  onClick={this.uploadRideImage}
                  disabled={
                    this.state.isUploadingRide ||
                    !this.state.rideCaptchaInput.trim()
                  }
                >
                  {this.state.isUploadingRide
                    ? "Uploading..."
                    : "Upload Vehicle Photo"}
                </UploadButton>
              </UploadSection>
            )}
          </PhotoSection>
        )}
      </PhotoSections>

      <FileInfo>Supported: JPEG, PNG, GIF, WebP (max 5MB each)</FileInfo>

      <Summary>
        <h3>Profile Summary</h3>
        <SummaryItem>
          <strong>Name:</strong> {this.state.name}
        </SummaryItem>
        <SummaryItem>
          <strong>Location:</strong> {this.state.location}
        </SummaryItem>
        <SummaryItem>
          <strong>User Type:</strong> {this.state.userType}
        </SummaryItem>
        {this.state.phone && (
          <SummaryItem>
            <strong>Phone:</strong> {this.state.phone}
          </SummaryItem>
        )}
        {this.state.profileImage && (
          <SummaryItem>
            <strong>Profile Photo:</strong> ✅ Uploaded
          </SummaryItem>
        )}
        {this.state.rideImage && (
          <SummaryItem>
            <strong>Vehicle Photo:</strong> ✅ Uploaded
          </SummaryItem>
        )}
      </Summary>
    </Step>
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
      <Container>
        <Header>
          <AppName>Carpool</AppName>
          {this.renderProgressBar()}
        </Header>

        <Content>
          {this.renderCurrentStep()}

          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}

          {this.state.success && (
            <SuccessMessage>{this.state.success}</SuccessMessage>
          )}

          <Navigation hasBackButton={currentStep > 1}>
            {currentStep > 1 && (
              <SecondaryButton onClick={this.prevStep} disabled={isSubmitting}>
                ← Back
              </SecondaryButton>
            )}

            {currentStep < totalSteps && (
              <PrimaryButton
                onClick={this.nextStep}
                disabled={!canProceed || isSubmitting}
              >
                Continue →
              </PrimaryButton>
            )}

            {currentStep === totalSteps && (
              <PrimaryButton
                onClick={this.handleFinish}
                disabled={!canProceed || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    {this.state.isUploadingProfile &&
                      "Uploading profile photo..."}
                    {this.state.isUploadingRide && "Uploading vehicle photo..."}
                    {!this.state.isUploadingProfile &&
                      !this.state.isUploadingRide &&
                      "Creating Profile..."}
                  </>
                ) : (
                  "🎉 Create My Profile!"
                )}
              </PrimaryButton>
            )}
          </Navigation>
        </Content>
      </Container>
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
