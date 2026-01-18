import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import ReactMarkdown from "react-markdown";
import {
  Container,
  SectionHeader,
  SectionTitle,
  Content,
} from "../styles/Landing";
import { MobileOnly, DesktopOnly } from "../../layouts/Devices";
import { HeaderWithBack } from "../styles/Privacy";
import BackButton from "../components/BackButton";
import { SystemContent } from "../../../api/system/System";
import LoadingPage from "../../components/LoadingPage";

const defaultContent = `
# CarpSchool Blog

## Latest Updates

### Welcome to CarpSchool! 
*Posted: Coming Soon*

We're excited to launch CarpSchool, your new way to connect with fellow students for safe and convenient carpooling.

Stay tuned for more updates, tips, and stories from our community!

---

## Coming Soon

We're working on bringing you:

- **Safety Tips** - Best practices for safe carpooling
- **Student Stories** - Real experiences from our users
- **Feature Updates** - What's new in CarpSchool
- **Sustainability Insights** - How carpooling helps the environment
- **School Spotlights** - Featuring schools in our community

---

## Want to Contribute?

Have a story to share or an idea for a blog post? We'd love to hear from you!

Contact us at blog@carpschool.com

---

*Check back soon for more content!*
`;

/**
 * Blog page with markdown content from database
 */
function MobileBlog({ history: _history, blogContent, ready }) {
  const content = blogContent?.content || defaultContent;

  if (!ready) {
    return <LoadingPage message="Loading Blog..." />;
  }

  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>Blog</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <SectionHeader>
          <SectionTitle>CarpSchool Blog</SectionTitle>
        </SectionHeader>
      </DesktopOnly>
      <Content>
        <ReactMarkdown>{content}</ReactMarkdown>
      </Content>
    </Container>
  );
}

MobileBlog.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  blogContent: PropTypes.object,
  ready: PropTypes.bool.isRequired,
};

export default withRouter(
  withTracker(() => {
    const subscription = Meteor.subscribe("systemContent.byType", "blog");
    const blogContent = SystemContent.findOne({ type: "blog" });

    return {
      blogContent,
      ready: subscription.ready(),
    };
  })(MobileBlog),
);
