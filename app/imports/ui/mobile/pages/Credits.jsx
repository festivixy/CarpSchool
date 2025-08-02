import React from "react";
import { withRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Container,
  SectionHeader,
  SectionTitle,
  Content,
} from "../styles/Landing";
import { MobileOnly, DesktopOnly } from "../../layouts/Devices";
import styled from "styled-components";

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  position: absolute;
  left: 20px;
  top: 20px;

  &:hover {
    background-color: rgba(240, 240, 240, 1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const HeaderWithBack = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`;

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

- None yet

## Map Data

[© OpenMapTiles](https://www.openmaptiles.org/) [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

## Contact

For questions about this application or to report issues, please contact lz at kobosh@kobosh.com.

---

*Built with ❤️ for the student community by [Carpool team]()*
`;

/**
 * Credits page with markdown content
 */
function MobileCredits({ history }) {
  const handleBack = () => {
    history.goBack();
  };

  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <HeaderWithBack>
          <BackButton onClick={handleBack}>
            <img src="/svg/back.svg" alt="Back" />
          </BackButton>
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

export default withRouter(MobileCredits);
