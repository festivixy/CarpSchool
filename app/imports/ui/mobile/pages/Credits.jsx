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

const creditsContent = `
## Development Team

This application was built with dedication and care by our development team.

## Technologies Used

### Frontend
- [React](https://react.dev/)

### Backend
- [Meteor](https://www.meteor.com/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)

## Special Thanks

- **Beef Ramen** 🍜 - For powering the ref checker tool and countless debugging sessions
- **Coffee** ☕ - For fueling late-night coding sessions and morning deployments

## Map Data

[© OpenMapTiles](https://www.openmaptiles.org/) [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

## Contact

For questions about this application or to report issues, please contact lz at kobosh@kobosh.com.

---

*Built with ❤️ for the student community by CarpSchool team*
`;

/**
 * Credits page with markdown content
 */
function MobileCredits({ history: _history }) {
  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>Credits</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <SectionHeader>
          <SectionTitle>Credits</SectionTitle>
        </SectionHeader>
      </DesktopOnly>
      <Content>
        <ReactMarkdown>{creditsContent}</ReactMarkdown>
      </Content>
    </Container>
  );
}

MobileCredits.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(MobileCredits);
