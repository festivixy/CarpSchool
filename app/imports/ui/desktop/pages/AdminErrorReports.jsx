import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { ErrorReports } from "../../../api/errorReport/ErrorReport";
import { MobileOnly } from "../../layouts/Devices";
import { Spacer } from "../../components";
import BackButton from "../../mobile/components/BackButton";
import {
  Container,
  Header,
  Title,
  TitleIcon,
  Content,
  SearchContainer,
  SearchInput,
  SearchIcon,
  SearchResultsCount,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateText,
  ErrorReportsGrid,
  ErrorReportCard,
  ErrorReportHeader,
  ErrorReportInfo,
  ErrorReportTitle,
  ErrorReportId,
  ActionButtons,
  ActionButton,
  ViewButton,
  ErrorReportDetails,
  DetailItem,
  DetailLabel,
  DetailValue,
  BadgeContainer,
  SeverityBadge,
  CategoryBadge,
  ResolvedBadge,
  FiltersContainer,
  FilterButton,
  StatsContainer,
  StatCard,
  StatNumber,
  StatLabel,
} from "../styles/AdminErrorReports";

/**
 * Desktop AdminErrorReports component for managing error reports
 */
class DesktopAdminErrorReports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      filterBy: "all", // all, unresolved, critical, recent
      sortBy: "timestamp", // timestamp, severity, category
      sortOrder: "desc", // asc, desc
      page: 0,
      pageSize: 20,
    };
  }

  componentDidMount() {
    // Subscribe to error reports
    this.errorReportsHandle = Meteor.subscribe("errorReports", this.state.pageSize, this.state.page * this.state.pageSize);
    this.statsHandle = Meteor.subscribe("errorReports.count");
  }

  componentWillUnmount() {
    if (this.errorReportsHandle) {
      this.errorReportsHandle.stop();
    }
    if (this.statsHandle) {
      this.statsHandle.stop();
    }
  }

  handleSearch = (e) => {
    this.setState({ searchQuery: e.target.value, page: 0 });
  };

  handleFilterChange = (filter) => {
    this.setState({ filterBy: filter, page: 0 });

    // Update subscription based on filter
    if (this.errorReportsHandle) {
      this.errorReportsHandle.stop();
    }

    switch (filter) {
      case "unresolved":
        this.errorReportsHandle = Meteor.subscribe("errorReports.unresolved", this.state.pageSize);
        break;
      case "critical":
        this.errorReportsHandle = Meteor.subscribe("errorReports.critical");
        break;
      case "recent":
        this.errorReportsHandle = Meteor.subscribe("errorReports.recent", 24);
        break;
      default:
        this.errorReportsHandle = Meteor.subscribe("errorReports", this.state.pageSize, this.state.page * this.state.pageSize);
    }
  };

  handleView = (errorReport) => {
    this.props.history.push(`/admin/error-report/${errorReport._id}`);
  };

  handleResolve = (errorReportId) => {
    swal({
      title: "Mark as Resolved?",
      text: "This will mark the error report as resolved.",
      icon: "info",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Mark Resolved",
          className: "swal-button--confirm",
        },
      },
    }).then((willResolve) => {
      if (willResolve) {
        Meteor.call("errorReports.update", errorReportId, { resolved: true }, (error) => {
          if (error) {
            swal("Error", error.message, "error");
          } else {
            swal("Success", "Error report marked as resolved!", "success");
          }
        });
      }
    });
  };

  handleDelete = (errorReportId) => {
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
        Meteor.call("errorReports.remove", errorReportId, (error) => {
          if (error) {
            swal("Error", error.message, "error");
          } else {
            swal("Deleted", "Error report has been deleted!", "success");
          }
        });
      }
    });
  };

  filterErrorReports = (errorReports) => {
    const { searchQuery, sortBy, sortOrder } = this.state;

    let filtered = errorReports;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report =>
        report.message?.toLowerCase().includes(query) ||
        report.errorId?.toLowerCase().includes(query) ||
        report.username?.toLowerCase().includes(query) ||
        report.component?.toLowerCase().includes(query) ||
        report.route?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "severity":
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aVal = severityOrder[a.severity] || 0;
          bVal = severityOrder[b.severity] || 0;
          break;
        case "category":
          aVal = a.category || "";
          bVal = b.category || "";
          break;
        case "timestamp":
        default:
          aVal = new Date(a.timestamp);
          bVal = new Date(b.timestamp);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

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

  render() {
    const { searchQuery, filterBy } = this.state;
    const { errorReports, ready } = this.props;

    if (!ready) {
      return (
        <Container>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading error reports...</LoadingText>
          </LoadingContainer>
        </Container>
      );
    }

    const filteredReports = this.filterErrorReports(errorReports);

    return (
      <Container>
        <BackButton />
        <Header>
          <Title>
            <TitleIcon>🚨</TitleIcon>
            Error Reports
          </Title>
        </Header>

        <Content>
          {/* Stats Overview */}
          <StatsContainer>
            <StatCard>
              <StatNumber>{errorReports.length}</StatNumber>
              <StatLabel>Total Reports</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{errorReports.filter(r => !r.resolved).length}</StatNumber>
              <StatLabel>Unresolved</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{errorReports.filter(r => r.severity === 'critical' && !r.resolved).length}</StatNumber>
              <StatLabel>Critical</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{errorReports.filter(r => {
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return new Date(r.timestamp) > dayAgo;
              }).length}</StatNumber>
              <StatLabel>Last 24h</StatLabel>
            </StatCard>
          </StatsContainer>

          {/* Filters */}
          <FiltersContainer>
            <FilterButton
              active={filterBy === "all"}
              onClick={() => this.handleFilterChange("all")}
            >
              All Reports
            </FilterButton>
            <FilterButton
              active={filterBy === "unresolved"}
              onClick={() => this.handleFilterChange("unresolved")}
            >
              Unresolved
            </FilterButton>
            <FilterButton
              active={filterBy === "critical"}
              onClick={() => this.handleFilterChange("critical")}
            >
              Critical
            </FilterButton>
            <FilterButton
              active={filterBy === "recent"}
              onClick={() => this.handleFilterChange("recent")}
            >
              Recent (24h)
            </FilterButton>
          </FiltersContainer>

          {/* Search */}
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search by error message, ID, user, component, or route..."
              value={searchQuery}
              onChange={this.handleSearch}
            />
          </SearchContainer>

          <SearchResultsCount>
            {filteredReports.length} error report{filteredReports.length !== 1 ? "s" : ""} found
          </SearchResultsCount>

          {/* Error Reports Grid */}
          {filteredReports.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>📋</EmptyStateIcon>
              <EmptyStateTitle>No error reports found</EmptyStateTitle>
              <EmptyStateText>
                {searchQuery ? "Try adjusting your search terms" : "No error reports match the current filter"}
              </EmptyStateText>
            </EmptyState>
          ) : (
            <ErrorReportsGrid>
              {filteredReports.map((errorReport) => (
                <ErrorReportCard key={errorReport._id} resolved={errorReport.resolved}>
                  <ErrorReportHeader>
                    <ErrorReportInfo>
                      <ErrorReportTitle>
                        {errorReport.message?.substring(0, 100)}
                        {errorReport.message?.length > 100 ? "..." : ""}
                      </ErrorReportTitle>
                      <ErrorReportId>ID: {errorReport.errorId}</ErrorReportId>
                    </ErrorReportInfo>
                    <ActionButtons>
                      <ViewButton onClick={() => this.handleView(errorReport)}>
                        View Details
                      </ViewButton>
                      {!errorReport.resolved && (
                        <ActionButton
                          color="#28a745"
                          onClick={() => this.handleResolve(errorReport._id)}
                        >
                          Resolve
                        </ActionButton>
                      )}
                      <ActionButton
                        color="#dc3545"
                        onClick={() => this.handleDelete(errorReport._id)}
                      >
                        Delete
                      </ActionButton>
                    </ActionButtons>
                  </ErrorReportHeader>

                  <ErrorReportDetails>
                    <DetailItem>
                      <DetailLabel>User:</DetailLabel>
                      <DetailValue>{errorReport.username || "Anonymous"}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Component:</DetailLabel>
                      <DetailValue>{errorReport.component || "Unknown"}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Route:</DetailLabel>
                      <DetailValue>{errorReport.route || "Unknown"}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Platform:</DetailLabel>
                      <DetailValue>{errorReport.platform || "Web"}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Time:</DetailLabel>
                      <DetailValue>{this.formatTimestamp(errorReport.timestamp)}</DetailValue>
                    </DetailItem>
                  </ErrorReportDetails>

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
                </ErrorReportCard>
              ))}
            </ErrorReportsGrid>
          )}

          <MobileOnly>
            <Spacer />
          </MobileOnly>
        </Content>
      </Container>
    );
  }
}

DesktopAdminErrorReports.propTypes = {
  errorReports: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(
  withTracker(() => {
    const subscription = Meteor.subscribe("errorReports", 50, 0);
    return {
      errorReports: ErrorReports.find({}, { sort: { timestamp: -1 } }).fetch(),
      ready: subscription.ready(),
    };
  })(DesktopAdminErrorReports),
);
