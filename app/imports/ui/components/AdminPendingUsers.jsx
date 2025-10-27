import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { getImageUrl } from "../mobile/utils/imageUtils";
import UserVerificationPopup from "./UserVerificationPopup";
import {
  Container,
  Header,
  Title,
  Subtitle,
  Content,
  UserCard,
  UserInfo,
  UserAvatar,
  UserDetails,
  UserName,
  UserType,
  UserEmail,
  UserSchool,
  UserMeta,
  Actions,
  ApproveButton,
  RejectButton,
  LoadingState,
  EmptyState,
  ErrorMessage,
  SuccessMessage,
  RefreshButton,
  RejectModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalActions,
  RejectInput,
  ModalButton,
} from "../styles/AdminPendingUsers";

/**
 * AdminPendingUsers component - Manage users pending approval
 */
const AdminPendingUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserPopup, setShowUserPopup] = useState(false);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = () => {
    setLoading(true);
    setError("");

    Meteor.call("admin.getPendingUsers", (err, result) => {
      setLoading(false);
      if (err) {
        setError(err.reason || "Failed to load pending users");
        setPendingUsers([]);
      } else {
        setPendingUsers(result.pendingUsers || []);
      }
    });
  };



  const handleApprove = (userId, userName) => {
    if (processing) return;

    setProcessing(userId);
    setError("");
    setSuccess("");

    Meteor.call("admin.approveUser", userId, (err, result) => {
      setProcessing(null);
      if (err) {
        setError(err.reason || "Failed to approve user");
      } else {
        setSuccess(`${userName} has been approved successfully!`);
        // Remove the approved user from the list
        setPendingUsers(prev => prev.filter(user => user.Owner !== userId));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    });
  };

  const handleRejectClick = (userId) => {
    setRejectUserId(userId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (processing || !rejectUserId) return;

    setProcessing(rejectUserId);
    setError("");
    setSuccess("");

    Meteor.call("admin.rejectUser", rejectUserId, rejectReason, (err, result) => {
      setProcessing(null);
      setShowRejectModal(false);

      if (err) {
        setError(err.reason || "Failed to reject user");
      } else {
        setSuccess(`${result.userName} has been rejected.`);
        // Remove the rejected user from the list
        setPendingUsers(prev => prev.filter(user => user.Owner !== rejectUserId));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }

      setRejectUserId(null);
      setRejectReason("");
    });
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectUserId(null);
    setRejectReason("");
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserPopup(true);
  };

  const handleCloseUserPopup = () => {
    setShowUserPopup(false);
    setSelectedUser(null);
  };

  const handlePopupSuccess = (message) => {
    setSuccess(message);
    // Remove the user from the list
    if (selectedUser) {
      setPendingUsers(prev => prev.filter(user => user.Owner !== selectedUser.Owner));
    }
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(""), 3000);
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Pending User Approvals</Title>
          <Subtitle>Manage users waiting for verification approval</Subtitle>
        </Header>
        <LoadingState>
          <div>⏳ Loading pending users...</div>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Pending User Approvals</Title>
        <Subtitle>
          {pendingUsers.length} user{pendingUsers.length !== 1 ? "s" : ""} waiting for approval
        </Subtitle>
        <RefreshButton onClick={loadPendingUsers} disabled={loading}>
          🔄 Refresh
        </RefreshButton>
      </Header>

      <Content>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {pendingUsers.length === 0 ? (
          <EmptyState>
            <div>🎉</div>
            <h3>No pending approvals!</h3>
            <p>All users are currently approved. Check back later for new verification requests.</p>
          </EmptyState>
        ) : (
          pendingUsers.map((user) => (
            <UserCard key={user.Owner} onClick={() => handleUserClick(user)}>
              <UserInfo>
                <UserAvatar>
                  {user.Image ? (
                    <img src={getImageUrl(user.Image)} alt={user.Name} />
                  ) : (
                    <div className="placeholder">
                      {user.Name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                </UserAvatar>

                <UserDetails>
                  <UserName>{user.Name}</UserName>
                  <UserType userType={user.UserType}>
                    {user.UserType === "Driver" ? "🚗 Driver" : "🎒 Rider"}
                  </UserType>
                  <UserEmail>{user.userEmail}</UserEmail>
                  {user.schoolemail && (
                    <UserEmail>📧 School: {user.schoolemail}</UserEmail>
                  )}
                  <UserSchool>🏫 {user.schoolName}</UserSchool>
                  {user.Phone && (
                    <UserMeta>📞 {user.Phone}</UserMeta>
                  )}
                  <UserMeta>
                    📅 Joined: {formatDate(user.userCreatedAt)}
                  </UserMeta>
                </UserDetails>
              </UserInfo>

              <Actions onClick={(e) => e.stopPropagation()}>
                <ApproveButton
                  onClick={() => handleApprove(user.Owner, user.Name)}
                  disabled={processing === user.Owner}
                >
                  {processing === user.Owner ? "Approving..." : "✅ Approve"}
                </ApproveButton>

                <RejectButton
                  onClick={() => handleRejectClick(user.Owner)}
                  disabled={processing === user.Owner}
                >
                  {processing === user.Owner ? "Processing..." : "❌ Reject"}
                </RejectButton>
              </Actions>
            </UserCard>
          ))
        )}
      </Content>

      {/* Reject Modal */}
      {showRejectModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h3>Reject User Verification</h3>
            </ModalHeader>

            <ModalBody>
              <p>
                Are you sure you want to reject this user? They will need to complete
                verification again.
              </p>

              <RejectInput
                type="text"
                placeholder="Reason for rejection (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                maxLength={500}
              />
            </ModalBody>

            <ModalActions>
              <ModalButton onClick={handleRejectCancel}>
                Cancel
              </ModalButton>
              <ModalButton
                primary
                onClick={handleRejectConfirm}
                disabled={processing}
              >
                {processing ? "Rejecting..." : "Confirm Rejection"}
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* User Verification Popup */}
      {showUserPopup && selectedUser && (
        <UserVerificationPopup
          user={selectedUser}
          onClose={handleCloseUserPopup}
          onSuccess={handlePopupSuccess}
        />
      )}
    </Container>
  );
};

export default AdminPendingUsers;
