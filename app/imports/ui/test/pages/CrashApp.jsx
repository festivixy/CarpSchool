import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import BackButton from "../../mobile/components/BackButton";
import {
  PageContainer,
  FixedHeader,
  HeaderTitle,
  ContentPadding,
  MainCard,
  MainTitle,
  MainDescription,
  CrashButton,
  CrashIcon,
  WarningCard,
  WarningIcon,
  WarningTitle,
  WarningDescription,
} from "../styles/CrashApp";

/**
 * CrashApp Test Page - Admin only
 * Testing page that intentionally crashes the application to test ErrorBoundary
 */
class CrashApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldCrash: false,
    };
  }

  handleCrash = () => {
    // Set state to trigger a crash in render
    this.setState({ shouldCrash: true });
  };

  render() {
    // Intentionally crash the app when shouldCrash is true
    if (this.state.shouldCrash) {
      // This will throw an error and be caught by ErrorBoundary
      throw new Error("Intentional crash triggered by CrashApp test page - This is expected behavior for testing ErrorBoundary functionality");
    }

    return (
      <PageContainer>
        <BackButton />

        {/* Fixed Header */}
        <FixedHeader>
          <HeaderTitle>
            Crash App Test
          </HeaderTitle>
        </FixedHeader>

        <ContentPadding>
          <MainCard>
            <MainTitle>
              🚨 Application Crash Test
            </MainTitle>
            <MainDescription>
              This page allows you to intentionally crash the application to test 
              the ErrorBoundary component and error reporting functionality.
            </MainDescription>
          </MainCard>

          <WarningCard>
            <WarningIcon>
              ⚠️
            </WarningIcon>
            <WarningTitle>
              Warning
            </WarningTitle>
            <WarningDescription>
              Clicking the crash button will throw an error that will be caught by 
              the ErrorBoundary component. This will display the error screen and 
              test the error reporting system. Use this to verify that error handling 
              is working correctly.
            </WarningDescription>
          </WarningCard>

          <CrashButton onClick={this.handleCrash}>
            <CrashIcon>
              💥
            </CrashIcon>
            Crash the App
          </CrashButton>
        </ContentPadding>
      </PageContainer>
    );
  }
}

CrashApp.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(CrashApp);
