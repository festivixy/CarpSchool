import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { ErrorReports } from "../../../api/errorReport/ErrorReport";
import BackButton from "../../mobile/components/BackButton";
import { MobileOnly } from "../../layouts/Devices";
import { Spacer } from "../../components";
import {
  Container,
  Header,
  BackButtonWrapper,
  Title,
  TitleIcon,
  Content,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  NotFoundContainer,
  NotFoundIcon,
  NotFoundTitle,
  NotFoundText,
  ErrorReportContainer,
  Section,
  SectionTitle,
  SectionContent,
  InfoGrid,
  InfoItem,
  InfoLabel,
  InfoValue,
  CodeBlock,
  BadgeContainer,
  SeverityBadge,
  CategoryBadge,
  ResolvedBadge,
  ActionButtons,
  ActionButton,
  StackTrace,
  ComponentStack,
  MetadataGrid,
  JsonViewer,
  JsonLabel,
  JsonContent,
  AdminNotes,
  NotesTextarea,
  SaveButton,
} from "../styles/AdminErrorReportDetail";

/**
 * Desktop AdminErrorReportDetail component for viewing individual error reports
 */
class DesktopAdminErrorReportDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: "",
      savingNotes: false,
      notesError: "",
    };
  }

  componentDidMount() {
    const { errorReport } = this.props;
    if (errorReport?.notes) {
      this.setState({ notes: errorReport.notes });
    }
  }

  componentDidUpdate(prevProps) {
    const { errorReport } = this.props;
    if (errorReport?.notes !== prevProps.errorReport?.notes) {
      this.setState({ notes: errorReport?.notes || "" });
    }
  }

  handleResolve = () => {
    const { errorReport } = this.props;

    swal({
      title: errorReport.resolved ? "Mark as Unresolved?" : "Mark as Resolved?",
      text: errorReport.resolved
        ? "This will mark the error report as unresolved."
        : "This will mark the error report as resolved.",
      icon: "info",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: errorReport.resolved ? "Mark Unresolved" : "Mark Resolved",
          className: "swal-button--confirm",
        },
      },
    }).then((willToggle) => {
      if (willToggle) {
        Meteor.call("errorReports.update", errorReport._id, { resolved: !errorReport.resolved }, (error) => {
          if (error) {
            swal("Error", error.message, "error");
          } else {
            swal("Success", `Error report marked as ${!errorReport.resolved ? "resolved" : "unresolved"}!`, "success");
          }
        });
      }
    });
  };

  handleDelete = () => {
    const { errorReport } = this.props;

    swal({
      title: "Delete Error Report?",
      text: "This action cannot be undone. The error report will be permanently deleted.",
      icon: "warning",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Delete",
          className: "swal-button--danger",
        },
      },
    }).then((willDelete) => {
      if (willDelete) {
        Meteor.call("errorReports.remove", errorReport._id, (error) => {
          if (error) {
            swal("Error", error.message, "error");
          } else {
            swal("Deleted", "Error report has been deleted!", "success");
            this.props.history.push("/admin/error-reports");
          }
        });
      }
    });
  };

  handleSaveNotes = () => {
    const { errorReport } = this.props;
    const { notes } = this.state;

    this.setState({ savingNotes: true, notesError: "" });

    Meteor.call("errorReports.update", errorReport._id, { notes: notes.trim() }, (error) => {
      this.setState({ savingNotes: false });

      if (error) {
        this.setState({ notesError: error.message });
      } else {
        swal("Success", "Notes saved successfully!", "success");
      }
    });
  };

  formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

  getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "#dc3545";
      case "high": return "#fd7e14";
      case "medium": return "#ffc107";
      case "low": return "#6c757d";
      default: return "#6c757d";
    }
  };

  getCategoryColor = (category) => {
    switch (category) {
      case "javascript": return "#007bff";
      case "component": return "#28a745";
      case "network": return "#6f42c1";
      case "auth": return "#dc3545";
      case "database": return "#20c997";
      default: return "#6c757d";
    }
  };

  renderJson = (data, label) => {
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return null;
    }

    return (
      <JsonViewer>
        <JsonLabel>{label}</JsonLabel>
        <JsonContent>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </JsonContent>
      </JsonViewer>
    );
  };

  render() {
    const { errorReport, ready } = this.props;
    const { notes, savingNotes, notesError } = this.state;

    if (!ready) {
      return (
        <Container>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading error report...</LoadingText>
          </LoadingContainer>
        </Container>
      );
    }

    if (!errorReport) {
      return (
        <Container>
          <NotFoundContainer>
            <NotFoundIcon>❌</NotFoundIcon>
            <NotFoundTitle>Error Report Not Found</NotFoundTitle>
            <NotFoundText>
              The error report you're looking for doesn't exist or you don't have permission to view it.
            </NotFoundText>
            <ActionButton onClick={() => this.props.history.push("/admin/error-reports")}>
              Back to Error Reports
            </ActionButton>
          </NotFoundContainer>
        </Container>
      );
    }

    return (
      <Container>
        <Header>
          <BackButtonWrapper>
            <BackButton />
          </BackButtonWrapper>
          <Title>
            <TitleIcon>🚨</TitleIcon>
            Error Report Details
          </Title>
        </Header>

        <Content>
          <ErrorReportContainer>
            {/* Error Overview */}
            <Section>
              <SectionTitle>Error Overview</SectionTitle>
              <SectionContent>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Error ID:</InfoLabel>
                    <InfoValue><CodeBlock>{errorReport.errorId}</CodeBlock></InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Message:</InfoLabel>
                    <InfoValue>{errorReport.message}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Error Type:</InfoLabel>
                    <InfoValue>{errorReport.name}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Timestamp:</InfoLabel>
                    <InfoValue>{this.formatTimestamp(errorReport.timestamp)}</InfoValue>
                  </InfoItem>
                </InfoGrid>

                <BadgeContainer>
                  <SeverityBadge color={this.getSeverityColor(errorReport.severity)}>
                    {errorReport.severity?.toUpperCase()}
                  </SeverityBadge>
                  <CategoryBadge color={this.getCategoryColor(errorReport.category)}>
                    {errorReport.category?.toUpperCase()}
                  </CategoryBadge>
                  {errorReport.resolved && (
                    <ResolvedBadge>RESOLVED</ResolvedBadge>
                  )}
                </BadgeContainer>
              </SectionContent>
            </Section>

            {/* User & Context */}
            <Section>
              <SectionTitle>User & Context</SectionTitle>
              <SectionContent>
                <MetadataGrid>
                  <InfoItem>
                    <InfoLabel>User:</InfoLabel>
                    <InfoValue>{errorReport.username || "Anonymous"}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>User ID:</InfoLabel>
                    <InfoValue>{errorReport.userId || "N/A"}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Platform:</InfoLabel>
                    <InfoValue>{errorReport.platform}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Route:</InfoLabel>
                    <InfoValue>{errorReport.route || "Unknown"}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Component:</InfoLabel>
                    <InfoValue>{errorReport.component || "Unknown"}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>URL:</InfoLabel>
                    <InfoValue>{errorReport.url}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>User Agent:</InfoLabel>
                    <InfoValue style={{ fontSize: "12px", wordBreak: "break-all" }}>
                      {errorReport.userAgent}
                    </InfoValue>
                  </InfoItem>
                </MetadataGrid>
              </SectionContent>
            </Section>

            {/* Stack Traces */}
            {errorReport.stack && (
              <Section>
                <SectionTitle>JavaScript Stack Trace</SectionTitle>
                <SectionContent>
                  <StackTrace>
                    <pre>{errorReport.stack}</pre>
                  </StackTrace>
                </SectionContent>
              </Section>
            )}

            {errorReport.componentStack && (
              <Section>
                <SectionTitle>React Component Stack</SectionTitle>
                <SectionContent>
                  <ComponentStack>
                    <pre>{errorReport.componentStack}</pre>
                  </ComponentStack>
                </SectionContent>
              </Section>
            )}

            {/* Component Data */}
            {(errorReport.props || errorReport.state) && (
              <Section>
                <SectionTitle>Component Data</SectionTitle>
                <SectionContent>
                  {this.renderJson(errorReport.props, "Props")}
                  {this.renderJson(errorReport.state, "State")}
                </SectionContent>
              </Section>
            )}

            {/* Admin Notes */}
            <Section>
              <SectionTitle>Admin Notes</SectionTitle>
              <SectionContent>
                <AdminNotes>
                  <NotesTextarea
                    value={notes}
                    onChange={(e) => this.setState({ notes: e.target.value })}
                    placeholder="Add notes about this error report..."
                    rows={6}
                  />
                  {notesError && <div style={{ color: "#dc3545", marginTop: "8px" }}>{notesError}</div>}
                  <SaveButton onClick={this.handleSaveNotes} disabled={savingNotes}>
                    {savingNotes ? "Saving..." : "Save Notes"}
                  </SaveButton>
                </AdminNotes>
              </SectionContent>
            </Section>

            {/* Actions */}
            <Section>
              <SectionTitle>Actions</SectionTitle>
              <SectionContent>
                <ActionButtons>
                  <ActionButton color="#28a745" onClick={this.handleResolve}>
                    {errorReport.resolved ? "Mark as Unresolved" : "Mark as Resolved"}
                  </ActionButton>
                  <ActionButton color="#dc3545" onClick={this.handleDelete}>
                    Delete Error Report
                  </ActionButton>
                  <ActionButton color="#6c757d" onClick={() => this.props.history.push("/admin/error-reports")}>
                    Back to List
                  </ActionButton>
                </ActionButtons>
              </SectionContent>
            </Section>
          </ErrorReportContainer>

          <MobileOnly>
            <Spacer />
          </MobileOnly>
        </Content>
      </Container>
    );
  }
}

DesktopAdminErrorReportDetail.propTypes = {
  errorReport: PropTypes.object,
  ready: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default withRouter(
  withTracker(({ match }) => {
    const errorReportId = match.params.id;
    const subscription = Meteor.subscribe("errorReports");

    return {
      errorReport: ErrorReports.findOne(errorReportId),
      ready: subscription.ready(),
    };
  })(DesktopAdminErrorReportDetail),
);
