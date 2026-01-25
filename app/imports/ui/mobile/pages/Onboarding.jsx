import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { withTracker } from "meteor/react-meteor-data";
import { Profiles } from "../../../api/profile/Profile";
import { getImageUrl } from "../utils/imageUtils";
import { useClerkUser } from "../../utils/clerkAuth";
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
  StepTitle,
  StepSubtitle,
  InputGroup,
  Label,
  Input,
  InputHint,
  UserTypeOptions,
  UserTypeOption,
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
import LoadingPage from "../../components/LoadingPage";

/**
 * Mobile Onboarding component - Interactive profile creation flow
 * Uses Clerk for authentication
 */
function MobileOnboarding({ profileData, loading }) {
  const { isLoaded, isSignedIn, meteorUser } = useClerkUser();
  const profileCaptchaRef = React.useRef(null);
  const rideCaptchaRef = React.useRef(null);

  const [currentStep, setCurrentStep] = React.useState(1);
  const [totalSteps] = React.useState(4);
  const [name, setName] = React.useState("");
  const [selectedSchoolId, setSelectedSchoolId] = React.useState("");
  const [selectedSchoolName, setSelectedSchoolName] = React.useState("");
  const [userType, setUserType] = React.useState("Driver");
  const [phone, setPhone] = React.useState("");
  const [other, setOther] = React.useState("");
  const [profileImage, setProfileImage] = React.useState("");
  const [rideImage, setRideImage] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [redirectToReferer, setRedirectToReferer] = React.useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = React.useState(null);
  const [selectedRideImage, setSelectedRideImage] = React.useState(null);
  const [profileImagePreview, setProfileImagePreview] = React.useState(null);
  const [rideImagePreview, setRideImagePreview] = React.useState(null);
  const [isUploadingProfile, setIsUploadingProfile] = React.useState(false);
  const [isUploadingRide, setIsUploadingRide] = React.useState(false);
  const [showProfileUpload, setShowProfileUpload] = React.useState(false);
  const [showRideUpload, setShowRideUpload] = React.useState(false);

  React.useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setRedirectToReferer("/login");
      return;
    }

    if (profileData) {
      if (meteorUser?.schoolId) {
        setRedirectToReferer(true);
      } else {
        setCurrentStep(2);
        setName(profileData.Name || "");
        setUserType(profileData.UserType || "Driver");
        setPhone(profileData.Phone || "");
        setOther(profileData.Other || "");
      }
    }
  }, [isLoaded, isSignedIn, profileData, meteorUser]);

  const handleChange = (e) => {
    const { name: fieldName, value } = e.target;
    if (fieldName === "name") setName(value);
    if (fieldName === "phone") setPhone(value);
    if (fieldName === "other") setOther(value);
    setError("");
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return name.trim().length >= 2;
      case 2:
        return selectedSchoolId.trim().length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });

  const handleImageSelect = (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (imageType === "profile") {
        setSelectedProfileImage(file);
        setProfileImagePreview(event.target.result);
        setShowProfileUpload(true);
      } else {
        setSelectedRideImage(file);
        setRideImagePreview(event.target.result);
        setShowRideUpload(true);
      }
    };
    reader.readAsDataURL(file);
    setError("");
  };

  const uploadProfileImage = () => {
    if (!selectedProfileImage) {
      setError("Please select an image to upload.");
      return;
    }

    if (!profileCaptchaRef.current) {
      setError("Captcha component not available.");
      return;
    }

    if (!meteorUser?._id) {
      setError("You must be logged in to upload images.");
      return;
    }

    setIsUploadingProfile(true);
    setError("");

    profileCaptchaRef.current.verify((captchaError, isValid) => {
      if (captchaError || !isValid) {
        setError(captchaError || "Invalid security code. Please try again.");
        setIsUploadingProfile(false);
        return;
      }

      const captchaData = profileCaptchaRef.current.getCaptchaData();

      fileToBase64(selectedProfileImage)
        .then((base64Data) => {
          const imageData = {
            fileName: selectedProfileImage.name,
            mimeType: selectedProfileImage.type,
            base64Data,
          };

          const privacyOptions = {
            private: false,
            school: selectedSchoolId,
            user: meteorUser._id,
          };

          Meteor.call(
            "images.upload",
            imageData,
            captchaData.sessionId,
            privacyOptions,
            (err, result) => {
              if (err) {
                setError(err.reason || "Failed to upload profile image.");
                setIsUploadingProfile(false);
              } else {
                setProfileImage(result.uuid);
                setSelectedProfileImage(null);
                setProfileImagePreview(null);
                setShowProfileUpload(false);
                setIsUploadingProfile(false);
                profileCaptchaRef.current.reset();
              }
            }
          );
        })
        .catch(() => {
          setError("Failed to process profile image.");
          setIsUploadingProfile(false);
        });
    });
  };

  const uploadRideImage = () => {
    if (!selectedRideImage) {
      setError("Please select an image to upload.");
      return;
    }

    if (!rideCaptchaRef.current) {
      setError("Captcha component not available.");
      return;
    }

    if (!meteorUser?._id) {
      setError("You must be logged in to upload images.");
      return;
    }

    setIsUploadingRide(true);
    setError("");

    rideCaptchaRef.current.verify((captchaError, isValid) => {
      if (captchaError || !isValid) {
        setError(captchaError || "Invalid security code.");
        setIsUploadingRide(false);
        return;
      }

      const captchaData = rideCaptchaRef.current.getCaptchaData();

      fileToBase64(selectedRideImage)
        .then((base64Data) => {
          const imageData = {
            fileName: selectedRideImage.name,
            mimeType: selectedRideImage.type,
            base64Data,
          };

          const privacyOptions = {
            private: false,
            school: selectedSchoolId,
            user: meteorUser._id,
          };

          Meteor.call(
            "images.upload",
            imageData,
            captchaData.sessionId,
            privacyOptions,
            (err, result) => {
              if (err) {
                setError(err.reason || "Failed to upload vehicle image.");
                setIsUploadingRide(false);
              } else {
                setRideImage(result.uuid);
                setSelectedRideImage(null);
                setRideImagePreview(null);
                setShowRideUpload(false);
                setIsUploadingRide(false);
                rideCaptchaRef.current.reset();
              }
            }
          );
        })
        .catch(() => {
          setError("Failed to process vehicle image.");
          setIsUploadingRide(false);
        });
    });
  };

  const handleSchoolSelect = (schoolId, school) => {
    setSelectedSchoolId(schoolId);
    setSelectedSchoolName(school.name);
    setError("");
  };

  const handleFinish = () => {
    if (!meteorUser?._id) {
      setError("You must be logged in to complete onboarding.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    Meteor.call("clerk.assignSchool", selectedSchoolId, (schoolError) => {
      if (schoolError) {
        setError(schoolError.reason || "Failed to assign school");
        setIsSubmitting(false);
        return;
      }

      const profileDataObj = {
        name,
        userType,
        phone,
        other,
      };

      Meteor.call("clerk.completeOnboarding", profileDataObj, (profileError) => {
        setIsSubmitting(false);
        if (profileError) {
          setError(profileError.reason || profileError.message);
        } else {
          setSuccess("Welcome to CarpSchool! Your profile has been created successfully!");
          setRedirectToReferer("/waiting-confirmation");
        }
      });
    });
  };

  const renderProgressBar = () => {
    const progress = (currentStep / totalSteps) * 100;
    return (
      <ProgressContainer>
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
        <ProgressText>Step {currentStep} of {totalSteps}</ProgressText>
      </ProgressContainer>
    );
  };

  const renderStep1 = () => (
    <Step>
      <StepTitle>Welcome to CarpSchool!</StepTitle>
      <StepSubtitle>Let&apos;s start by getting your name.</StepSubtitle>
      <InputGroup>
        <Label>What&apos;s your full name? *</Label>
        <Input
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={name}
          onChange={handleChange}
          maxLength="50"
        />
        <InputHint>Use your real name so other ride sharers can recognize you</InputHint>
      </InputGroup>
    </Step>
  );

  const renderStep2 = () => (
    <Step>
      <StepTitle>Select Your School</StepTitle>
      <StepSubtitle>Choose your educational institution.</StepSubtitle>
      <div style={{ marginTop: "20px" }}>
        <SchoolSelector
          userEmail={meteorUser?.emails?.[0]?.address || ""}
          selectedSchoolId={selectedSchoolId}
          onSchoolSelect={handleSchoolSelect}
        />
      </div>
    </Step>
  );

  const renderStep3 = () => (
    <Step>
      <StepTitle>How do you ride share?</StepTitle>
      <StepSubtitle>Tell us if you drive, ride, or both.</StepSubtitle>
      <UserTypeOptions>
        <UserTypeOption selected={userType === "Driver"} onClick={() => setUserType("Driver")}>
          <UserTypeTitle>Driver Only</UserTypeTitle>
          <UserTypeDesc>I drive and offer rides</UserTypeDesc>
        </UserTypeOption>
        <UserTypeOption selected={userType === "Rider"} onClick={() => setUserType("Rider")}>
          <UserTypeTitle>Rider Only</UserTypeTitle>
          <UserTypeDesc>I need rides from others</UserTypeDesc>
        </UserTypeOption>
        <UserTypeOption selected={userType === "Both"} onClick={() => setUserType("Both")}>
          <UserTypeTitle>Both</UserTypeTitle>
          <UserTypeDesc>I drive and also need rides</UserTypeDesc>
        </UserTypeOption>
      </UserTypeOptions>
      <ContactSection>
        <h3>Contact Information (Optional)</h3>
        <InputGroup>
          <Label>Phone Number</Label>
          <Input type="tel" name="phone" placeholder="Your phone number" value={phone} onChange={handleChange} />
        </InputGroup>
        <InputGroup>
          <Label>Other Contact</Label>
          <Input type="text" name="other" placeholder="Email, social media, etc." value={other} onChange={handleChange} />
        </InputGroup>
      </ContactSection>
    </Step>
  );

  const renderStep4 = () => (
    <Step>
      <StepTitle>Add some photos!</StepTitle>
      <StepSubtitle>Photos help build trust.</StepSubtitle>
      <PhotoSections>
        <PhotoSection>
          <h3>Profile Photo</h3>
          {(profileImagePreview || profileImage) && (
            <PhotoPreview>
              <PreviewImg src={profileImagePreview || getImageUrl(profileImage)} alt="Profile preview" />
            </PhotoPreview>
          )}
          <FileInput type="file" accept="image/*" onChange={(e) => handleImageSelect(e, "profile")} id="profile-upload" disabled={isUploadingProfile} />
          <FileLabel htmlFor="profile-upload">
            {profileImage ? "Change Profile Photo" : profileImagePreview ? "Upload This Photo" : "Add Profile Photo"}
          </FileLabel>
          {showProfileUpload && (
            <UploadSection>
              <Captcha ref={profileCaptchaRef} autoGenerate={true} disabled={isUploadingProfile} />
              <UploadButton type="button" onClick={uploadProfileImage} disabled={isUploadingProfile}>
                {isUploadingProfile ? "Uploading..." : "Upload Profile Photo"}
              </UploadButton>
            </UploadSection>
          )}
        </PhotoSection>
        {userType !== "Rider" && (
          <PhotoSection>
            <h3>Vehicle Photo</h3>
            {(rideImagePreview || rideImage) && (
              <PhotoPreview>
                <PreviewImg src={rideImagePreview || getImageUrl(rideImage)} alt="Vehicle preview" />
              </PhotoPreview>
            )}
            <FileInput type="file" accept="image/*" onChange={(e) => handleImageSelect(e, "ride")} id="vehicle-upload" disabled={isUploadingRide} />
            <FileLabel htmlFor="vehicle-upload">
              {rideImage ? "Change Vehicle Photo" : rideImagePreview ? "Upload This Photo" : "Add Vehicle Photo"}
            </FileLabel>
            {showRideUpload && (
              <UploadSection>
                <Captcha ref={rideCaptchaRef} autoGenerate={true} disabled={isUploadingRide} />
                <UploadButton type="button" onClick={uploadRideImage} disabled={isUploadingRide}>
                  {isUploadingRide ? "Uploading..." : "Upload Vehicle Photo"}
                </UploadButton>
              </UploadSection>
            )}
          </PhotoSection>
        )}
      </PhotoSections>
      <FileInfo>Supported: JPEG, PNG, GIF, WebP (max 5MB each)</FileInfo>
      <Summary>
        <h3>Profile Summary</h3>
        <SummaryItem><strong>Name:</strong> {name}</SummaryItem>
        <SummaryItem><strong>School:</strong> {selectedSchoolName}</SummaryItem>
        <SummaryItem><strong>User Type:</strong> {userType}</SummaryItem>
        {phone && <SummaryItem><strong>Phone:</strong> {phone}</SummaryItem>}
        {profileImage && <SummaryItem><strong>Profile Photo:</strong> Uploaded</SummaryItem>}
        {rideImage && <SummaryItem><strong>Vehicle Photo:</strong> Uploaded</SummaryItem>}
      </Summary>
    </Step>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  if (!isLoaded || loading) {
    return <LoadingPage message="Loading..." />;
  }

  if (redirectToReferer) {
    if (typeof redirectToReferer === "string") {
      return <Redirect to={redirectToReferer} />;
    }
    return <Redirect to="/verify" />;
  }

  const canProceed = validateStep(currentStep);

  return (
    <Container>
      <Header>
        <AppName>CarpSchool</AppName>
        {renderProgressBar()}
      </Header>
      <Content>
        {renderCurrentStep()}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        <Navigation hasBackButton={currentStep > 1}>
          {currentStep > 1 && (
            <SecondaryButton onClick={prevStep} disabled={isSubmitting}>Back</SecondaryButton>
          )}
          {currentStep < totalSteps && (
            <PrimaryButton onClick={nextStep} disabled={!canProceed || isSubmitting}>Continue</PrimaryButton>
          )}
          {currentStep === totalSteps && (
            <PrimaryButton onClick={handleFinish} disabled={!canProceed || isSubmitting}>
              {isSubmitting ? "Creating Profile..." : "Create My Profile!"}
            </PrimaryButton>
          )}
        </Navigation>
        <Spacer />
      </Content>
    </Container>
  );
}

MobileOnboarding.propTypes = {
  profileData: PropTypes.object,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const profileSubscription = Meteor.subscribe("profiles.mine");
  const profileData = Profiles.findOne({ Owner: Meteor.userId() });
  return {
    profileData,
    loading: !profileSubscription.ready(),
  };
})(MobileOnboarding);
