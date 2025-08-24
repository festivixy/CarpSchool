import React, { Component } from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Schools } from "../../api/schools/Schools";
import {
  SelectorContainer,
  SelectorHeader,
  SelectorTitle,
  SelectorSubtitle,
  SchoolsList,
  SchoolItem,
  SchoolInfo,
  SchoolName,
  SchoolLocation,
  SchoolCode,
  LoadingContainer,
  ErrorContainer,
  SearchInput,
} from "../styles/SchoolSelector";

/**
 * School selection component for registration
 */
class SchoolSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: "",
      selectedSchoolId: props.selectedSchoolId || null,
      autoDetectedSchool: null,
    };
  }

  componentDidMount() {
    // Try to auto-detect school from email if provided
    if (this.props.userEmail) {
      this.detectSchoolFromEmail(this.props.userEmail);
    }
  }

  detectSchoolFromEmail = async (email) => {
    try {
      const result = await Meteor.callAsync("schools.getByDomain", email);
      if (result) {
        this.setState({
          autoDetectedSchool: result,
          selectedSchoolId: result._id,
        });
        if (this.props.onSchoolSelect) {
          this.props.onSchoolSelect(result._id, result);
        }
      }
    } catch (error) {
      // No school found for this domain, that's ok
    }
  };

  handleSchoolSelect = (schoolId, school) => {
    this.setState({ selectedSchoolId: schoolId });
    if (this.props.onSchoolSelect) {
      this.props.onSchoolSelect(schoolId, school);
    }
  };

  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  getFilteredSchools = () => {
    const { schools } = this.props;
    const { searchTerm } = this.state;

    if (!searchTerm) return schools;

    const term = searchTerm.toLowerCase();
    return schools.filter(school => school.name.toLowerCase().includes(term) ||
      school.shortName.toLowerCase().includes(term) ||
      school.code.toLowerCase().includes(term) ||
      school.location.city.toLowerCase().includes(term));
  };

  render() {
    const { loading, error } = this.props;
    const { selectedSchoolId, autoDetectedSchool, searchTerm } = this.state;

    if (loading) {
      return (
        <LoadingContainer>
          <div>🏫 Loading schools...</div>
        </LoadingContainer>
      );
    }

    if (error) {
      return (
        <ErrorContainer>
          <div>❌ Error loading schools: {error.message}</div>
        </ErrorContainer>
      );
    }

    const filteredSchools = this.getFilteredSchools();

    return (
      <SelectorContainer>
        <SelectorHeader>
          <SelectorTitle>Select Your School</SelectorTitle>
          <SelectorSubtitle>
            Choose your educational institution to connect with fellow students
          </SelectorSubtitle>
        </SelectorHeader>

        {autoDetectedSchool && (
          <div style={{
            background: "#e8f5e8",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid #4caf50",
          }}>
            ✅ <strong>Auto-detected:</strong> {autoDetectedSchool.name}
            (based on your email domain)
          </div>
        )}

        <SearchInput
          type="text"
          placeholder="🔍 Search schools by name, city, or code..."
          value={searchTerm}
          onChange={this.handleSearchChange}
        />

        <SchoolsList>
          {filteredSchools.map((school) => (
            <SchoolItem
              key={school._id}
              selected={selectedSchoolId === school._id}
              onClick={() => this.handleSchoolSelect(school._id, school)}
            >
              <SchoolInfo>
                <SchoolName>{school.name}</SchoolName>
                <SchoolLocation>
                  📍 {school.location.city}, {school.location.province}
                </SchoolLocation>
              </SchoolInfo>
              <SchoolCode>{school.code}</SchoolCode>
            </SchoolItem>
          ))}
        </SchoolsList>

        {filteredSchools.length === 0 && searchTerm && (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No schools found matching "{searchTerm}"
          </div>
        )}

        {filteredSchools.length === 0 && !searchTerm && (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No schools available. Please contact support.
          </div>
        )}
      </SelectorContainer>
    );
  }
}

SchoolSelector.propTypes = {
  schools: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  selectedSchoolId: PropTypes.string,
  userEmail: PropTypes.string,
  onSchoolSelect: PropTypes.func.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe("schools.active");
  const schools = Schools.find({}, { sort: { name: 1 } }).fetch();

  return {
    schools,
    loading: !subscription.ready(),
    error: null, // Add error handling as needed
  };
})(SchoolSelector);
