import React from "react";
import ReactMarkdown from "react-markdown";
import {
  Container,
  SectionHeader,
  SectionTitle,
  Content,
} from "../styles/Landing";

const creditsContent = `
# Credits

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

For questions about this application or to report issues, please contact us at kobosh@kobosh.com.

---

*Built with ❤️ for the student community by [Carpool team]()*
`;

/**
 * Credits page with markdown content
 */
export default function MobileCredits() {
  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <SectionHeader>
        <SectionTitle>Credits</SectionTitle>
      </SectionHeader>
      <Content>
        <ReactMarkdown>{creditsContent}</ReactMarkdown>
      </Content>
    </Container>
  );
}
