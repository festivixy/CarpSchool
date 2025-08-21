import React from "react";
import {
  Container,
  Hero,
  HeroContent,
  LogoSection,
  AppName,
  CtaSection,
  CtaPrimary,
  CtaSecondary,
  Features,
  SectionHeader,
  SectionTitle,
  Content,
  Paragraph,
  HowItWorks,
  FinalCta,
  CtaContent,
  CtaTitle,
  CtaButtons,
} from "../styles/Landing";

/**
 * Modern Mobile Landing page with comprehensive features and modern design
 */
export default class MobileLanding extends React.Component {
  render() {
    return (
      <Container>
        {/* Hero Section */}
        <Hero>
          <HeroContent>
            <LogoSection>
              <AppName>CarpSchool</AppName>
            </LogoSection>

            <CtaSection>
              <CtaPrimary to="/signup">Get Started</CtaPrimary>
              <CtaSecondary to="/login">Sign In</CtaSecondary>
            </CtaSection>
          </HeroContent>
        </Hero>

        {/* What is carp.school Section */}
        <Features>
          <SectionHeader>
            <SectionTitle>What is CarpSchool?</SectionTitle>
          </SectionHeader>

          <Content>
            <Paragraph>
              The CarpSchool website provides a space for students traveling
              to/from the school campus to easily coordinate ride shares.
            </Paragraph>

            <Paragraph>
              The use of school email/school ID numbers ensures that each user
              is a verified school student; this system also prohibits banned
              users from continuing to use the CarpSchool website.
            </Paragraph>
          </Content>
        </Features>

        {/* How to Use carp.school Section */}
        <HowItWorks>
          <SectionHeader>
            <SectionTitle>How to Use CarpSchool</SectionTitle>
          </SectionHeader>

          <Content>
            <Paragraph>
              After signing up for CarpSchool with your school email, users can
              sign in to look through a list of future rides or create a new
              ride. After creating a new ride or signing up for a ride, users
              can view their scheduled rides on their calendar.
            </Paragraph>

            <Paragraph>
              The user profile can be edited to set your information, including:
              contact info, address/location, user type (driver, rider, or
              both), and car picture.
            </Paragraph>
          </Content>
        </HowItWorks>

        {/* CTA Section */}
        <FinalCta>
          <CtaContent>
            <CtaTitle>Ready to Start Ride Sharing?</CtaTitle>
            <CtaButtons>
              <CtaPrimary to="/signup">Create Account</CtaPrimary>
              <CtaSecondary to="/login">Sign In</CtaSecondary>
            </CtaButtons>
          </CtaContent>
        </FinalCta>
      </Container>
    );
  }
}
