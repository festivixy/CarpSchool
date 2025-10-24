import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Profiles } from "../../api/profile/Profile";
import { getImageUrl } from "../mobile/utils/imageUtils";
import { ProfileSkeleton } from "../skeleton";
import {
  Container,
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
  UploadSection,
  UploadButton,
  Button,
  RoleChangeButton,
  ReverifyWarning,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalClose,
  ModalBody,
  ModalText,
  ConfirmButtonContainer,
  ConfirmButton,
  ConfirmProgress,
  ConfirmText,
  CancelButton,
  ErrorMessage,
  SuccessMessage,
  Links,
  StyledLink,
} from "../styles/EditProfile";
import Captcha from "../components/Captcha";
import { Spacer } from "../components";
import BackButton from "../mobile/components/BackButton";

/**
 * Mobile EditProfile component with modern design, image upload, and CAPTCHA validation
 */
class MobileEditProfile extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.profileCaptchaRef = React.createRef();
    this.rideCaptchaRef = React.createRef();
    this.state = {
      name: "",
      location: "",
      profileImage: "",
      rideImage: "",
      phone: "",
      other: "",
      userType: "Driver",
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
      // Role change confirmation states
      showRoleConfirmModal: false,
      isConfirmingRole: false,
      confirmProgress: 0,
      confirmTimer: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.populateExistingData();
  }

  componentWillUnmount() {
    this._isMounted = false;
    // Clean up any running timers
    if (this.state.confirmTimer) {
      clearInterval(this.state.confirmTimer);
    }
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
        userType: profile.UserType || "Driver",
      });
    }
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
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

    this.setState({ isUploadingProfile: true, error: "" });

    // First verify CAPTCHA using centralized component
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

      // CAPTCHA is valid, proceed with upload
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
            school: this.props.profileData?.SchoolId,
            user: Meteor.user()._id,
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
                    success: "Profile image uploaded successfully!",
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

    this.setState({ isUploadingRide: true, error: "" });

    // First verify CAPTCHA using centralized component
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

      // CAPTCHA is valid, proceed with upload
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
            school: this.props.profileData?.SchoolId,
            user: Meteor.user()._id,
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
                  success: "Vehicle image uploaded successfully!",
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

  handleSubmit = (e) => {
    e.preventDefault();
    this.submit();
  };

  // Handle role change button click
  handleRoleChangeClick = () => {
    this.setState({ showRoleConfirmModal: true });
  };

  // Handle role change confirmation start
  handleConfirmStart = () => {
    this.setState({
      isConfirmingRole: true,
      confirmProgress: 0
    });

    const timer = setInterval(() => {
      this.setState(prevState => {
        const newProgress = prevState.confirmProgress + (100 / 30); // 3 seconds = 30 intervals of 100ms

        if (newProgress >= 100) {
          clearInterval(timer);
          this.confirmRoleChange();
          return {
            confirmProgress: 100,
            confirmTimer: null,
          };
        }

        return { confirmProgress: newProgress };
      });
    }, 100);

    this.setState({ confirmTimer: timer });
  };

  // Handle role change confirmation end
  handleConfirmEnd = () => {
    if (this.state.confirmTimer) {
      clearInterval(this.state.confirmTimer);
    }
    this.setState({
      isConfirmingRole: false,
      confirmProgress: 0,
      confirmTimer: null,
    });
  };

  // Handle role change confirmation completion
  confirmRoleChange = () => {
    const { userType } = this.state;

    this.setState({
      isConfirmingRole: false,
      showRoleConfirmModal: false,
      confirmProgress: 0,
      confirmTimer: null,
      error: "",
      success: "",
    });

    // Update only the user type in the profile
    const existingProfile = this.props.profileData;
    if (existingProfile) {
      Profiles.update(
        existingProfile._id,
        { $set: { UserType: userType } },
        (error) => {
          if (!this._isMounted) return;
          if (error) {
            this.setState({ error: error.message });
          } else {
            this.setState({
              success: "Role changed successfully! Please reverify your account.",
            });
          }
        }
      );
    }
  };

  // Handle modal close
  handleModalClose = () => {
    this.handleConfirmEnd();
    this.setState({ showRoleConfirmModal: false });
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
      // UserType is handled separately
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
      return <Redirect to="/my-rides" />;
    }

    if (!this.props.ready) {
      return <ProfileSkeleton />;
    }

    return (
      <Container>
        <BackButton />
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
                        getImageUrl(this.state.profileImage)
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
              </Section>

              {/* Ride Image Upload */}
              <Section>
                <SectionTitle>Vehicle Photo</SectionTitle>

                {(this.state.rideImagePreview || this.state.rideImage) && (
                  <ImagePreview>
                    <PreviewImg
                      src={
                        this.state.rideImagePreview ||
                        getImageUrl(this.state.rideImage)
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

              {/* Role Change Section */}
              <Section>
                <SectionTitle>Change Role</SectionTitle>

                <Field>
                  <Label>User Type</Label>
                  <Select
                    name="userType"
                    value={this.state.userType}
                    onChange={this.handleChange}
                  >
                    <option value="Driver">Driver</option>
                    <option value="Rider">Rider</option>
                  </Select>
                </Field>

                <RoleChangeButton
                  type="button"
                  onClick={this.handleRoleChangeClick}
                >
                  Save Role Change
                </RoleChangeButton>

                <ReverifyWarning>
                  ⚠️ You need to reverify your account to change role
                </ReverifyWarning>
              </Section>
            </InputSection>
          </Form>

          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}

          {this.state.success && (
            <SuccessMessage>{this.state.success}</SuccessMessage>
          )}

          <Links>
            <StyledLink to="/my-rides">Back to Dashboard</StyledLink>
          </Links>

          <Spacer height={96} />
        </Content>

        {/* Role Change Confirmation Modal */}
        {this.state.showRoleConfirmModal && (
          <ModalOverlay onClick={this.handleModalClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Confirm Role Change</ModalTitle>
                <ModalClose onClick={this.handleModalClose}>×</ModalClose>
              </ModalHeader>

              <ModalBody>
                <ModalText>
                  You are about to change your role to <strong>{this.state.userType}</strong>.
                  This action requires account reverification.
                </ModalText>

                <ConfirmButtonContainer>
                  <ConfirmButton
                    onMouseDown={this.handleConfirmStart}
                    onMouseUp={this.handleConfirmEnd}
                    onMouseLeave={this.handleConfirmEnd}
                    onTouchStart={this.handleConfirmStart}
                    onTouchEnd={this.handleConfirmEnd}
                    disabled={this.state.isConfirmingRole && this.state.confirmProgress >= 100}
                  >
                    <ConfirmProgress progress={this.state.confirmProgress} />
                    <ConfirmText>
                      {this.state.isConfirmingRole
                        ? `Hold to confirm... ${Math.ceil((100 - this.state.confirmProgress) / 33.33)}s`
                        : "Hold for 3 seconds to confirm"
                      }
                    </ConfirmText>
                  </ConfirmButton>
                </ConfirmButtonContainer>

                <CancelButton onClick={this.handleModalClose}>
                  Cancel
                </CancelButton>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}
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
    currentUser: Meteor.user() ? Meteor.user()._id : "",
    ready: subscription.ready(),
  };
})(MobileEditProfile);
