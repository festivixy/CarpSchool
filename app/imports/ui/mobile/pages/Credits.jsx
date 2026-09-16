import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import ReactMarkdown from "react-markdown";
import { stripLeadingH1 } from "../../utils/docContent";
import {
  Container,
  DocHeader,
  SectionTitle,
  DocContent,
} from "../styles/Landing";
import { MobileOnly, DesktopOnly } from "../../layouts/Devices";
import { HeaderWithBack } from "../styles/Credits";
import BackButton from "../components/BackButton";
import { SystemContent } from "../../../api/system/System";
import LoadingPage from "../../components/LoadingPage";

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

- **Beef Ramen** - For powering the ref checker tool and countless debugging sessions
- **Coffee** - For fueling late-night coding sessions and morning deployments

## Map Data

[© OpenMapTiles](https://www.openmaptiles.org/) [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

## Contact

For questions about this application or to report an issue, contact contact@carpschool.com.

---

*Built with for the student community by CarpSchool team*
`;

/**
 * Credits page with markdown content from database
 */
function MobileCredits({ history: _history, creditsData, ready }) {
  const content = creditsData?.content || creditsContent;

  if (!ready) {
    return <LoadingPage message="Loading Credits..." />;
  }

  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>Credits</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <DocHeader>
          <SectionTitle>Credits</SectionTitle>
        </DocHeader>
      </DesktopOnly>
      <DocContent>
        <ReactMarkdown>{stripLeadingH1(content)}</ReactMarkdown>
      </DocContent>
    </Container>
  );
}

MobileCredits.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  creditsData: PropTypes.object,
  ready: PropTypes.bool.isRequired,
};

export default withRouter(
  withTracker(() => {
    const subscription = Meteor.subscribe("systemContent.byType", "credits");
    const creditsData = SystemContent.findOne({ type: "credits" });

    return {
      creditsData,
      ready: subscription.ready(),
    };
  })(MobileCredits),
);
