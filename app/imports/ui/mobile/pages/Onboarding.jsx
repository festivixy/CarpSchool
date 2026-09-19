import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Redirect } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Profiles } from "../../../api/profile/Profile";
import { Schools } from "../../../api/schools/Schools";
import { getImageUrl } from "../utils/imageUtils";
import { useClerkUser } from "../../utils/clerkAuth";
import Icon from "../../components/Icon";
import Logo from "../../components/Logo";
import Avatar from "../../components/Avatar";
import Captcha from "../../components/Captcha";
import LoadingPage from "../../components/LoadingPage";
import { Spacer } from "../../components";
import {
  Container,
  BrandPanel,
  BrandMap,
  BrandInner,
  BrandFoot,
  BrandEyebrow,
  BrandTitle,
  Mark,
  BrandCopy,
  ProofPanel,
  ProofTile,
  ProofBody,
  ProofPrimary,
  ProofSecondary,
  FormPane,
  Content,
  StepRow,
  StepBadge,
  StepConnector,
  StepEyebrow,
  StepTitle,
  StepSubtitle,
  Step,
  Field,
  FieldRow,
  Label,
  Input,
  ReadOnlyInput,
  InputHint,
  SelectWrap,
  Select,
  SelectChevron,
  InfoRow,
  InfoTile,
  InfoBody,
  InfoTitle,
  InfoDesc,
  InfoMono,
  NotePill,
  NoteIcon,
  SchoolList,
  SchoolOption,
  SchoolCode,
  SchoolEmpty,
  ConsentRow,
  ConsentCheck,
  ConsentText,
  UserTypeOptions,
  UserTypeOption,
  RoleIconTile,
  RoleBody,
  UserTypeTitle,
  UserTypeDesc,
  RoleRadio,
  PreviewImg,
  FileInput,
  UploadBtn,
  UploadSection,
  UploadButton,
  FileInfo,
  ErrorMessage,
  SuccessMessage,
  Navigation,
  PrimaryButton,
  SecondaryButton,
} from "../styles/Onboarding";
import { hueFor } from "../../utils/avatarHue";

const TOTAL_STEPS = 3;

/* Step 1 confirms rather than collects: Clerk owns the credentials and
 * ClerkLoginHandler already derived the school from the verified email
 * domain before the user reaches this route. */
const STEPS = [
  { n: 1, sub: "School verification", lead: "Confirm your ", mark: "school email." },
  { n: 2, sub: "Name and year", lead: "Tell us a bit ", mark: "about you." },
  { n: 3, sub: "Driver, rider, or both", lead: "Will you mostly ", mark: "drive or ride?" },
];

const STEP_2_SUBTITLE = "This shows up on your rides so drivers know who they're picking up.";

/* Mirrors the ProfileSchema enum, which is authoritative. */
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Faculty/Staff"];

/* ids map 1:1 onto ProfileSchema's UserType enum. */
const ROLES = [
  { id: "Rider", title: "Mostly riding", desc: "Find seats in other students' cars.", icon: "user" },
  { id: "Both", title: "A little of both", desc: "Sometimes I drive, sometimes I tag along.", icon: "sparkle" },
  { id: "Driver", title: "Mostly driving", desc: "I have a car and want to offer rides.", icon: "car" },
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result.split(",")[1]);
  reader.onerror = (readError) => reject(readError);
  reader.readAsDataURL(file);
});

/**
 * Three-step web signup wizard (design handoff "OnboardingWizard").
 *
 * Every value is read from or written to real Meteor data: the email and
 * school come from the Clerk-verified account, the profile fields are the
 * ProfileSchema fields clerk.completeOnboarding already accepts, and the
 * social-proof counts come from the onboarding.stats method.
 */
function MobileOnboarding({ profileData, currentUser, school, schools, loading }) {
  const { isLoaded, isSignedIn, clerkUser, meteorUser } = useClerkUser();
  const captchaRef = React.useRef(null);
  const prefilled = React.useRef(false);
  const roleRefs = React.useRef({});

  const [currentStep, setCurrentStep] = React.useState(1);
  const [name, setName] = React.useState("");
  const [year, setYear] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [other, setOther] = React.useState("");
  const [userType, setUserType] = React.useState("Driver");
  const [pickedSchoolId, setPickedSchoolId] = React.useState("");
  const [schoolQuery, setSchoolQuery] = React.useState("");
  const [profileImage, setProfileImage] = React.useState("");
  const [rideImage, setRideImage] = React.useState("");
  const [pending, setPending] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [consentInvalid, setConsentInvalid] = React.useState(false);
  const [redirectTo, setRedirectTo] = React.useState(null);
  const [stats, setStats] = React.useState(null);

  const currentUserId = currentUser?._id || meteorUser?._id || null;
  const assignedSchoolId = currentUser?.schoolId || meteorUser?.schoolId || "";
  const email = clerkUser?.primaryEmailAddress?.emailAddress
    || currentUser?.emails?.[0]?.address
    || "";
  const emailDomain = email.split("@")[1] || "";
  const pickedSchool = schools.find(s => s._id === pickedSchoolId) || null;
  const schoolShortName = school?.shortName || pickedSchool?.shortName || "";

  React.useEffect(() => {
    if (!isLoaded) return;

    // A destination already chosen wins. Finishing setup writes the profile,
    // so without this the tracker update would re-route the user to /verify
    // before the /waiting-confirmation redirect had taken effect.
    if (redirectTo) return;

    if (!isSignedIn) {
      setRedirectTo("/login");
      return;
    }

    if (loading) return;

    // Already onboarded at a school: the wizard has nothing left to collect.
    if (profileData && assignedSchoolId) {
      setRedirectTo("/verify");
      return;
    }

    if (prefilled.current) return;
    prefilled.current = true;

    if (profileData) {
      setName(profileData.Name || "");
      setYear(profileData.year || "");
      setPhone(profileData.Phone || "");
      setOther(profileData.Other || "");
      setUserType(profileData.UserType || "Driver");
      setProfileImage(profileData.Image || "");
      setRideImage(profileData.Ride || "");
      return;
    }

    const clerkName = clerkUser?.fullName
      || [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ");
    if (clerkName) setName(clerkName);
  }, [isLoaded, isSignedIn, loading, redirectTo, profileData, assignedSchoolId, clerkUser]);

  // Aggregate counts for the brand panel. Rendered only once they arrive, so
  // the panel never shows a placeholder number.
  React.useEffect(() => {
    if (!currentUserId) return undefined;
    let live = true;
    Meteor.call("onboarding.stats", (statsError, result) => {
      if (!statsError && live) setStats(result);
    });
    return () => { live = false; };
  }, [currentUserId]);

  const canProceed = () => {
    if (currentStep === 1) return Boolean(assignedSchoolId || pickedSchoolId);
    if (currentStep === 2) return name.trim().length >= 2;
    return acceptedTerms;
  };

  const nextStep = () => {
    setError("");
    setCurrentStep(step => Math.min(step + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
    setError("");
    setCurrentStep(step => Math.max(step - 1, 1));
  };

  const handleFileSelect = (event, kind) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please select a JPEG, PNG, GIF or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is over 5MB. Please pick a smaller one.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => setPending({ kind, file, preview: reader.result });
    reader.readAsDataURL(file);
  };

  const confirmUpload = () => {
    const captcha = captchaRef.current;
    if (!pending) return;
    if (!captcha) {
      setError("The security check is not available right now.");
      return;
    }
    if (!currentUserId) {
      setError("You must be signed in to upload images.");
      return;
    }

    setIsUploading(true);
    setError("");

    captcha.verify((captchaError, isValid) => {
      if (captchaError || !isValid) {
        setError(captchaError || "Invalid security code. Please try again.");
        setIsUploading(false);
        captcha.reset();
        return;
      }

      const uploadSchoolId = assignedSchoolId || pickedSchoolId;
      const privacyOptions = {
        private: false,
        user: currentUserId,
        ...(uploadSchoolId ? { school: uploadSchoolId } : {}),
      };

      fileToBase64(pending.file)
        .then((base64Data) => {
          const imageData = {
            fileName: pending.file.name,
            mimeType: pending.file.type,
            base64Data,
          };

          Meteor.call(
            "images.upload",
            imageData,
            captcha.getCaptchaData().sessionId,
            privacyOptions,
            (uploadError, result) => {
              setIsUploading(false);
              if (uploadError) {
                setError(uploadError.reason || "Failed to upload the image.");
                captcha.reset();
                return;
              }
              if (pending.kind === "profile") setProfileImage(result.uuid);
              else setRideImage(result.uuid);
              setPending(null);
            },
          );
        })
        .catch(() => {
          setError("Failed to read the selected image.");
          setIsUploading(false);
          captcha.reset();
        });
    });
  };

  const handleFinish = () => {
    if (!currentUserId) {
      setError("You must be signed in to complete onboarding.");
      return;
    }
    if (!assignedSchoolId && !pickedSchoolId) {
      setError("Choose your school before finishing setup.");
      return;
    }
    if (!acceptedTerms) {
      setConsentInvalid(true);
      setError("Please accept the Terms of Use and Privacy Policy to finish setup.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const completeProfile = () => {
      Meteor.call("clerk.completeOnboarding", {
        acceptedTerms: true,
        name: name.trim(),
        userType,
        year,
        phone: phone.trim(),
        other: other.trim(),
        image: profileImage,
        ride: rideImage,
      }, (profileError) => {
        setIsSubmitting(false);
        if (profileError) {
          setError(profileError.reason || profileError.message);
          return;
        }
        setSuccess("Your profile is ready. We've sent it for approval.");
        setRedirectTo("/waiting-confirmation");
      });
    };

    // Only assign when the verified email domain did not already resolve a
    // school, so nobody can put themselves at a school they cannot verify.
    if (assignedSchoolId) {
      completeProfile();
      return;
    }

    Meteor.call("clerk.assignSchool", pickedSchoolId, (schoolError) => {
      if (schoolError) {
        setError(schoolError.reason || "Failed to assign your school.");
        setIsSubmitting(false);
        return;
      }
      completeProfile();
    });
  };

  /* Roving tabindex: only the checked option is in the tab order, and
   * arrow keys move both focus and the checked value between options. */
  const handleRoleKeyDown = (event) => {
    const currentIndex = ROLES.findIndex(role => role.id === userType);
    let nextIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % ROLES.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + ROLES.length) % ROLES.length;
    } else {
      return;
    }
    event.preventDefault();
    const nextRole = ROLES[nextIndex].id;
    setUserType(nextRole);
    roleRefs.current[nextRole]?.focus();
  };

  const renderStepIndicator = () => (
    <StepRow>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.n}>
          <StepBadge $on={s.n <= currentStep}>
            {s.n < currentStep
              ? <Icon name="check" size={14} color="var(--ink-1)" strokeWidth={2.5} />
              : s.n}
          </StepBadge>
          {i < STEPS.length - 1 && <StepConnector $on={s.n < currentStep} />}
        </React.Fragment>
      ))}
    </StepRow>
  );

  const renderUploadPanel = (kind) => {
    if (pending?.kind !== kind) return null;
    return (
      <UploadSection>
        <Captcha ref={captchaRef} disabled={isUploading} />
        <UploadButton type="button" onClick={confirmUpload} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Confirm upload"}
        </UploadButton>
        <FileInfo>JPEG, PNG, GIF or WebP · 5MB max</FileInfo>
      </UploadSection>
    );
  };

  const renderThumb = (kind, uuid) => {
    if (pending?.kind === kind) return <PreviewImg src={pending.preview} alt="" />;
    if (uuid) return <PreviewImg src={getImageUrl(uuid)} alt="" />;
    if (kind === "profile") {
      return <Avatar user={{ id: currentUserId, name: name.trim(), hue: hueFor(currentUserId) }} size={48} />;
    }
    return <InfoTile><Icon name="car" size={20} /></InfoTile>;
  };

  const renderPhotoRow = (kind, title, desc, uuid) => (
    <>
      <InfoRow>
        {renderThumb(kind, uuid)}
        <InfoBody>
          <InfoTitle>{title}</InfoTitle>
          <InfoDesc>{desc}</InfoDesc>
        </InfoBody>
        <FileInput
          id={`${kind}-upload`}
          type="file"
          accept="image/*"
          disabled={isUploading}
          onChange={event => handleFileSelect(event, kind)}
        />
        <UploadBtn as="label" htmlFor={`${kind}-upload`}>
          {uuid ? "Replace" : "Upload"}
        </UploadBtn>
      </InfoRow>
      {renderUploadPanel(kind)}
    </>
  );

  const renderSchoolPicker = () => {
    const query = schoolQuery.trim().toLowerCase();
    const matches = query
      ? schools.filter(s => `${s.name} ${s.shortName} ${s.code}`.toLowerCase().includes(query))
      : schools;

    return (
      <Field>
        <Label htmlFor="school-search">Your school</Label>
        <Input
          id="school-search"
          type="search"
          placeholder="Search by name or code"
          value={schoolQuery}
          onChange={event => setSchoolQuery(event.target.value)}
        />
        <SchoolList>
          {matches.length === 0 && (
            <SchoolEmpty>
              {schools.length === 0
                ? "No schools are set up yet. Please contact support."
                : "No schools match that search."}
            </SchoolEmpty>
          )}
          {matches.map(s => (
            <SchoolOption
              key={s._id}
              type="button"
              $selected={pickedSchoolId === s._id}
              onClick={() => { setPickedSchoolId(s._id); setError(""); }}
            >
              <span>{s.name}</span>
              <SchoolCode>{s.code}</SchoolCode>
            </SchoolOption>
          ))}
        </SchoolList>
        <InputHint>We could not match {emailDomain || "your email"} to a school automatically.</InputHint>
      </Field>
    );
  };

  const renderStep1 = () => (
    <Step className="fade-in" key="step-1">
      {email && (
        <Field>
          <Label htmlFor="school-email">School email</Label>
          <ReadOnlyInput id="school-email" value={email} readOnly aria-readonly="true" />
          <InputHint>Verified when you signed up.</InputHint>
        </Field>
      )}

      {assignedSchoolId && school && (
        <InfoRow>
          <InfoTile><Icon name="school" size={20} /></InfoTile>
          <InfoBody>
            <InfoTitle>{school.name}</InfoTitle>
            {emailDomain && <InfoMono>{emailDomain}</InfoMono>}
          </InfoBody>
          <Icon name="check" size={18} color="var(--leaf)" strokeWidth={2.5} />
        </InfoRow>
      )}

      {!assignedSchoolId && renderSchoolPicker()}

      <NotePill>
        <NoteIcon>
          <Icon name="check" size={16} color="var(--signal-yellow-deep)" strokeWidth={2.5} />
        </NoteIcon>
        <span>
          {schoolShortName
            ? `An admin at ${schoolShortName} reviews new accounts before your first ride.`
            : "An admin reviews new accounts before your first ride."}
        </span>
      </NotePill>
    </Step>
  );

  const renderStep2 = () => (
    <Step className="fade-in" key="step-2">
      <Field>
        <Label htmlFor="ob-name">Full name</Label>
        <Input
          id="ob-name"
          type="text"
          placeholder="Your full name"
          maxLength="50"
          value={name}
          onChange={event => { setName(event.target.value); setError(""); }}
        />
      </Field>

      <FieldRow>
        <Field>
          <Label htmlFor="ob-year">Year</Label>
          <SelectWrap>
            <Select id="ob-year" value={year} onChange={event => setYear(event.target.value)}>
              <option value="">Select year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
            <SelectChevron><Icon name="chevR" size={14} /></SelectChevron>
          </SelectWrap>
        </Field>
      </FieldRow>

      <FieldRow>
        <Field>
          <Label htmlFor="ob-phone">Phone · optional</Label>
          <Input
            id="ob-phone"
            type="tel"
            maxLength="20"
            value={phone}
            onChange={event => setPhone(event.target.value)}
          />
        </Field>
        <Field>
          <Label htmlFor="ob-other">Other contact · optional</Label>
          <Input
            id="ob-other"
            type="text"
            maxLength="500"
            placeholder="Email, social, etc."
            value={other}
            onChange={event => setOther(event.target.value)}
          />
        </Field>
      </FieldRow>

      {renderPhotoRow(
        "profile",
        "Profile photo",
        "Help drivers recognize you at pickup.",
        profileImage,
      )}
    </Step>
  );

  const renderStep3 = () => (
    <Step className="fade-in" key="step-3">
      <UserTypeOptions
        role="radiogroup"
        aria-label="How you will use carp.school"
        onKeyDown={handleRoleKeyDown}
      >
        {ROLES.map(role => (
          <UserTypeOption
            key={role.id}
            ref={el => { roleRefs.current[role.id] = el; }}
            type="button"
            role="radio"
            aria-checked={userType === role.id}
            tabIndex={userType === role.id ? 0 : -1}
            $selected={userType === role.id}
            onClick={() => setUserType(role.id)}
          >
            <RoleIconTile $selected={userType === role.id}>
              <Icon name={role.icon} size={20} />
            </RoleIconTile>
            <RoleBody>
              <UserTypeTitle>{role.title}</UserTypeTitle>
              <UserTypeDesc>{role.desc}</UserTypeDesc>
            </RoleBody>
            <RoleRadio $selected={userType === role.id}>
              {userType === role.id && (
                <Icon name="check" size={14} color="var(--ink-1)" strokeWidth={3} />
              )}
            </RoleRadio>
          </UserTypeOption>
        ))}
      </UserTypeOptions>

      {userType !== "Rider" && renderPhotoRow(
        "ride",
        "Vehicle photo",
        "Show riders the car you'll pull up in.",
        rideImage,
      )}

      <ConsentRow $invalid={consentInvalid && !acceptedTerms}>
        <ConsentCheck
          type="checkbox"
          checked={acceptedTerms}
          aria-invalid={consentInvalid && !acceptedTerms}
          onChange={(event) => {
            setAcceptedTerms(event.target.checked);
            if (event.target.checked) {
              setConsentInvalid(false);
              setError("");
            }
          }}
        />
        <ConsentText>
          I have read and agree to the{" "}
          <a href="/tos" target="_blank" rel="noopener noreferrer">Terms of Use</a>
          {" "}and{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          If I am under the age of majority, a parent or guardian has agreed to
          them for me.
        </ConsentText>
      </ConsentRow>
    </Step>
  );

  const renderCurrentStep = () => {
    if (currentStep === 1) return renderStep1();
    if (currentStep === 2) return renderStep2();
    return renderStep3();
  };

  if (!isLoaded || loading) {
    return <LoadingPage message="Loading..." />;
  }

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  const step = STEPS[currentStep - 1];
  const isLastStep = currentStep === TOTAL_STEPS;
  let ctaLabel = "Continue";
  if (isSubmitting) ctaLabel = "Creating profile...";
  else if (isLastStep) ctaLabel = "Finish setup";

  return (
    <Container>
      <BrandPanel>
        <BrandMap />
        <BrandInner>
          <Logo size={26} color="var(--cream-0)" />
          <BrandFoot>
            <BrandEyebrow>For students, by students</BrandEyebrow>
            <BrandTitle>
              Share the ride.
              <br />
              <Mark>Skip the bus.</Mark>
            </BrandTitle>
            <BrandCopy>
              Carpools made for college campuses. School email only, verified students,
              real routes — no strangers, no surge pricing.
            </BrandCopy>
            {stats && stats.rideCount > 0 && (
              <ProofPanel>
                <ProofTile><Icon name="car" size={18} /></ProofTile>
                <ProofBody>
                  <ProofPrimary>
                    {stats.rideCount.toLocaleString()} rides shared
                  </ProofPrimary>
                  <ProofSecondary>
                    at {stats.schoolCount} {stats.schoolCount === 1 ? "school" : "schools"} and counting
                  </ProofSecondary>
                </ProofBody>
              </ProofPanel>
            )}
          </BrandFoot>
        </BrandInner>
      </BrandPanel>

      <FormPane>
        <Content>
          {renderStepIndicator()}

          <StepEyebrow>{`Step ${currentStep} of ${TOTAL_STEPS} · ${step.sub}`}</StepEyebrow>
          <StepTitle>
            {step.lead}
            <Mark>{step.mark}</Mark>
          </StepTitle>
          {currentStep === 2 && <StepSubtitle>{STEP_2_SUBTITLE}</StepSubtitle>}

          {renderCurrentStep()}

          {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
          {success && <SuccessMessage role="status">{success}</SuccessMessage>}

          <Navigation>
            <SecondaryButton
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
            >
              <Icon name="chevL" size={16} />
              Back
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={isLastStep ? handleFinish : nextStep}
              disabled={!canProceed() || isSubmitting}
            >
              {ctaLabel}
              <Icon name="arrow" size={16} color="var(--ink-1)" />
            </PrimaryButton>
          </Navigation>

          <Spacer />
        </Content>
      </FormPane>
    </Container>
  );
}

MobileOnboarding.propTypes = {
  profileData: PropTypes.object,
  currentUser: PropTypes.object,
  school: PropTypes.object,
  schools: PropTypes.array,
  loading: PropTypes.bool.isRequired,
};

MobileOnboarding.defaultProps = {
  profileData: null,
  currentUser: null,
  school: null,
  schools: [],
};

export default withTracker(() => {
  const userId = Meteor.userId();
  const currentUser = Meteor.user();
  // Set server-side from the verified email domain; absent only on legacy
  // accounts created through clerk.getMeteorUser.
  const schoolId = currentUser?.schoolId || "";

  // "profiles.mine" does not exist, so the old subscription never became
  // ready and every new user sat on the loading screen forever.
  const profileSub = Meteor.subscribe("userProfile");
  const schoolSub = schoolId
    ? Meteor.subscribe("schools.byId", schoolId)
    : Meteor.subscribe("schools.onboarding");

  return {
    profileData: userId ? Profiles.findOne({ Owner: userId }) : null,
    currentUser,
    school: schoolId ? Schools.findOne(schoolId) : null,
    schools: schoolId ? [] : Schools.find({}, { sort: { name: 1 } }).fetch(),
    loading: !profileSub.ready() || !schoolSub.ready(),
  };
})(MobileOnboarding);
