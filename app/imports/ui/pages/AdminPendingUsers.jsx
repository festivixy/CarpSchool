import React from "react";
import AdminPendingUsers from "../components/AdminPendingUsers";
import BackButton from "../mobile/components/BackButton";
import {
  Container,
  Header,
  AppName,
  Content,
} from "../styles/AdminPendingUsersPage";

/**
 * AdminPendingUsersPage - Standalone page for managing pending user approvals
 * Accessible to both system admins and school admins (school admins see only their own students)
 */
const AdminPendingUsersPage = () => {
  return (
    <Container>
      <BackButton />
      <Header>
        <AppName>Pending User Approvals</AppName>
      </Header>

      <Content>
        <AdminPendingUsers />
      </Content>
    </Container>
  );
};

export default AdminPendingUsersPage;
