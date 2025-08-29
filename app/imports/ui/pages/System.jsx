import React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import ReactMarkdown from "react-markdown";
import { SystemContent } from "../../api/system/System";
import {
  Container,
  Header,
  Title,
  Subtitle,
  ContentSection,
  SectionTitle,
  SectionIcon,
  FormField,
  Label,
  TextArea,
  ButtonGroup,
  SaveButton,
  PreviewButton,
  StatusMessage,
  LastUpdated,
  CharacterCount,
  PreviewModal,
  PreviewContent,
  PreviewHeader,
  PreviewTitle,
  CloseButton,
} from "../styles/System";

/**
 * System admin page for editing TOS, Privacy, and Credits content
 */
class SystemAdmin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tosContent: "",
      privacyContent: "",
      creditsContent: "",
      loading: false,
      statusMessage: "",
      statusType: "",
      previewType: null,
      previewContent: "",
    };
  }

  componentDidMount() {
    this.loadContentFromProps();
    this.initializeDefaultContent();
  }

  initializeDefaultContent = () => {
    Meteor.call("system.initializeDefaults", (error, result) => {
      if (error) {
        console.error("Failed to initialize default content:", error);
      } else {
        console.log("Default content initialization:", result);
        // Reload content if any defaults were created
        const createdAny = result.some(r => r.created);
        if (createdAny) {
          // Force re-subscription to get the newly created content
          setTimeout(() => {
            this.loadContentFromProps();
          }, 500);
        }
      }
    });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.systemContent !== this.props.systemContent) {
      this.loadContentFromProps();
    }
  }

  loadContentFromProps = () => {
    const { systemContent } = this.props;

    const tosDoc = systemContent.find(doc => doc.type === "tos");
    const privacyDoc = systemContent.find(doc => doc.type === "privacy");
    const creditsDoc = systemContent.find(doc => doc.type === "credits");

    this.setState({
      tosContent: tosDoc?.content || "",
      privacyContent: privacyDoc?.content || "",
      creditsContent: creditsDoc?.content || "",
    });
  };

  handleContentChange = (type, value) => {
    this.setState({
      [`${type}Content`]: value,
      statusMessage: "", // Clear status when editing
    });
  };

  handleSave = (type) => {
    const content = this.state[`${type}Content`];

    if (!content.trim()) {
      this.setState({
        statusMessage: "Content cannot be empty",
        statusType: "error",
      });
      return;
    }

    this.setState({ loading: true });

    Meteor.call("system.updateContent", type, content, (error, _result) => {
      this.setState({ loading: false });

      if (error) {
        this.setState({
          statusMessage: error.reason || "Failed to save content",
          statusType: "error",
        });
      } else {
        this.setState({
          statusMessage: `${type.toUpperCase()} content saved successfully!`,
          statusType: "success",
        });

        // Clear message after 3 seconds
        setTimeout(() => {
          this.setState({ statusMessage: "", statusType: "" });
        }, 3000);
      }
    });
  };

  handlePreview = (type) => {
    const content = this.state[`${type}Content`];
    this.setState({
      previewType: type,
      previewContent: content,
    });
  };

  closePreview = () => {
    this.setState({
      previewType: null,
      previewContent: "",
    });
  };

  getLastUpdated = (type) => {
    const { systemContent } = this.props;
    const doc = systemContent.find(doc => doc.type === type);
    return doc?.lastUpdated;
  };

  getCharacterCount = (content) => {
    const count = content.length;
    const maxLength = 50000;

    return {
      count,
      warning: count > maxLength * 0.8,
      error: count > maxLength,
    };
  };

  renderContentSection = (type, title, icon) => {
    const content = this.state[`${type}Content`];
    const lastUpdated = this.getLastUpdated(type);
    const charInfo = this.getCharacterCount(content);

    return (
      <ContentSection key={type}>
        <SectionTitle>
          <SectionIcon>{icon}</SectionIcon>
          {title}
        </SectionTitle>

        <FormField>
          <Label htmlFor={`${type}Content`}>
            Content (Markdown supported)
          </Label>
          <TextArea
            id={`${type}Content`}
            value={content}
            onChange={(e) => this.handleContentChange(type, e.target.value)}
            placeholder={`Enter ${title.toLowerCase()} content using Markdown...`}
            disabled={this.state.loading}
          />
          <CharacterCount
            warning={charInfo.warning}
            error={charInfo.error}
          >
            {charInfo.count.toLocaleString()} / 50,000 characters
          </CharacterCount>
        </FormField>

        <ButtonGroup>
          <PreviewButton
            type="button"
            onClick={() => this.handlePreview(type)}
            disabled={!content.trim() || this.state.loading}
          >
            Preview
          </PreviewButton>
          <SaveButton
            onClick={() => this.handleSave(type)}
            disabled={!content.trim() || this.state.loading || charInfo.error}
          >
            {this.state.loading ? "Saving..." : "Save"}
          </SaveButton>
        </ButtonGroup>

        {lastUpdated && (
          <LastUpdated>
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </LastUpdated>
        )}
      </ContentSection>
    );
  };

  render() {
    const { ready, hasPermission } = this.props;
    const { statusMessage, statusType, previewType, previewContent } = this.state;

    if (!ready) {
      return (
        <Container>
          <Header>
            <Title>Loading...</Title>
          </Header>
        </Container>
      );
    }

    if (!hasPermission) {
      return (
        <Container>
          <Header>
            <Title>Access Denied</Title>
            <Subtitle>You need system role to access this page.</Subtitle>
          </Header>
        </Container>
      );
    }

    return (
      <Container>
        <Header>
          <Title>🛠️ System Content Management</Title>
          <Subtitle>
            Edit Terms of Service, Privacy Policy, and Credits content
          </Subtitle>
        </Header>

        {statusMessage && (
          <StatusMessage type={statusType}>
            {statusMessage}
          </StatusMessage>
        )}

        {this.renderContentSection("tos", "Terms of Service", "📜")}
        {this.renderContentSection("privacy", "Privacy Policy", "🔒")}
        {this.renderContentSection("credits", "Credits", "✨")}

        {previewType && (
          <PreviewModal onClick={this.closePreview}>
            <PreviewContent onClick={(e) => e.stopPropagation()}>
              <PreviewHeader>
                <PreviewTitle>
                  Preview: {previewType === "tos" ? "Terms of Service" : // eslint-disable-line no-nested-ternary
                           previewType === "privacy" ? "Privacy Policy" : "Credits" }
                </PreviewTitle>
                <CloseButton onClick={this.closePreview}>✕</CloseButton>
              </PreviewHeader>
              <div>
                <ReactMarkdown>{previewContent}</ReactMarkdown>
              </div>
            </PreviewContent>
          </PreviewModal>
        )}
      </Container>
    );
  }
}

SystemAdmin.propTypes = {
  systemContent: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  hasPermission: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe("systemContent.admin");
  const systemContent = SystemContent.find({}).fetch();

  // Check if user has system permission
  const currentUser = Meteor.user();
  const hasPermission = currentUser && currentUser.roles &&
    currentUser.roles.includes("system");

  return {
    systemContent,
    ready: subscription.ready(),
    hasPermission,
  };
})(SystemAdmin);
