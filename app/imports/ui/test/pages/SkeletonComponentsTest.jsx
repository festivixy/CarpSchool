import React, { useState } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import BackButton from "../../mobile/components/BackButton";
import {
  MyRidesSkeleton, ChatSkeleton, CreateRideSkeleton, MobileGenericSkeleton, RideInfoSkeleton,
} from "../../skeleton";
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
const SkeletonComponentsTest = ({ history: _history, currentUser, isAdmin }) => {
  const [myRidesConfig, setMyRidesConfig] = useState({
    numberOfRides: 3,
    showDemo: false,
  });

  const [chatConfig, setChatConfig] = useState({
    numberOfChats: 4,
    numberOfMessages: 8,
    showMobileLayout: false,
    showDemo: false,
  });

  const [createRideConfig, setCreateRideConfig] = useState({
    showDemo: false,
  });

  const [mobileGenericConfig, setMobileGenericConfig] = useState({
    numberOfLines: 8,
    showBackButton: true,
    lineVariations: "default",
    showDemo: false,
  });

  const [rideInfoConfig, setRideInfoConfig] = useState({
    showBackButton: true,
    showDemo: false,
  });

  const handleMyRidesConfigChange = (key, value) => {
    setMyRidesConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleChatConfigChange = (key, value) => {
    setChatConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMobileGenericConfigChange = (key, value) => {
    setMobileGenericConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRideInfoConfigChange = (key, value) => {
    setRideInfoConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleDemo = (demoKey) => {
    if (demoKey === "myrides") {
      setMyRidesConfig(prev => ({
        ...prev,
        showDemo: prev.showDemo === demoKey ? false : demoKey,
      }));
    } else if (demoKey === "chat") {
      setChatConfig(prev => ({
        ...prev,
        showDemo: prev.showDemo === demoKey ? false : demoKey,
      }));
    } else if (demoKey === "createride") {
      setCreateRideConfig(prev => ({
        ...prev,
        showDemo: prev.showDemo === demoKey ? false : demoKey,
      }));
    } else if (demoKey === "mobilegeneric") {
      setMobileGenericConfig(prev => ({
        ...prev,
        showDemo: prev.showDemo === demoKey ? false : demoKey,
      }));
    } else if (demoKey === "rideinfo") {
      setRideInfoConfig(prev => ({
        ...prev,
        showDemo: prev.showDemo === demoKey ? false : demoKey,
      }));
    }
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
                onChange={(e) => handleMyRidesConfigChange("numberOfRides", parseInt(e.target.value))}
              />
            </ControlGroup>
            <ControlButton
              onClick={() => toggleDemo("myrides")}
              active={myRidesConfig.showDemo === "myrides"}
            >
              {myRidesConfig.showDemo === "myrides" ? "Hide Demo" : "Show Demo"}
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
          {myRidesConfig.showDemo === "myrides" && (
            <SkeletonDemo>
              <DemoCard>
                <DemoTitle>Live Demo</DemoTitle>
                <DemoDescription>
                  Interactive preview with {myRidesConfig.numberOfRides} skeleton ride{
                    myRidesConfig.numberOfRides !== 1 ? "s" : ""
                  }
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

        {/* Chat Skeleton */}
        <SkeletonSection>
          <SkeletonTitle>💬 Chat Skeleton</SkeletonTitle>
          <SkeletonDescription>
            Skeleton loading state for the Chat page. Shows chat list, conversation header, messages,
            and input form with realistic desktop and mobile layouts.
          </SkeletonDescription>

          {/* Controls */}
          <ControlsCard>
            <ControlGroup>
              <ControlLabel>Number of Chats:</ControlLabel>
              <ControlInput
                type="number"
                min="1"
                max="10"
                value={chatConfig.numberOfChats}
                onChange={(e) => handleChatConfigChange("numberOfChats", parseInt(e.target.value))}
              />
            </ControlGroup>
            <ControlGroup>
              <ControlLabel>Number of Messages:</ControlLabel>
              <ControlInput
                type="number"
                min="3"
                max="20"
                value={chatConfig.numberOfMessages}
                onChange={(e) => handleChatConfigChange("numberOfMessages", parseInt(e.target.value))}
              />
            </ControlGroup>
            <ControlGroup>
              <ControlLabel>
                <input
                  type="checkbox"
                  checked={chatConfig.showMobileLayout}
                  onChange={(e) => handleChatConfigChange("showMobileLayout", e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                Mobile Layout
              </ControlLabel>
            </ControlGroup>
            <ControlButton
              onClick={() => toggleDemo("chat")}
              active={chatConfig.showDemo === "chat"}
            >
              {chatConfig.showDemo === "chat" ? "Hide Demo" : "Show Demo"}
            </ControlButton>
          </ControlsCard>

          {/* Import Code */}
          <CodeBlock>
            <ImportCode>
              {`import { ChatSkeleton } from "../../skeleton";

<ChatSkeleton
  numberOfChats={${chatConfig.numberOfChats}}
  numberOfMessages={${chatConfig.numberOfMessages}}
  showMobileLayout={${chatConfig.showMobileLayout}}
/>`}
            </ImportCode>
          </CodeBlock>

          {/* Demo */}
          {chatConfig.showDemo === "chat" && (
            <SkeletonDemo>
              <DemoCard>
                <DemoTitle>Live Demo</DemoTitle>
                <DemoDescription>
                  Interactive preview with {chatConfig.numberOfChats} chat{
                    chatConfig.numberOfChats !== 1 ? "s" : ""
                  } and{" "}
                  {chatConfig.numberOfMessages} message{chatConfig.numberOfMessages !== 1 ? "s" : ""} ({
                    chatConfig.showMobileLayout ? "Mobile" : "Desktop"
                  } layout)
                </DemoDescription>
                <SkeletonPreview>
                  <SkeletonContainer>
                    <ChatSkeleton
                      numberOfChats={chatConfig.numberOfChats}
                      numberOfMessages={chatConfig.numberOfMessages}
                      showMobileLayout={chatConfig.showMobileLayout}
                    />
                  </SkeletonContainer>
                </SkeletonPreview>
              </DemoCard>
            </SkeletonDemo>
          )}
        </SkeletonSection>

        {/* CreateRide Skeleton */}
        <SkeletonSection>
          <SkeletonTitle>📱 CreateRide Skeleton (iOS)</SkeletonTitle>
          <SkeletonDescription>
            Skeleton loading state for the iOS CreateRide page. Shows gradient background, form sections
            for route, date/time, and ride details with iOS-style form elements.
          </SkeletonDescription>

          {/* Controls */}
          <ControlsCard>
            <ControlButton
              onClick={() => toggleDemo("createride")}
              active={createRideConfig.showDemo === "createride"}
            >
              {createRideConfig.showDemo === "createride" ? "Hide Demo" : "Show Demo"}
            </ControlButton>
          </ControlsCard>

          {/* Import Code */}
          <CodeBlock>
            <ImportCode>
              {`import { CreateRideSkeleton } from "../../skeleton";

<CreateRideSkeleton />`}
            </ImportCode>
          </CodeBlock>

          {/* Demo */}
          {createRideConfig.showDemo === "createride" && (
            <SkeletonDemo>
              <DemoCard>
                <DemoTitle>Live Demo</DemoTitle>
                <DemoDescription>
                  iOS CreateRide form skeleton
                </DemoDescription>
                <SkeletonPreview>
                  <SkeletonContainer>
                    <CreateRideSkeleton />
                  </SkeletonContainer>
                </SkeletonPreview>
              </DemoCard>
            </SkeletonDemo>
          )}
        </SkeletonSection>

        {/* Mobile Generic Skeleton */}
        <SkeletonSection>
          <SkeletonTitle>📱 Mobile Generic Skeleton</SkeletonTitle>
          <SkeletonDescription>
            Simple, reusable mobile skeleton with white top bar, back button, and content lines
            of varying widths. Perfect for basic mobile pages with text content.
          </SkeletonDescription>

          {/* Controls */}
          <ControlsCard>
            <ControlGroup>
              <ControlLabel>Number of Lines:</ControlLabel>
              <ControlInput
                type="number"
                min="3"
                max="50"
                value={mobileGenericConfig.numberOfLines}
                onChange={(e) => handleMobileGenericConfigChange("numberOfLines", parseInt(e.target.value))}
              />
            </ControlGroup>
            <ControlGroup>
              <ControlLabel>Line Style:</ControlLabel>
              <select
                value={mobileGenericConfig.lineVariations}
                onChange={(e) => handleMobileGenericConfigChange("lineVariations", e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6",
                  fontSize: "14px",
                }}
              >
                <option value="default">Default</option>
                <option value="paragraph">Paragraph</option>
                <option value="list">List</option>
              </select>
            </ControlGroup>
            <ControlGroup>
              <ControlLabel>
                <input
                  type="checkbox"
                  checked={mobileGenericConfig.showBackButton}
                  onChange={(e) => handleMobileGenericConfigChange("showBackButton", e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                Show Back Button
              </ControlLabel>
            </ControlGroup>
            <ControlButton
              onClick={() => toggleDemo("mobilegeneric")}
              active={mobileGenericConfig.showDemo === "mobilegeneric"}
            >
              {mobileGenericConfig.showDemo === "mobilegeneric" ? "Hide Demo" : "Show Demo"}
            </ControlButton>
          </ControlsCard>

          {/* Import Code */}
          <CodeBlock>
            <ImportCode>
              {`import { MobileGenericSkeleton } from "../../skeleton";

<MobileGenericSkeleton
  numberOfLines={${mobileGenericConfig.numberOfLines}}
  showBackButton={${mobileGenericConfig.showBackButton}}
  lineVariations="${mobileGenericConfig.lineVariations}"
/>`}
            </ImportCode>
          </CodeBlock>

          {/* Demo */}
          {mobileGenericConfig.showDemo === "mobilegeneric" && (
            <SkeletonDemo>
              <DemoCard>
                <DemoTitle>Live Demo</DemoTitle>
                <DemoDescription>
                  Generic mobile skeleton with {mobileGenericConfig.numberOfLines} lines,{" "}
                  {mobileGenericConfig.lineVariations} style, {
                    mobileGenericConfig.showBackButton ? "with" : "without"
                  } back button
                </DemoDescription>
                <SkeletonPreview>
                  <SkeletonContainer>
                    <MobileGenericSkeleton
                      numberOfLines={mobileGenericConfig.numberOfLines}
                      showBackButton={mobileGenericConfig.showBackButton}
                      lineVariations={mobileGenericConfig.lineVariations}
                    />
                  </SkeletonContainer>
                </SkeletonPreview>
              </DemoCard>
            </SkeletonDemo>
          )}
        </SkeletonSection>

        {/* RideInfo Skeleton */}
        <SkeletonSection>
          <SkeletonTitle>🗺️ RideInfo Skeleton</SkeletonTitle>
          <SkeletonDescription>
            Skeleton loading state for the RideInfo page. Shows 50% map area, 40% ride details section
            with route display, status badge, and ride information, plus 10% navbar clearance.
          </SkeletonDescription>

          {/* Controls */}
          <ControlsCard>
            <ControlGroup>
              <ControlLabel>
                <input
                  type="checkbox"
                  checked={rideInfoConfig.showBackButton}
                  onChange={(e) => handleRideInfoConfigChange("showBackButton", e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                Show Back Button
              </ControlLabel>
            </ControlGroup>
            <ControlButton
              onClick={() => toggleDemo("rideinfo")}
              active={rideInfoConfig.showDemo === "rideinfo"}
            >
              {rideInfoConfig.showDemo === "rideinfo" ? "Hide Demo" : "Show Demo"}
            </ControlButton>
          </ControlsCard>

          {/* Import Code */}
          <CodeBlock>
            <ImportCode>
              {`import { RideInfoSkeleton } from "../../skeleton";

<RideInfoSkeleton showBackButton={${rideInfoConfig.showBackButton}} />`}
            </ImportCode>
          </CodeBlock>

          {/* Demo */}
          {rideInfoConfig.showDemo === "rideinfo" && (
            <SkeletonDemo>
              <DemoCard>
                <DemoTitle>Live Demo</DemoTitle>
                <DemoDescription>
                  RideInfo page skeleton with map, route details, and ride information{" "}
                  {rideInfoConfig.showBackButton ? "with back button" : "without back button"}
                </DemoDescription>
                <SkeletonPreview>
                  <SkeletonContainer>
                    <RideInfoSkeleton
                      showBackButton={rideInfoConfig.showBackButton}
                    />
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
            <ImportCode style={{ color: "#666", fontStyle: "italic" }}>
              {`// Future components:
// - ProfileSkeleton
// - RideDetailSkeleton
// - PlaceManagerSkeleton
// - AdminTableSkeleton
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
            <ImportCode style={{ fontSize: "14px", lineHeight: "1.6" }}>
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
  })(SkeletonComponentsTest),
);
