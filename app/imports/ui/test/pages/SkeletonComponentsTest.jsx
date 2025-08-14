import React, { useState } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import BackButton from "../../mobile/components/BackButton";
import { MyRidesSkeleton } from "../../skeleton";
import {
  PageContainer,
  FixedHeader,
  HeaderTitle,
  ContentPadding,
  MainCard,
  MainTitle,
  MainDescription,
  SkeletonSection,
  SkeletonTitle,
  SkeletonDescription,
  ControlsCard,
  ControlGroup,
  ControlLabel,
  ControlInput,
  ControlButton,
  SkeletonPreview,
  SkeletonContainer,
  CodeBlock,
  ImportCode,
  SkeletonDemo,
  DemoCard,
  DemoTitle,
  DemoDescription,
  UserInfoCard,
  UserInfoTitle,
  UserInfoItem,
  UserRoleBadge,
} from "../styles/SkeletonComponentsTest";

/**
 * Skeleton Components Test Page
 * Visual testing and demonstration of all available skeleton loading components
 */
const SkeletonComponentsTest = ({ history, currentUser, isAdmin }) => {
  const [myRidesConfig, setMyRidesConfig] = useState({
    numberOfRides: 3,
    showDemo: false,
  });

  const handleMyRidesConfigChange = (key, value) => {
    setMyRidesConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleDemo = (demoKey) => {
    setMyRidesConfig(prev => ({
      ...prev,
      showDemo: prev.showDemo === demoKey ? false : demoKey
    }));
  };

  return (
    <PageContainer>
      <FixedHeader>
        <BackButton />
        <HeaderTitle>Skeleton Components Test</HeaderTitle>
      </FixedHeader>

      <ContentPadding>
        {/* Main Info */}
        <MainCard>
          <MainTitle>🦴 Skeleton Loading Components</MainTitle>
          <MainDescription>
            Test and configure skeleton loading states for better UX during data loading.
            Skeleton components provide visual placeholders that match the actual content structure.
          </MainDescription>
        </MainCard>

        {/* User Info */}
        {currentUser && (
          <UserInfoCard>
            <UserInfoTitle>Test User Info</UserInfoTitle>
            <UserInfoItem>
              <strong>Username:</strong> {currentUser.username}
            </UserInfoItem>
            <UserInfoItem>
              <strong>Admin Status:</strong>
              <UserRoleBadge isAdmin={isAdmin}>
                {isAdmin ? "Admin" : "User"}
              </UserRoleBadge>
            </UserInfoItem>
          </UserInfoCard>
        )}

        {/* MyRides Skeleton */}
        <SkeletonSection>
          <SkeletonTitle>🚗 MyRides Skeleton</SkeletonTitle>
          <SkeletonDescription>
            Skeleton loading state for the MyRides page. Shows header, tabs, search, and ride cards
            with shimmer animation.
          </SkeletonDescription>

          {/* Controls */}
          <ControlsCard>
            <ControlGroup>
              <ControlLabel>Number of Rides:</ControlLabel>
              <ControlInput
                type="number"
                min="1"
                max="10"
                value={myRidesConfig.numberOfRides}
                onChange={(e) => handleMyRidesConfigChange('numberOfRides', parseInt(e.target.value))}
              />
            </ControlGroup>
            <ControlButton
              onClick={() => toggleDemo('myrides')}
              active={myRidesConfig.showDemo === 'myrides'}
            >
              {myRidesConfig.showDemo === 'myrides' ? 'Hide Demo' : 'Show Demo'}
            </ControlButton>
          </ControlsCard>

          {/* Import Code */}
          <CodeBlock>
            <ImportCode>
              {`import { MyRidesSkeleton } from "../../skeleton";

<MyRidesSkeleton numberOfRides={${myRidesConfig.numberOfRides}} />`}
            </ImportCode>
          </CodeBlock>

          {/* Demo */}
          {myRidesConfig.showDemo === 'myrides' && (
            <SkeletonDemo>
              <DemoCard>
                <DemoTitle>Live Demo</DemoTitle>
                <DemoDescription>
                  Interactive preview with {myRidesConfig.numberOfRides} skeleton ride{myRidesConfig.numberOfRides !== 1 ? 's' : ''}
                </DemoDescription>
                <SkeletonPreview>
                  <SkeletonContainer>
                    <MyRidesSkeleton numberOfRides={myRidesConfig.numberOfRides} />
                  </SkeletonContainer>
                </SkeletonPreview>
              </DemoCard>
            </SkeletonDemo>
          )}
        </SkeletonSection>

        {/* Future Skeleton Components */}
        <SkeletonSection>
          <SkeletonTitle>🔮 Future Skeleton Components</SkeletonTitle>
          <SkeletonDescription>
            Additional skeleton components can be added here as they are developed:
          </SkeletonDescription>
          
          <CodeBlock>
            <ImportCode style={{ color: '#666', fontStyle: 'italic' }}>
              {`// Future components:
// - ChatSkeleton
// - ProfileSkeleton  
// - RideDetailSkeleton
// - PlaceManagerSkeleton
// - etc.

// Each following the same pattern:
import { ComponentSkeleton } from "../../skeleton";
<ComponentSkeleton config={...} />`}
            </ImportCode>
          </CodeBlock>
        </SkeletonSection>

        {/* Best Practices */}
        <SkeletonSection>
          <SkeletonTitle>✨ Best Practices</SkeletonTitle>
          <SkeletonDescription>
            Guidelines for creating and using skeleton components:
          </SkeletonDescription>
          
          <CodeBlock>
            <ImportCode style={{ fontSize: '14px', lineHeight: '1.6' }}>
              {`1. Match the actual component structure exactly
2. Use consistent shimmer animation across all skeletons
3. Maintain proper spacing and proportions
4. Make skeletons configurable (number of items, etc.)
5. Replace basic loading spinners with contextual skeletons
6. Keep skeleton file sizes minimal
7. Test on different screen sizes`}
            </ImportCode>
          </CodeBlock>
        </SkeletonSection>
      </ContentPadding>
    </PageContainer>
  );
};

SkeletonComponentsTest.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  isAdmin: PropTypes.bool.isRequired,
};

export default withRouter(
  withTracker(() => {
    const currentUser = Meteor.user();
    const isAdmin = currentUser?.profile?.role === "admin";

    return {
      currentUser,
      isAdmin,
    };
  })(SkeletonComponentsTest)
);
