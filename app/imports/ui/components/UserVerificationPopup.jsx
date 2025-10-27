import React, { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { getImageUrl } from "../mobile/utils/imageUtils";
import {
  PopupOverlay,
  PopupContent,
  PopupHeader,
  CloseButton,
  PopupTitle,
  PopupBody,
  UserSection,
  UserAvatar,
  UserInfo,
  UserName,
  UserBadge,
  InfoGrid,
  InfoItem,
  InfoLabel,
  InfoValue,
  Actions,
  ApproveButton,
  RejectButton,
  RejectModal,
  RejectModalContent,
  RejectModalHeader,
  RejectModalBody,
  RejectModalActions,
  RejectInput,
  ModalButton,
  ErrorMessage,
} from "../styles/UserVerificationPopup";

/**
 * UserVerificationPopup component - Display user details with approve/reject actions
 */
const UserVerificationPopup = ({ user, onClose, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  const handleApprove = () => {
    if (processing) return;

    setProcessing(true);
    setError("");

    Meteor.call("admin.approveUser", user.Owner, (err, result) => {
      setProcessing(false);
      if (err) {
        setError(err.reason || "Failed to approve user");
      } else {
        onSuccess(`${user.Name} has been approved successfully!`);
        onClose();
      }
    });
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
    setRejectReason("");
    setError("");
  };

  const handleRejectConfirm = () => {
    if (processing) return;

    setProcessing(true);
    setError("");

    Meteor.call("admin.rejectUser", user.Owner, rejectReason, (err, result) => {
      setProcessing(false);
      setShowRejectModal(false);

      if (err) {
        setError(err.reason || "Failed to reject user");
      } else {
        onSuccess(`${user.Name} has been rejected.`);
        onClose();
      }

      setRejectReason("");
    });
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setError("");
  };

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContent onClick={(e) => e.stopPropagation()}>
        <PopupHeader>
          <PopupTitle>User Verification Details</PopupTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </PopupHeader>

        <PopupBody>
          <UserSection>
            <UserAvatar>
              {user.Image ? (
                <img src={getImageUrl(user.Image)} alt={user.Name} />
              ) : (
                <div className="placeholder">
                  {user.Name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </UserAvatar>

            <UserInfo>
              <UserName>{user.Name}</UserName>
              <UserBadge userType={user.UserType}>
                {user.UserType === "Driver" ? "🚗 Driver" : "🎒 Rider"}
              </UserBadge>
            </UserInfo>
          </UserSection>

          <InfoGrid>
            <InfoItem>
              <InfoLabel>Account Email</InfoLabel>
              <InfoValue>{user.userEmail}</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>School Email</InfoLabel>
              <InfoValue>
                {user.schoolemail ? `📧 ${user.schoolemail}` : "Not provided"}
              </InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>School</InfoLabel>
              <InfoValue>🏫 {user.schoolName || "Not specified"}</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Phone Number</InfoLabel>
              <InfoValue>
                {user.Phone ? `📞 ${user.Phone}` : "Not provided"}
              </InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Account Created</InfoLabel>
              <InfoValue>📅 {formatDate(user.userCreatedAt)}</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Verification Status</InfoLabel>
              <InfoValue>⏳ Pending Admin Approval</InfoValue>
            </InfoItem>

            {user.Location && (
              <InfoItem>
                <InfoLabel>Location</InfoLabel>
                <InfoValue>📍 {user.Location}</InfoValue>
              </InfoItem>
            )}

            {user.Other && (
              <InfoItem>
                <InfoLabel>Additional Info</InfoLabel>
                <InfoValue>{user.Other}</InfoValue>
              </InfoItem>
            )}
          </InfoGrid>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Actions>
            <ApproveButton
              onClick={handleApprove}
              disabled={processing}
            >
              {processing ? "Approving..." : "✅ Approve User"}
            </ApproveButton>

            <RejectButton
              onClick={handleRejectClick}
              disabled={processing}
            >
              {processing ? "Processing..." : "❌ Reject User"}
            </RejectButton>
          </Actions>
        </PopupBody>

        {/* Reject Modal */}
        {showRejectModal && (
          <RejectModal>
            <RejectModalContent>
              <RejectModalHeader>
                <h3>Reject User Verification</h3>
              </RejectModalHeader>

              <RejectModalBody>
                <p>
                  Are you sure you want to reject <strong>{user.Name}</strong>?
                  They will need to complete verification again.
                </p>

                <RejectInput
                  type="text"
                  placeholder="Reason for rejection (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  maxLength={500}
                />
              </RejectModalBody>

              <RejectModalActions>
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
              </RejectModalActions>
            </RejectModalContent>
          </RejectModal>
        )}
      </PopupContent>
    </PopupOverlay>
  );
};

UserVerificationPopup.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default UserVerificationPopup;
