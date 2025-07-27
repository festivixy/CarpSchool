import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Profiles } from "../../../api/profile/Profile";
import {
  Container,
  Loading,
  Spinner,
  Header,
  AppName,
  Content,
  Copy,
  Title,
  Subtitle,
  Form,
  InputSection,
  Section,
  SectionTitle,
  Field,
  Label,
  Input,
  Select,
  FileInput,
  FileInfo,
  ImagePreview,
  PreviewImg,
  CaptchaContainer,
  CaptchaLoading,
  CaptchaDisplay,
  CaptchaRefreshIcon,
  UploadSection,
  UploadButton,
  Button,
  ErrorMessage,
  SuccessMessage,
  Links,
  StyledLink,
} from "../styles/EditProfile";

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
          .catch((_error) => {
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
          .catch((_error) => {
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
      return <Redirect to="/myRides" />;
    }

    if (!this.props.ready) {
      return (
        <Container>
          <Loading>
            <Spinner />
            <p>Loading profile...</p>
          </Loading>
        </Container>
      );
    }

    return (
      <Container>
        <Header>
          <AppName>Edit Profile</AppName>
        </Header>

        <Content>
          <Copy>
            <Title>Update your profile</Title>
            <Subtitle>Keep your information current and upload photos</Subtitle>
          </Copy>

          <Form onSubmit={this.handleSubmit}>
            <InputSection>
              {/* Basic Information */}
              <Section>
                <SectionTitle>Basic Information</SectionTitle>

                <Field>
                  <Label>Full Name *</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={this.state.name}
                    onChange={this.handleChange}
                    required
                  />
                </Field>

                <Field>
                  <Label>Location *</Label>
                  <Input
                    type="text"
                    name="location"
                    placeholder="Your home city"
                    value={this.state.location}
                    onChange={this.handleChange}
                    required
                  />
                </Field>

                <Field>
                  <Label>User Type</Label>
                  <Select
                    name="userType"
                    value={this.state.userType}
                    onChange={this.handleChange}
                  >
                    <option value="Driver">Driver</option>
                    <option value="Rider">Rider</option>
                    <option value="Both">Both</option>
                  </Select>
                </Field>
              </Section>

              {/* Contact Information */}
              <Section>
                <SectionTitle>Contact Information</SectionTitle>

                <Field>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Your phone number"
                    value={this.state.phone}
                    onChange={this.handleChange}
                  />
                </Field>

                <Field>
                  <Label>Other Contact</Label>
                  <Input
                    type="text"
                    name="other"
                    placeholder="Email, social media, etc."
                    value={this.state.other}
                    onChange={this.handleChange}
                  />
                </Field>
              </Section>

              {/* Profile Image Upload */}
              <Section>
                <SectionTitle>Profile Photo</SectionTitle>

                {(this.state.profileImagePreview ||
                  this.state.profileImage) && (
                  <ImagePreview>
                    <PreviewImg
                      src={
                        this.state.profileImagePreview ||
                        (this.state.profileImage
                          ? `/image/${this.state.profileImage}`
                          : "")
                      }
                      alt="Profile preview"
                    />
                  </ImagePreview>
                )}

                <Field>
                  <Label>Upload Profile Photo</Label>
                  <FileInput
                    type="file"
                    accept="image/*"
                    onChange={(e) => this.handleImageSelect(e, "profile")}
                    disabled={
                      this.state.isSubmitting || this.state.isUploadingProfile
                    }
                  />
                  <FileInfo>Supported: JPEG, PNG, GIF, WebP (max 5MB)</FileInfo>
                </Field>

                {/* Profile Image Upload with Captcha */}
                {this.state.showProfileUpload && (
                  <UploadSection>
                    <CaptchaContainer>
                      {this.state.isLoadingProfileCaptcha ? (
                        <CaptchaLoading>
                          Loading security code...
                        </CaptchaLoading>
                      ) : (
                        <CaptchaDisplay
                          dangerouslySetInnerHTML={{
                            __html: this.state.profileCaptchaSvg,
                          }}
                        />
                      )}
                      <CaptchaRefreshIcon
                        type="button"
                        onClick={this.generateProfileCaptcha}
                        disabled={
                          this.state.isLoadingProfileCaptcha ||
                          this.state.isUploadingProfile
                        }
                        title="Refresh security code"
                      >
                        <img src="/svg/refresh.svg" alt="Refresh" />
                      </CaptchaRefreshIcon>
                    </CaptchaContainer>

                    <Field>
                      <Input
                        type="text"
                        name="profileCaptchaInput"
                        placeholder="Enter the security code"
                        value={this.state.profileCaptchaInput}
                        onChange={this.handleChange}
                        disabled={this.state.isUploadingProfile}
                      />
                    </Field>

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
              </Section>

              {/* Ride Image Upload */}
              <Section>
                <SectionTitle>Vehicle Photo</SectionTitle>

                {(this.state.rideImagePreview || this.state.rideImage) && (
                  <ImagePreview>
                    <PreviewImg
                      src={
                        this.state.rideImagePreview ||
                        (this.state.rideImage
                          ? `/image/${this.state.rideImage}`
                          : "")
                      }
                      alt="Vehicle preview"
                    />
                  </ImagePreview>
                )}

                <Field>
                  <Label>Upload Vehicle Photo</Label>
                  <FileInput
                    type="file"
                    accept="image/*"
                    onChange={(e) => this.handleImageSelect(e, "ride")}
                    disabled={
                      this.state.isSubmitting || this.state.isUploadingRide
                    }
                  />
                  <FileInfo>Supported: JPEG, PNG, GIF, WebP (max 5MB)</FileInfo>
                </Field>

                {/* Ride Image Upload with Captcha */}
                {this.state.showRideUpload && (
                  <UploadSection>
                    <CaptchaContainer>
                      {this.state.isLoadingRideCaptcha ? (
                        <CaptchaLoading>
                          Loading security code...
                        </CaptchaLoading>
                      ) : (
                        <CaptchaDisplay
                          dangerouslySetInnerHTML={{
                            __html: this.state.rideCaptchaSvg,
                          }}
                        />
                      )}
                      <CaptchaRefreshIcon
                        type="button"
                        onClick={this.generateRideCaptcha}
                        disabled={
                          this.state.isLoadingRideCaptcha ||
                          this.state.isUploadingRide
                        }
                        title="Refresh security code"
                      >
                        <img src="/svg/refresh.svg" alt="Refresh" />
                      </CaptchaRefreshIcon>
                    </CaptchaContainer>

                    <Field>
                      <Input
                        type="text"
                        name="rideCaptchaInput"
                        placeholder="Enter the security code"
                        value={this.state.rideCaptchaInput}
                        onChange={this.handleChange}
                        disabled={this.state.isUploadingRide}
                      />
                    </Field>

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
              </Section>

              <Button
                type="submit"
                disabled={
                  this.state.isSubmitting ||
                  !this.state.name.trim() ||
                  !this.state.location.trim()
                }
              >
                {this.state.isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </InputSection>
          </Form>

          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}

          {this.state.success && (
            <SuccessMessage>{this.state.success}</SuccessMessage>
          )}

          <Links>
            <StyledLink to="/myRides">Back to Dashboard</StyledLink>
          </Links>
        </Content>
      </Container>
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
