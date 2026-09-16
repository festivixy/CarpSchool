import React, { useState } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import {
  Button,
  TextInput,
  Dropdown,
  LoadingSpinner,
  ErrorBoundary,
  TopNav,
} from "../../components";
import {
  DemoContainer,
  DemoSection,
  DemoTitle,
  DemoDescription,
  ComponentGrid,
  ComponentDemo,
  ComponentTitle,
  ComponentControls,
  DemoCode,
  FlexContainer,
  MarginContainer,
  InlineText,
  CenteredContainer,
  NavPreview,
} from "../styles/SharedComponentsDemo";
import BackButton from "../../mobile/components/BackButton";

/**
 * Demo page showcasing the new shared components
 * Demonstrates functionality and usage patterns
 */
const SharedComponentsDemo = ({ history }) => {
  const [textValue, setTextValue] = useState("");
  const [dropdownValue, setDropdownValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const dropdownOptions = [
    { value: "vancouver", label: "Vancouver", icon: "" },
    { value: "toronto", label: "Toronto", icon: "" },
    { value: "montreal", label: "Montreal", icon: "" },
    { value: "calgary", label: "Calgary", icon: "" },
    { value: "ottawa", label: "Ottawa", icon: "" },
  ];

  const handleAsyncAction = async () => {
    setLoading(true);
    await new Promise(resolve => {
      setTimeout(resolve, 2000);
    });
    setLoading(false);
    alert("Async action completed!");
  };

  const ErrorComponent = () => {
    if (showError) {
      throw new Error("This is a demonstration error!");
    }
    return <div>No error - component working normally</div>;
  };

  return (
    <ErrorBoundary
      title="Demo Page Error"
      message="An error occurred while loading the demo page."
      onRetry={() => window.location.reload()}
    >
      <DemoContainer>
        <BackButton />
        <DemoTitle>Shared Components Demo</DemoTitle>
        <DemoDescription>
          This page demonstrates the new shared components that can be used across both desktop and mobile platforms.
          All components include accessibility features, responsive design, and consistent styling.
        </DemoDescription>

        <ComponentGrid>
          {/* Button Component Demo */}
          <ComponentDemo>
            <ComponentTitle>Button Component</ComponentTitle>
            <ComponentControls>
              <Button variant="primary" onClick={() => alert("Primary clicked!")}>
                Primary Button
              </Button>
              <Button variant="secondary" onClick={() => alert("Secondary clicked!")}>
                Secondary Button
              </Button>
              <Button variant="danger" onClick={() => alert("Danger clicked!")}>
                Danger Button
              </Button>
              <Button variant="outline" icon="" onClick={handleAsyncAction} loading={loading}>
                {loading ? "Loading..." : "Async Action"}
              </Button>
              <Button variant="ghost" size="small" disabled>
                Disabled Button
              </Button>
            </ComponentControls>
            <DemoCode>
{`<Button variant="primary" onClick={handleClick}>
  Primary Button
</Button>

<Button variant="outline" icon="" loading={loading}>
  Async Action
</Button>`}
            </DemoCode>
          </ComponentDemo>

          {/* TextInput Component Demo */}
          <ComponentDemo>
            <ComponentTitle>TextInput Component</ComponentTitle>
            <ComponentControls>
              <TextInput
                label="Basic Input"
                placeholder="Enter some text..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                helperText="This is a helper text"
              />
              <TextInput
                label="Email Input"
                type="email"
                placeholder="your@email.com"
                icon=""
                required
              />
              <TextInput
                label="Password Input"
                type="password"
                placeholder="Enter password"
                showCharacterCount
                maxLength={20}
                error={textValue.length > 15 ? "Password too long!" : ""}
              />
              <TextInput
                label="Search Input"
                type="search"
                placeholder="Search..."
                icon=""
                variant="outline"
              />
            </ComponentControls>
            <DemoCode>
{`<TextInput
  label="Email Input"
  type="email"
  icon=""
  required
  onChange={handleChange}
/>`}
            </DemoCode>
          </ComponentDemo>

          {/* Dropdown Component Demo */}
          <ComponentDemo>
            <ComponentTitle>Dropdown Component</ComponentTitle>
            <ComponentControls>
              <Dropdown
                label="Select City"
                placeholder="Choose a city..."
                options={dropdownOptions}
                value={dropdownValue}
                onChange={(value) => setDropdownValue(value)}
                searchable
                clearable
              />
              <Dropdown
                label="Multiple Selection"
                placeholder="Choose multiple cities..."
                options={dropdownOptions}
                multiple
                searchable
                helperText="You can select multiple options"
              />
              <Dropdown
                label="Simple Dropdown"
                options={[
                  { value: "option1", label: "Option 1" },
                  { value: "option2", label: "Option 2" },
                  { value: "option3", label: "Option 3" },
                ]}
                variant="filled"
                disabled
              />
            </ComponentControls>
            <DemoCode>
{`<Dropdown
  label="Select City"
  options={cityOptions}
  searchable
  clearable
  onChange={handleChange}
/>`}
            </DemoCode>
          </ComponentDemo>

          {/* LoadingSpinner Component Demo */}
          <ComponentDemo>
            <ComponentTitle>LoadingSpinner Component</ComponentTitle>
            <ComponentControls>
              <FlexContainer>
                <LoadingSpinner size="small" text="Small" />
                <LoadingSpinner size="medium" text="Medium" />
                <LoadingSpinner size="large" text="Large" />
                <LoadingSpinner size="xlarge" text="XLarge" />
              </FlexContainer>
              <FlexContainer $marginTop="20px">
                <LoadingSpinner variant="spinner" text="Spinner" />
                <LoadingSpinner variant="dots" text="Dots" />
                <LoadingSpinner variant="pulse" text="Pulse" />
                <LoadingSpinner variant="ring" text="Ring" />
              </FlexContainer>
              <MarginContainer>
                <LoadingSpinner inline text="Inline spinner" />
                <InlineText>with other content</InlineText>
              </MarginContainer>
            </ComponentControls>
            <DemoCode>
{`<LoadingSpinner size="medium" text="Loading..." />

<LoadingSpinner variant="dots" inline />

<LoadingSpinner overlay text="Please wait..." />`}
            </DemoCode>
          </ComponentDemo>

          {/* ErrorBoundary Component Demo */}
          <ComponentDemo>
            <ComponentTitle>ErrorBoundary Component</ComponentTitle>
            <ComponentControls>
              <Button
                variant={showError ? "primary" : "danger"}
                onClick={() => setShowError(!showError)}
              >
                {showError ? "Reset Error" : "Trigger Error"}
              </Button>
              <ComponentControls>
                <ErrorBoundary
                  title="Component Error"
                  message="This component encountered an error."
                  showDetails={true}
                  onRetry={() => setShowError(false)}
                >
                  <ErrorComponent />
                </ErrorBoundary>
              </ComponentControls>
            </ComponentControls>
            <DemoCode>
{`<ErrorBoundary
  title="Component Error"
  onRetry={handleRetry}
  showDetails={true}
>
  <YourComponent />
</ErrorBoundary>`}
            </DemoCode>
          </ComponentDemo>
        </ComponentGrid>

        <DemoSection>
          <ComponentTitle>TopNav</ComponentTitle>
          <DemoDescription>
            The floating glass pill from the design handoff, shown on every
            customer-facing screen when signed in. It is position:absolute so it
            can float over a full-bleed map, hence the relative preview box.
          </DemoDescription>
          <NavPreview>
            <TopNav
              active="find"
              user={{ id: "demo", name: "Maya Chen", hue: 38 }}
              onNav={() => {}}
              onOffer={() => {}}
              menuItems={[
                { id: "profile", label: "My profile", icon: "user" },
                { id: "editProfile", label: "Edit profile", icon: "edit" },
                { id: "places", label: "Saved places", icon: "pin" },
                { id: "history", label: "Ride history", icon: "clock" },
                { id: "signOut", label: "Sign out", icon: "arrow", danger: true },
              ]}
              onMenuSelect={() => {}}
            />
          </NavPreview>
          <NavPreview $solid>
            <TopNav
              active="rides"
              glass={false}
              user={{ id: "demo2", name: "Theo Park", hue: 232 }}
              onNav={() => {}}
              onOffer={() => {}}
            />
          </NavPreview>
        </DemoSection>

        <DemoSection>
          <ComponentTitle>Usage Guidelines</ComponentTitle>
          <DemoDescription>
            All shared components follow consistent patterns:
            <ul>
              <li>Support both controlled and uncontrolled patterns</li>
              <li>Include comprehensive PropTypes validation</li>
              <li>Implement proper accessibility (ARIA labels, keyboard navigation)</li>
              <li>Support dark mode and reduced motion preferences</li>
              <li>Responsive design for desktop and mobile</li>
              <li>Consistent styling with styled-components</li>
            </ul>
          </DemoDescription>

          <DemoCode>
{`// Easy importing
import { Button, TextInput, Dropdown } from '../../components';

// Or import individual components
import Button from '../../components/Button';`}
          </DemoCode>
        </DemoSection>

        <CenteredContainer style={{ marginTop: "40px" }}>
          <Button variant="outline" onClick={() => history.goBack()}>
            ← Back to Previous Page
          </Button>
        </CenteredContainer>
      </DemoContainer>
    </ErrorBoundary>
  );
};

SharedComponentsDemo.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(SharedComponentsDemo);
