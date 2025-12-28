import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Redirect } from "react-router-dom";
import {
  Container,
  Header,
  AppName,
  Content,
  Step,
  StepTitle,
  StepSubtitle,
  Form,
  InputSection,
  Field,
  Input,
  InputHint,
  SubmitButton,
  ErrorMessage,
  Navigation,
  SecondaryButton,
  UserTypeOptions,
  UserTypeOption,
  UserTypeTitle,
  UserTypeDesc,
  PhotoSections,
  PhotoSection,
  PhotoPreview,
  PreviewImg,
  FileInput,
  FileLabel,
} from "../styles/Onboarding"; // Using existing styles
import Captcha from "../components/Captcha";
import { getImageUrl } from "../utils/imageUtils";

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
         if (!matchedSchool) return false; // Must match a school
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
            setError("Please enter a valid school email (.edu) that matches a supported university.");
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
      
      // We need to upload this immediately to get a UUID? 
      // Or we can modify the backend to accept base64.
      // Existing backend expects UUIDs for images, so we should upload.
      // Ideally we should do this after registration, but for now we follow the pattern.
      // HOWEVER, we don't have a user ID yet!
      // This is a Catch-22 in the old design.
      // Solution: We will pass the Base64 to the registration method and let the server handle it/upload it
      // OR we just accept that we can't upload until registered.
      // Let's defer image upload to "Edit Profile" for simplicity/robustness if needed.
      // BUT, let's try to pass the base64 to the server method if possible.
      // The current plan said "Profile ID server side".
      // Let's store the base64 and send it to registerStudent method.
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
               imageBase64: formData.imagePreview ? formData.imagePreview.split(',')[1] : null,
           }
       };

       Meteor.call("accounts.registerStudent", payload, (err, res) => {
           setIsSubmitting(false);
           if (err) {
               setError(err.reason || "Registration failed.");
           } else {
               // Success! Login the user automatically?
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
      <Header>
        <AppName onClick={() => setRedirectTo("/")}>CarpSchool</AppName>
      </Header>

      <Content>
        {/* Progress Indicator could go here */}
        
        <Form onSubmit={(e) => e.preventDefault()}>
        
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <Step>
               <StepTitle>Join Your School Community</StepTitle>
               <StepSubtitle>Use your school email to connect with students near you.</StepSubtitle>
               
               <InputSection>
                   <Field>
                       <Input 
                           type="email" 
                           name="email" 
                           placeholder="university.edu email" 
                           value={formData.email}
                           onChange={handleChange}
                           autoFocus
                       />
                       {matchedSchool && (
                           <InputHint style={{ color: "#2ecc71" }}>
                               ✅ Available at {matchedSchool.name}
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
               </InputSection>
            </Step>
          )}

          {/* STEP 2: PROFILE */}
          {step === 2 && (
             <Step>
                <StepTitle>Create Your Profile</StepTitle>
                <StepSubtitle>Tell us a bit about yourself.</StepSubtitle>
                
                <InputSection>
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
                </InputSection>
             </Step>
          )}

          {/* STEP 3: PREFERENCES */}
          {step === 3 && (
              <Step>
                 <StepTitle>Ride Preferences</StepTitle>
                 <StepSubtitle>How will you use CarpSchool?</StepSubtitle>
                 
                 <UserTypeOptions>
                    <UserTypeOption 
                        selected={formData.userType === "Driver"}
                        onClick={() => setFormData({ ...formData, userType: "Driver" })}
                    >
                        <UserTypeTitle>Driver</UserTypeTitle>
                        <UserTypeDesc>I can offer rides</UserTypeDesc>
                    </UserTypeOption>
                    <UserTypeOption 
                        selected={formData.userType === "Rider"}
                        onClick={() => setFormData({ ...formData, userType: "Rider" })}
                    >
                        <UserTypeTitle>Rider</UserTypeTitle>
                        <UserTypeDesc>I need rides</UserTypeDesc>
                    </UserTypeOption>
                 </UserTypeOptions>

                 <InputSection>
                    <Field>
                       <Input 
                           name="phone" 
                           placeholder="Phone Number (Optional)" 
                           value={formData.phone}
                           onChange={handleChange}
                       />
                    </Field>

                    <PhotoSections>
                        <PhotoSection>
                            {formData.imagePreview && (
                                <PhotoPreview>
                                    <PreviewImg src={formData.imagePreview} alt="Profile Preview" />
                                </PhotoPreview>
                            )}
                            <FileInput
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                id="profile-upload-reg"
                            />
                            <FileLabel htmlFor="profile-upload-reg">
                                {formData.imagePreview ? "Change Photo" : "Upload Profile Photo (Optional)"}
                            </FileLabel>
                        </PhotoSection>
                    </PhotoSections>
                    
                    {/* Final Captcha */}
                    <Field>
                         <Captcha ref={captchaRef} autoGenerate={true} />
                    </Field>
                 </InputSection>
              </Step>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Navigation hasBackButton={step > 1}>
             {step > 1 && (
                 <SecondaryButton onClick={prevStep} type="button">Back</SecondaryButton>
             )}
             
             {step < 3 ? (
                 <SubmitButton onClick={nextStep} type="button">Next</SubmitButton>
             ) : (
                 <SubmitButton onClick={handleSubmit} disabled={isSubmitting}>
                     {isSubmitting ? "Creating Account..." : "Finish Registration"}
                 </SubmitButton>
             )}
          </Navigation>

        </Form>
      </Content>
    </Container>
  );
};

StudentRegistration.propTypes = {
  location: PropTypes.object,
};

export default StudentRegistration;
