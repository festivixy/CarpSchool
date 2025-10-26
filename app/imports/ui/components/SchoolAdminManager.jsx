import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import {
  Container,
  Header,
  Title,
  Subtitle,
  Content,
  SearchSection,
  SearchInput,
  SearchButton,
  UsersList,
  UserCard,
  UserInfo,
  UserEmail,
  UserSchool,
  UserRoles,
  Actions,
  AddAdminButton,
  RemoveAdminButton,
  LoadingState,
  ErrorMessage,
  SuccessMessage,
  EmptyState,
  SchoolSelector,
  SchoolOption,
  FilterSection,
  FilterGroup,
  FilterLabel,
  FilterSelect,
} from "../styles/SchoolAdminManager";

/**
 * SchoolAdminManager component - Allows system admins to manage school administrators
 */
const SchoolAdminManager = ({ schools }) => {
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [sortBy, setSortBy] = useState("email");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    setError("");

    Meteor.call("admin.getManagedUsers", (err, result) => {
      setLoading(false);
      if (err) {
        setError(err.reason || "Failed to load users");
        setUsers([]);
      } else {
        setUsers(result || []);
      }
    });
  };

  const handleSearch = () => {
    if (!searchEmail.trim()) {
      setError("Please enter an email address to search");
      return;
    }

    setLoading(true);
    setError("");

    // Filter users by email
    const filtered = users.filter(user =>
      user.emails?.[0]?.address?.toLowerCase().includes(searchEmail.toLowerCase())
    );

    setTimeout(() => {
      setLoading(false);
      if (filtered.length === 0) {
        setError(`No users found with email containing "${searchEmail}"`);
      }
    }, 300);
  };

  const handleMakeSchoolAdmin = (userId, userEmail) => {
    if (!selectedSchool) {
      setError("Please select a school first");
      return;
    }

    if (processing) return;

    setProcessing(userId);
    setError("");
    setSuccess("");

    // First assign user to the school, then make them admin
    Meteor.call("accounts.assignUserToSchool", userId, selectedSchool, (err) => {
      if (err) {
        setProcessing(null);
        setError(err.reason || "Failed to assign user to school");
        return;
      }

      // Now make them school admin
      Meteor.call("admin.makeSchoolAdmin", userId, (err, result) => {
        setProcessing(null);
        if (err) {
          setError(err.reason || "Failed to make user school admin");
        } else {
          setSuccess(`${userEmail} has been made a school administrator!`);
          loadUsers(); // Reload users to show updated roles

          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(""), 3000);
        }
      });
    });
  };

  const handleRemoveSchoolAdmin = (userId, userEmail) => {
    if (processing) return;

    setProcessing(userId);
    setError("");
    setSuccess("");

    Meteor.call("admin.removeSchoolAdmin", userId, (err, result) => {
      setProcessing(null);
      if (err) {
        setError(err.reason || "Failed to remove school admin role");
      } else {
        setSuccess(`${userEmail} has been removed as school administrator.`);
        loadUsers(); // Reload users to show updated roles

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    });
  };

  const isSchoolAdmin = (user) => {
    return user.roles?.some(role => role.startsWith("admin."));
  };

  const isSystemAdmin = (user) => {
    return user.roles?.includes("system");
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s._id === schoolId);
    return school?.name || "Unknown School";
  };

  const filteredUsers = users
    .filter(user => {
      // Search filter
      if (searchEmail.trim()) {
        const email = user.emails?.[0]?.address?.toLowerCase() || "";
        if (!email.includes(searchEmail.toLowerCase())) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== "all") {
        if (roleFilter === "system" && !isSystemAdmin(user)) return false;
        if (roleFilter === "school" && !isSchoolAdmin(user)) return false;
        if (roleFilter === "regular" && (isSystemAdmin(user) || isSchoolAdmin(user))) return false;
      }

      // School filter
      if (schoolFilter !== "all") {
        if (!user.schoolId || user.schoolId !== schoolFilter) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "email":
          aVal = a.emails?.[0]?.address || "";
          bVal = b.emails?.[0]?.address || "";
          break;
        case "school":
          aVal = getSchoolName(a.schoolId);
          bVal = getSchoolName(b.schoolId);
          break;
        case "role":
          aVal = isSystemAdmin(a) ? "system" : (isSchoolAdmin(a) ? "school" : "regular");
          bVal = isSystemAdmin(b) ? "system" : (isSchoolAdmin(b) ? "school" : "regular");
          break;
        case "created":
          aVal = new Date(a.createdAt || 0);
          bVal = new Date(b.createdAt || 0);
          break;
        default:
          aVal = a.emails?.[0]?.address || "";
          bVal = b.emails?.[0]?.address || "";
      }

      if (sortOrder === "desc") {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

  return (
    <Container>
      <Header>
        <Title>Manage School Administrators</Title>
        <Subtitle>Add or remove school administrator roles for users</Subtitle>
      </Header>

      <Content>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <SearchSection>
          <SearchInput
            type="email"
            placeholder="Search users by email address..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <SearchButton onClick={handleSearch} disabled={loading}>
            🔍 Search
          </SearchButton>
        </SearchSection>

        <SchoolSelector>
          <label htmlFor="school-select">Select School for New Admins:</label>
          <select
            id="school-select"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="">Choose a school...</option>
            {schools.map(school => (
              <SchoolOption key={school._id} value={school._id}>
                {school.name} ({school.code})
              </SchoolOption>
            ))}
          </select>
        </SchoolSelector>

        <FilterSection>
          <FilterGroup>
            <FilterLabel>Filter by Role:</FilterLabel>
            <FilterSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="system">System Admins</option>
              <option value="school">School Admins</option>
              <option value="regular">Regular Users</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Filter by School:</FilterLabel>
            <FilterSelect value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}>
              <option value="all">All Schools</option>
              {schools.map(school => (
                <option key={school._id} value={school._id}>
                  {school.name}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Sort by:</FilterLabel>
            <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="email">Email</option>
              <option value="school">School</option>
              <option value="role">Role</option>
              <option value="created">Date Created</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Order:</FilterLabel>
            <FilterSelect value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </FilterSelect>
          </FilterGroup>
        </FilterSection>

        {loading ? (
          <LoadingState>
            <div>🔍 Loading users...</div>
          </LoadingState>
        ) : filteredUsers.length === 0 ? (
          <EmptyState>
            <div>👥</div>
            <h3>No users found</h3>
            <p>
              {searchEmail.trim() || roleFilter !== "all" || schoolFilter !== "all"
                ? "No users match the current search and filter criteria"
                : "No users available to manage"
              }
            </p>
          </EmptyState>
        ) : (
          <UsersList>
            {filteredUsers.map((user) => (
              <UserCard key={user._id}>
                <UserInfo>
                  <UserEmail>{user.emails?.[0]?.address || "No email"}</UserEmail>
                  <UserSchool>
                    🏫 {user.schoolId ? getSchoolName(user.schoolId) : "No school assigned"}
                  </UserSchool>
                  <UserRoles>
                    {isSystemAdmin(user) && (
                      <span className="system-admin">🌟 System Admin</span>
                    )}
                    {isSchoolAdmin(user) && (
                      <span className="school-admin">👑 School Admin</span>
                    )}
                    {!isSystemAdmin(user) && !isSchoolAdmin(user) && (
                      <span className="regular-user">👤 Regular User</span>
                    )}
                  </UserRoles>
                </UserInfo>

                <Actions>
                  {!isSystemAdmin(user) && !isSchoolAdmin(user) && (
                    <AddAdminButton
                      onClick={() => handleMakeSchoolAdmin(user._id, user.emails?.[0]?.address)}
                      disabled={processing === user._id || !selectedSchool}
                      title={!selectedSchool ? "Select a school first" : "Make school administrator"}
                    >
                      {processing === user._id ? "Adding..." : "👑 Make Admin"}
                    </AddAdminButton>
                  )}

                  {isSchoolAdmin(user) && !isSystemAdmin(user) && (
                    <RemoveAdminButton
                      onClick={() => handleRemoveSchoolAdmin(user._id, user.emails?.[0]?.address)}
                      disabled={processing === user._id}
                    >
                      {processing === user._id ? "Removing..." : "❌ Remove Admin"}
                    </RemoveAdminButton>
                  )}

                  {isSystemAdmin(user) && (
                    <div style={{
                      color: "#666",
                      fontSize: "12px",
                      fontStyle: "italic"
                    }}>
                      System admins cannot be modified
                    </div>
                  )}
                </Actions>
              </UserCard>
            ))}
          </UsersList>
        )}
      </Content>
    </Container>
  );
};

SchoolAdminManager.propTypes = {
  schools: PropTypes.array.isRequired,
};

export default SchoolAdminManager;
