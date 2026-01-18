import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Container,
  SectionHeader,
  SectionTitle,
  Content,
} from "../styles/Landing";
import { MobileOnly, DesktopOnly } from "../../layouts/Devices";
import { HeaderWithBack } from "../styles/Credits";
import BackButton from "../components/BackButton";

const helpContent = `
## Getting Started

Welcome to CarpSchool! Here's how to get the most out of our ridesharing platform.

### Creating an Account

1. Sign up with your email address
2. Complete the onboarding process to select your school
3. Set up your profile with your name and preferences
4. Wait for admin approval (if required by your school)

### Finding a Ride

1. Go to the **Marketplace** to browse available rides
2. Use filters to find rides matching your route and schedule
3. Click on a ride to view details
4. Request to join by clicking "Join Ride"

### Offering a Ride

1. Click the **+** button or go to "Create Ride"
2. Enter your starting point and destination
3. Set the date, time, and available seats
4. Add any notes for riders
5. Submit to publish your ride

### Managing Your Rides

- View your rides in **My Rides**
- Edit or cancel rides you've created
- Leave rides you've joined
- See your ride history

## Contact Support

If you need additional help, please contact your school administrator or reach out to:
- **Email**: support@carp.school
- **Website**: https://carp.school

---

*Thank you for using CarpSchool!*
`;

function MobileHelp({ history: _history }) {
  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>Help & Support</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <SectionHeader>
          <SectionTitle>Help & Support</SectionTitle>
        </SectionHeader>
      </DesktopOnly>
      <Content>
        <ReactMarkdown>{helpContent}</ReactMarkdown>
      </Content>
    </Container>
  );
}

MobileHelp.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(MobileHelp);
