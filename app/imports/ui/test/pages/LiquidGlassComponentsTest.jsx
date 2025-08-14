import React, { useState } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import LiquidGlassButton from "../../liquidGlass/components/Button";
import LiquidGlassNavbar from "../../liquidGlass/components/Navbar";
import LiquidGlassDropdown from "../../liquidGlass/components/Dropdown";
import LiquidGlassFooter from "../../liquidGlass/components/Footer";
import LiquidGlassTextInput from "../../liquidGlass/components/TextInput";
import LiquidGlassIconButton from "../../liquidGlass/components/IconButton";
import MobileNavBarCSS from "../../mobile/components/MobileNavBarCSS";
import BackButton from "../../mobile/components/BackButton";
import {
  Container,
  Content,
  Section,
  SectionTitle,
  SectionContent,
  ComponentContainer,
  ControlsGrid,
  ControlItem,
  Label,
  InfoCard,
  InfoItem,
  InfoLabel,
  InfoValue,
} from "../styles/ComponentsTest";
import {
  TestPageHeader,
  TestPageTitle,
  FlexContainer,
} from "../styles/LiquidGlassComponentsTest";

/**
 * Test page for LiquidGlass components - Admin only
 */
const LiquidGlassComponentsTest = ({ history: _history }) => {
  // Background animation state
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Dropdown states
  const [dropdownValue, setDropdownValue] = useState(null);
  const [multiDropdownValue, setMultiDropdownValue] = useState([]);
  const [searchDropdownValue, setSearchDropdownValue] = useState(null);

  // Input states
  const [textInputValue, setTextInputValue] = useState("");
  const [emailInputValue, setEmailInputValue] = useState("");
  const [passwordInputValue, setPasswordInputValue] = useState("");

  // Sample data for dropdowns
  const dropdownOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "option4", label: "Option 4" },
  ];

  const searchOptions = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
    { value: "date", label: "Date" },
    { value: "elderberry", label: "Elderberry" },
  ];

  // Background animation handlers
  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setBackgroundPosition((prev) => ({
        x: prev.x + deltaX * 0.1,
        y: prev.y + deltaY * 0.1,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Container>
      <BackButton />

      {/* Fixed Header */}
      <TestPageHeader>
        <TestPageTitle>
          LiquidGlass Components Test
        </TestPageTitle>
      </TestPageHeader>

      {/* Animated Background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `
            radial-gradient(circle at ${50 + backgroundPosition.x}% ${50 + backgroundPosition.y}%,
              rgba(139, 69, 19, 0.1) 0%,
              rgba(160, 82, 45, 0.05) 50%,
              transparent 100%),
            linear-gradient(45deg,
              rgba(205, 133, 63, 0.03) 0%,
              rgba(222, 184, 135, 0.02) 100%)
          `,
          zIndex: -1,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <Content style={{ paddingTop: "80px" }}>
        {/* LiquidGlass Navbar Test */}
        <Section>
          <SectionTitle>🌐 LiquidGlass Navbar</SectionTitle>
          <SectionContent>
            <ComponentContainer>
              <LiquidGlassNavbar />
            </ComponentContainer>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Component</InfoLabel>
                <InfoValue>LiquidGlass navigation bar with blur effects</InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        {/* LiquidGlass Dropdown Test */}
        <Section>
          <SectionTitle>📋 LiquidGlass Dropdown Test</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <Label>Single Select Dropdown</Label>
                <LiquidGlassDropdown
                  options={dropdownOptions}
                  value={dropdownValue}
                  onChange={setDropdownValue}
                  placeholder="Select an option"
                />
              </ControlItem>

              <ControlItem>
                <Label>Multi Select Dropdown</Label>
                <LiquidGlassDropdown
                  options={dropdownOptions}
                  value={multiDropdownValue}
                  onChange={setMultiDropdownValue}
                  placeholder="Select multiple options"
                  multiple
                />
              </ControlItem>

              <ControlItem>
                <Label>Searchable Dropdown</Label>
                <LiquidGlassDropdown
                  options={searchOptions}
                  value={searchDropdownValue}
                  onChange={setSearchDropdownValue}
                  placeholder="Search and select"
                  searchable
                />
              </ControlItem>
            </ControlsGrid>

            <InfoCard>
              <InfoItem>
                <InfoLabel>Single Select Value</InfoLabel>
                <InfoValue>{dropdownValue ? dropdownValue.label : "None"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Multi Select Values</InfoLabel>
                <InfoValue>
                  {multiDropdownValue.length > 0
                    ? multiDropdownValue.map(v => v.label).join(", ")
                    : "None"
                  }
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Searchable Value</InfoLabel>
                <InfoValue>{searchDropdownValue ? searchDropdownValue.label : "None"}</InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        {/* LiquidGlass Button Test */}
        <Section>
          <SectionTitle>✨ LiquidGlass Button Test</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Available Button Variants</InfoLabel>
                <InfoValue>
                  Test different button styles and interactions
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <ControlsGrid>
              <ControlItem>
                <Label>Primary Button</Label>
                <LiquidGlassButton
                  label="Primary Action"
                  onClick={() => alert("Primary button clicked!")}
                />
              </ControlItem>

              <ControlItem>
                <Label>Secondary Button</Label>
                <LiquidGlassButton
                  label="Secondary Action"
                  variant="secondary"
                  onClick={() => alert("Secondary button clicked!")}
                />
              </ControlItem>

              <ControlItem>
                <Label>Danger Button</Label>
                <LiquidGlassButton
                  label="Danger Action"
                  variant="danger"
                  onClick={() => alert("Danger button clicked!")}
                />
              </ControlItem>

              <ControlItem>
                <Label>Disabled Button</Label>
                <LiquidGlassButton
                  label="Disabled"
                  disabled
                  onClick={() => alert("This shouldn't work")}
                />
              </ControlItem>
            </ControlsGrid>
          </SectionContent>
        </Section>

        {/* LiquidGlass TextInput & IconButton Test */}
        <Section>
          <SectionTitle>📝 LiquidGlass Input Components</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Text Input"
                  type="text"
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  placeholder="Enter some text"
                />
              </ControlItem>

              <ControlItem>
                <LiquidGlassTextInput
                  label="Email Input"
                  type="email"
                  value={emailInputValue}
                  onChange={(e) => setEmailInputValue(e.target.value)}
                  placeholder="Enter your email"
                />
              </ControlItem>

              <ControlItem>
                <LiquidGlassTextInput
                  label="Password Input"
                  type="password"
                  value={passwordInputValue}
                  onChange={(e) => setPasswordInputValue(e.target.value)}
                  placeholder="Enter password"
                />
              </ControlItem>

              <ControlItem>
                <Label>Icon Buttons</Label>
                <FlexContainer>
                  <LiquidGlassIconButton
                    icon="❤️"
                    onClick={() => alert("Heart clicked!")}
                  />
                  <LiquidGlassIconButton
                    icon="🔍"
                    onClick={() => alert("Search clicked!")}
                  />
                  <LiquidGlassIconButton
                    icon="⚙️"
                    onClick={() => alert("Settings clicked!")}
                  />
                </FlexContainer>
              </ControlItem>
            </ControlsGrid>

            <InfoCard>
              <InfoItem>
                <InfoLabel>Text Input Value</InfoLabel>
                <InfoValue>{textInputValue || "Empty"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Email Input Value</InfoLabel>
                <InfoValue>{emailInputValue || "Empty"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Password Input Length</InfoLabel>
                <InfoValue>{passwordInputValue.length} characters</InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        {/* LiquidGlass Mobile NavBar Test */}
        <Section>
          <SectionTitle>📱 LiquidGlass Mobile NavBar</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Mobile Navigation</InfoLabel>
                <InfoValue>
                  LiquidGlass styled mobile navigation component
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <ComponentContainer>
              <MobileNavBarCSS />
            </ComponentContainer>
          </SectionContent>
        </Section>

        {/* LiquidGlass Footer Test */}
        <Section>
          <SectionTitle>🦶 LiquidGlass Footer</SectionTitle>
          <SectionContent>
            <ComponentContainer>
              <LiquidGlassFooter />
            </ComponentContainer>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Component</InfoLabel>
                <InfoValue>LiquidGlass footer with blur effects and links</InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>
      </Content>
    </Container>
  );
};

LiquidGlassComponentsTest.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(LiquidGlassComponentsTest);
