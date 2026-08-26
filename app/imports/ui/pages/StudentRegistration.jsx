import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Redirect } from "react-router-dom";
import {
  Container,
  BrandPanel,
  BrandInner,
  BrandEyebrow,
  BrandTitle,
  FormPane,
  Content,
  Step,
  StepTitle,
  StepSubtitle,
  Field,
  Input,
  InputHint,
  ErrorMessage,
  Navigation,
  PrimaryButton,
  SecondaryButton,
  UserTypeOptions,
  UserTypeOption,
  UserTypeTitle,
  UserTypeDesc,
  UploadSection,
  UploadBtn,
  PreviewImg,
  FileInput,
} from "../mobile/styles/Onboarding"; // Using existing styles
import Captcha from "../components/Captcha";

/**
 * Unified Student Registration Wizard
 * Replaces old Signup + Onboarding flow
 */
const StudentRegistration = ({ location }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);
  const captchaRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    major: "",
    year: "",
    campus: "",
    userType: "Driver",
    phone: "",
    image: null, // UUID after upload
    imagePreview: null,
  });

  const [matchedSchool, setMatchedSchool] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");

    // Debounced domain check for email
    if (name === "email" && value.includes("@")) {
      checkSchoolDomain(value);
    }
  };

  const checkSchoolDomain = (email) => {
    Meteor.call("schools.checkDomain", email, (err, school) => {
      if (school) {
        setMatchedSchool(school);
      } else {
        setMatchedSchool(null);
      }
    });
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1: // Identity
         if (!formData.email.includes("@")) return false;
         if (formData.password.length < 6) return false;
          return true;
      case 2: // Profile
         return formData.name.length >= 2;
      case 3: // Preferences
         return true;
      default:
         return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
        if (step === 1 && !matchedSchool) {
            setError("Please enter a valid email address.");
        } else if (step === 1 && formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
        } else {
            setError("Please fill out all required fields.");
        }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    setError("");
  };

  // Image Upload Logic (simplified)
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, imagePreview: event.target.result }));
      // The base64 preview travels with the registration payload below; the
      // server stores it once the account exists, since there is no user id
      // to attach an upload to before registration completes.
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!captchaRef.current) return;

    setIsSubmitting(true);

    captchaRef.current.verify((captchaError, isValid) => {
       if (captchaError || !isValid) {
           setError("Invalid security code.");
           setIsSubmitting(false);
           return;
       }

       const captchaToken = captchaRef.current.getCaptchaData().sessionId;

       // Prepare payload
       const payload = {
           email: formData.email,
           password: formData.password,
           captchaToken,
           profile: {
               name: formData.name,
               major: formData.major,
               year: formData.year,
               campus: formData.campus,
               userType: formData.userType,
               phone: formData.phone,
               // Extract base64 part if image exists
               imageBase64: formData.imagePreview ? formData.imagePreview.split(",")[1] : null,
           }
       };

       Meteor.call("accounts.registerStudent", payload, (err, res) => {
           setIsSubmitting(false);
           if (err) {
               setError(err.reason || "Registration failed.");
           } else {
               // Success - log the user in automatically.
               Meteor.loginWithPassword(formData.email, formData.password, (loginErr) => {
                   if (loginErr) {
                       setRedirectTo("/login"); // Fallback
                   } else {
                       setRedirectTo("/my-rides");
                   }
               });
           }
       });
    });
  };

  if (redirectTo) {
      return <Redirect to={redirectTo} />;
  }

  return (
    <Container>
      <BrandPanel>
        <BrandInner>
          <BrandEyebrow>CarpSchool</BrandEyebrow>
          <BrandTitle>Join your school community</BrandTitle>
        </BrandInner>
      </BrandPanel>

      <FormPane>
        <Content>
          <form onSubmit={(e) => e.preventDefault()}>

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <Step>
                 <StepTitle>Join Your School Community</StepTitle>
                 <StepSubtitle>Use your school email to connect with students near you.</StepSubtitle>

                 <Field>
                     <Input
                         type="email"
                         name="email"
                         placeholder="Email address"
                         value={formData.email}
                         onChange={handleChange}
                         autoFocus
                     />
                     {matchedSchool && (
                         <InputHint style={{ color: "var(--leaf, #2ecc71)" }}>
                             Available at {matchedSchool.name}
                         </InputHint>
                     )}
                 </Field>
                 <Field>
                     <Input
                         type="password"
                         name="password"
                         placeholder="Create a password"
                         value={formData.password}
                         onChange={handleChange}
                     />
                 </Field>
              </Step>
            )}

            {/* STEP 2: PROFILE */}
            {step === 2 && (
               <Step>
                  <StepTitle>Create Your Profile</StepTitle>
                  <StepSubtitle>Tell us a bit about yourself.</StepSubtitle>

                  <Field>
                      <Input
                          name="name"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleChange}
                      />
                  </Field>
                  <Field>
                      <Input
                          name="major"
                          placeholder="Major (Optional)"
                          value={formData.major}
                          onChange={handleChange}
                      />
                  </Field>
                  <Field>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                    >
                       <option value="">Select Year (Optional)</option>
                       <option value="Freshman">Freshman</option>
                       <option value="Sophomore">Sophomore</option>
                       <option value="Junior">Junior</option>
                       <option value="Senior">Senior</option>
                       <option value="Graduate">Graduate</option>
                    </select>
                  </Field>
               </Step>
            )}

            {/* STEP 3: PREFERENCES */}
            {step === 3 && (
                <Step>
                   <StepTitle>Ride Preferences</StepTitle>
                   <StepSubtitle>How will you use CarpSchool?</StepSubtitle>

                   <UserTypeOptions>
                      <UserTypeOption
                          type="button"
                          $selected={formData.userType === "Driver"}
                          onClick={() => setFormData({ ...formData, userType: "Driver" })}
                      >
                          <UserTypeTitle>Driver Only</UserTypeTitle>
                          <UserTypeDesc>I can offer rides</UserTypeDesc>
                      </UserTypeOption>
                      <UserTypeOption
                          type="button"
                          $selected={formData.userType === "Rider"}
                          onClick={() => setFormData({ ...formData, userType: "Rider" })}
                      >
                          <UserTypeTitle>Rider Only</UserTypeTitle>
                          <UserTypeDesc>I need rides</UserTypeDesc>
                      </UserTypeOption>
                      <UserTypeOption
                          type="button"
                          $selected={formData.userType === "Both"}
                          onClick={() => setFormData({ ...formData, userType: "Both" })}
                      >
                          <UserTypeTitle>Both</UserTypeTitle>
                          <UserTypeDesc>I drive and need rides</UserTypeDesc>
                      </UserTypeOption>
                   </UserTypeOptions>

                   <Field>
                      <Input
                          name="phone"
                          placeholder="Phone Number (Optional)"
                          value={formData.phone}
                          onChange={handleChange}
                      />
                   </Field>

                   <UploadSection>
                       {formData.imagePreview && (
                           <PreviewImg src={formData.imagePreview} alt="Profile Preview" />
                       )}
                       <FileInput
                           type="file"
                           accept="image/*"
                           onChange={handleImageSelect}
                           id="profile-upload-reg"
                       />
                       <UploadBtn as="label" htmlFor="profile-upload-reg">
                           {formData.imagePreview ? "Change Photo" : "Upload Profile Photo (Optional)"}
                       </UploadBtn>
                   </UploadSection>

                   {/* Final Captcha */}
                   <Field>
                        <Captcha ref={captchaRef} autoGenerate={true} />
                   </Field>
                </Step>
            )}

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Navigation>
               {step > 1 && (
                   <SecondaryButton onClick={prevStep} type="button">Back</SecondaryButton>
               )}

               {step < 3 ? (
                   <PrimaryButton onClick={nextStep} type="button">Next</PrimaryButton>
               ) : (
                   <PrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
                       {isSubmitting ? "Creating Account..." : "Finish Registration"}
                   </PrimaryButton>
               )}
            </Navigation>

          </form>
        </Content>
      </FormPane>
    </Container>
  );
};

StudentRegistration.propTypes = {
  location: PropTypes.object,
};

export default StudentRegistration;
