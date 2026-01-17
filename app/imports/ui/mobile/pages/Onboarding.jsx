import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Profiles } from "../../../api/profile/Profile";
import { getImageUrl } from "../utils/imageUtils";
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
import Captcha from "../../components/Captcha";
import SchoolSelector from "../../components/SchoolSelector";
import { Spacer } from "../../components";

/**
 * Mobile Onboarding component - Interactive profile creation flow
 */
class MobileOnboarding extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.profileCaptchaRef = React.createRef();
    this.rideCaptchaRef = React.createRef();
    this.state = {
      currentStep: 1,
      totalSteps: 4, // Reduced from 5 since we removed the captcha step
      // Profile data
      name: "",
      selectedSchoolId: "",
      selectedSchoolName: "",
      userType: "Driver",
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
      showProfileUpload: false,
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
        return this.state.selectedSchoolId.trim().length > 0;
      case 3:
        return true; // User type selection is optional
      case 4:
        return true; // Final step - ready to finish
      default:
        return false;
    }
  };

  // Convert file to base64
  fileToBase64 = (file) => new Promise((resolve, reject) => {
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
          showProfileUpload: true,
        });
      } else {
        this.setState({
          selectedRideImage: file,
          rideImagePreview: event.target.result,
          showRideUpload: true,
        });
      }
    };
    reader.readAsDataURL(file);

    this.setState({ error: "" });
  };

  uploadProfileImage = () => {
    const { selectedProfileImage } = this.state;

    if (!selectedProfileImage) {
      this.setState({ error: "Please select an image to upload." });
      return;
    }

    if (!this.profileCaptchaRef.current) {
      this.setState({ error: "Captcha component not available." });
      return;
    }

    // Ensure user is logged in
    const user = Meteor.user();
    if (!user || !user._id) {
      this.setState({ error: "You must be logged in to upload images." });
      return;
    }

    this.setState({ isUploadingProfile: true, error: "" });

    this.profileCaptchaRef.current.verify((captchaError, isValid) => {
      if (!this._isMounted) return;

      if (captchaError || !isValid) {
        this.setState({
          error: captchaError || "Invalid security code. Please try again.",
          isUploadingProfile: false,
        });
        return;
      }

      const captchaData = this.profileCaptchaRef.current.getCaptchaData();

      this.fileToBase64(selectedProfileImage)
        .then((base64Data) => {
          const imageData = {
            fileName: selectedProfileImage.name,
            mimeType: selectedProfileImage.type,
            base64Data,
          };

          // Privacy options for profile image - private to user and their school
          const privacyOptions = {
            private: false,
            school: this.state.selectedSchoolId,
            user: user._id,
          };

          Meteor.call(
            "images.upload",
            imageData,
            captchaData.sessionId,
            privacyOptions,
            (err, result) => {
              if (!this._isMounted) return;

              if (err) {
                this.setState({
                  error:
                    err.reason ||
                    "Failed to upload profile image. Please try again.",
                  isUploadingProfile: false,
                });
              } else {
                this.setState({
                  profileImage: result.uuid,
                  selectedProfileImage: null,
                  profileImagePreview: null,
                  showProfileUpload: false,
                  isUploadingProfile: false,
                });
                // Reset captcha
                this.profileCaptchaRef.current.reset();
              }
            },
          );
        })
        .catch((_error) => {
          if (!this._isMounted) return;
          this.setState({
            error: "Failed to process profile image. Please try again.",
            isUploadingProfile: false,
          });
        });
    });
  };

  uploadRideImage = () => {
    const { selectedRideImage } = this.state;

    if (!selectedRideImage) {
      this.setState({ error: "Please select an image to upload." });
      return;
    }

    if (!this.rideCaptchaRef.current) {
      this.setState({ error: "Captcha component not available." });
      return;
    }

    // Ensure user is logged in
    const user = Meteor.user();
    if (!user || !user._id) {
      this.setState({ error: "You must be logged in to upload images." });
      return;
    }

    this.setState({ isUploadingRide: true, error: "" });

    this.rideCaptchaRef.current.verify((captchaError, isValid) => {
      if (!this._isMounted) return;

      if (captchaError || !isValid) {
        this.setState({
          error: captchaError || "Invalid security code. Please try again.",
          isUploadingRide: false,
        });
        return;
      }

      const captchaData = this.rideCaptchaRef.current.getCaptchaData();

      this.fileToBase64(selectedRideImage)
        .then((base64Data) => {
          const imageData = {
            fileName: selectedRideImage.name,
            mimeType: selectedRideImage.type,
            base64Data,
          };

          // Privacy options for vehicle image - private to user and their school
          const privacyOptions = {
            private: false,
            school: this.state.selectedSchoolId,
            user: user._id,
          };

          Meteor.call(
            "images.upload",
            imageData,
            captchaData.sessionId,
            privacyOptions,
            (err, result) => {
              if (!this._isMounted) return;

              if (err) {
                this.setState({
                  error:
                    err.reason ||
                    "Failed to upload vehicle image. Please try again.",
                  isUploadingRide: false,
                });
              } else {
                this.setState({
                  rideImage: result.uuid,
                  selectedRideImage: null,
                  rideImagePreview: null,
                  showRideUpload: false,
                  isUploadingRide: false,
                });
                // Reset captcha
                this.rideCaptchaRef.current.reset();
              }
            },
          );
        })
        .catch((_error) => {
          if (!this._isMounted) return;
          this.setState({
            error: "Failed to process vehicle image. Please try again.",
            isUploadingRide: false,
          });
        });
    });
  };

  handleSchoolSelect = (schoolId, school) => {
    this.setState({
      selectedSchoolId: schoolId,
      selectedSchoolName: school.name,
      error: "", // Clear any previous errors
    });
  };

  renderSchoolSelector = () => {
    const userEmail = this.props.currentUser?.emails?.[0]?.address;

    return (
      <SchoolSelector
        userEmail={userEmail}
        selectedSchoolId={this.state.selectedSchoolId}
        onSchoolSelect={this.handleSchoolSelect}
      />
    );
  };

  handleFinish = () => {
    const { name, selectedSchoolId, userType, phone, other, profileImage, rideImage } =
      this.state;

    // Ensure user is logged in
    const user = Meteor.user();
    if (!user || !user._id) {
      this.setState({ error: "You must be logged in to complete onboarding." });
      return;
    }

    this.setState({ isSubmitting: true, error: "", success: "" });

    // First, assign the school to the user account
    Meteor.call("accounts.onboarding.assignSchool", selectedSchoolId, (schoolError) => {
      if (!this._isMounted) return;

      if (schoolError) {
        this.setState({
          isSubmitting: false,
          error: schoolError.reason || schoolError.message || "Failed to assign school"
        });
        return;
      }

      // Then create the profile
      const profileData = {
        Name: name,
        Location: "Not specified", // Will be set in profile edit later
        Image: profileImage,
        Ride: rideImage,
        Phone: phone,
        Other: other,
        UserType: userType,
        verified: false,        // New users need admin approval
        requested: true,        // Request admin approval
        rejected: false,        // Not rejected yet
        Owner: user._id,
      };

      // Insert new profile
      Meteor.call("profiles.create", profileData, (profileError) => {
        if (!this._isMounted) return;
        this.setState({ isSubmitting: false });
        if (profileError) {
          this.setState({ error: profileError.reason || profileError.message });
        } else {
          this.setState({
            success:
              "Welcome to CarpSchool! Your profile has been created successfully! Waiting for admin approval...",
            redirectToReferer: "/waiting-confirmation",
          });
        }
      });
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
      <StepTitle>Welcome to CarpSchool!</StepTitle>
      <StepSubtitle>
        Let&apos;s start by getting your name. This helps other users identify
        you.
      </StepSubtitle>

      <InputGroup>
        <Label>What&apos;s your full name? *</Label>
        <Input
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={this.state.name}
          onChange={this.handleChange}
          maxLength="50"
        />
        <InputHint>
          Use your real name so other ride sharers can recognize you
        </InputHint>
      </InputGroup>
    </Step>
  );

  renderStep2 = () => (
    <Step>
      <StepTitle>Select Your School</StepTitle>
      <StepSubtitle>
        Choose your educational institution to connect with fellow students.
      </StepSubtitle>

      <div style={{ marginTop: "20px" }}>
        {/* School selection will be rendered here */}
        {this.renderSchoolSelector()}
      </div>
    </Step>
  );

  renderStep3 = () => (
    <Step>
      <StepTitle>How do you ride share?</StepTitle>
      <StepSubtitle>
        Tell us if you drive or need rides. You can change this later.
      </StepSubtitle>

      <UserTypeOptions>
        <UserTypeOption
          selected={this.state.userType === "Driver"}
          onClick={() => this.setState({ userType: "Driver" })}
        >
          <UserTypeTitle>Driver</UserTypeTitle>
          <UserTypeDesc>I drive and offer rides</UserTypeDesc>
        </UserTypeOption>

        <UserTypeOption
          selected={this.state.userType === "Rider"}
          onClick={() => this.setState({ userType: "Rider" })}
        >
          <UserTypeTitle>Rider</UserTypeTitle>
          <UserTypeDesc>I need rides from others</UserTypeDesc>
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
      <StepTitle>Add some photos!</StepTitle>
      <StepSubtitle>
        Photos help build trust with other ride sharers. These are optional but
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
                  getImageUrl(this.state.profileImage)
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
            {this.state.profileImage // eslint-disable-line
              ? "Change Profile Photo"
              : this.state.profileImagePreview
                ? "Upload This Photo"
                : "Add Profile Photo"}
          </FileLabel>

          {/* Profile Image Upload with Captcha */}
          {this.state.showProfileUpload && (
            <UploadSection>
              <Captcha
                ref={this.profileCaptchaRef}
                autoGenerate={true}
                disabled={this.state.isUploadingProfile}
              />

              <UploadButton
                type="button"
                onClick={this.uploadProfileImage}
                disabled={this.state.isUploadingProfile}
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
                  getImageUrl(this.state.rideImage)
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
              {this.state.rideImage // eslint-disable-line
                ? "Change Vehicle Photo"
                : this.state.rideImagePreview
                  ? "Upload This Photo"
                  : "Add Vehicle Photo"}
            </FileLabel>

            {/* Ride Image Upload with Captcha */}
            {this.state.showRideUpload && (
              <UploadSection>
                <Captcha
                  ref={this.rideCaptchaRef}
                  autoGenerate={true}
                  disabled={this.state.isUploadingRide}
                />

                <UploadButton
                  type="button"
                  onClick={this.uploadRideImage}
                  disabled={this.state.isUploadingRide}
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
          <strong>School:</strong> {this.state.selectedSchoolName}
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
      // Check if it's a specific redirect path
      if (typeof this.state.redirectToReferer === "string") {
        return <Redirect to={this.state.redirectToReferer} />;
      }
      // Default redirect for existing users
      return <Redirect to="/verify" />;
    }

    const { currentStep, totalSteps, isSubmitting } = this.state;
    const canProceed = this.validateStep(currentStep);

    return (
      <Container>
        <Header>
          <AppName>CarpSchool</AppName>
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
                  "Create My Profile!"
                )}
              </PrimaryButton>
            )}
          </Navigation>

          <Spacer />
        </Content>
      </Container>
    );
  }
}

MobileOnboarding.propTypes = {
  profileData: PropTypes.object,
  currentUser: PropTypes.object,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const profileSubscription = Meteor.subscribe("profiles.mine");
  const profileData = Profiles.findOne({ Owner: Meteor.userId() });
  const currentUser = Meteor.user();

  return {
    profileData,
    currentUser,
    loading: !profileSubscription.ready(),
  };
})(MobileOnboarding);
