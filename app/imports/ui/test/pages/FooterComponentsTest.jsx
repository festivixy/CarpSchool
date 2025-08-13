import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import SimpleFooter from "../../desktop/components/SimpleFooter";
import FooterVerbose from "../../desktop/components/FooterVerbose";
import LiquidGlassFooter from "../../liquidGlass/components/Footer";
import BackButton from "../../mobile/components/BackButton";
import {
  TestPageContainer,
  TestPageHeader,
  TestPageTitle,
  TestPageContent,
  CheckboxLabel,
  Select,
  DemoContainer,
  VerboseDemoContainer,
  LiquidGlassDemoContainer,
  GlassBackground,
  RelativeContainer,
  ComparisonGrid,
  ComparisonCard,
  ComparisonTitle,
  ComparisonDescription,
  TestControlsGrid as ControlsGrid,
  TestControlLabel as Label,
  TestControlsCard as Section,
  TestControlsTitle as SectionTitle,
  TestPageContent as SectionContent,
  TestComponentCard as InfoCard,
  TestComponentTitle as InfoItem,
  TestControlLabel as InfoLabel,
  TestComponentDescription as InfoValue,
  ControlItem,
} from "../styles/FooterComponentsTest";

/**
 * Test page for Footer components - Admin only
 * Tests all 3 footer variants: Classic (Simple), Verbose, and LiquidGlass
 */
const FooterComponentsTest = ({ history: _history }) => {
  const [footerTheme, setFooterTheme] = useState("light");
  const [showLinks, setShowLinks] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <TestPageContainer>
      <BackButton />

      {/* Fixed Header */}
      <TestPageHeader>
        <TestPageTitle>
          Footer Components Test
        </TestPageTitle>
      </TestPageHeader>

      <TestPageContent>
        {/* Footer Controls */}
        <Section>
          <SectionTitle>⚙️ Footer Configuration</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <Label>Theme</Label>
                <Select
                  value={footerTheme}
                  onChange={(e) => setFooterTheme(e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </ControlItem>

              <ControlItem>
                <Label>Show Links</Label>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={showLinks}
                    onChange={(e) => setShowLinks(e.target.checked)}
                  />
                  Enable footer links
                </CheckboxLabel>
              </ControlItem>

              <ControlItem>
                <Label>Compact Mode</Label>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                  />
                  Use compact layout
                </CheckboxLabel>
              </ControlItem>
            </ControlsGrid>

            <InfoCard>
              <InfoItem>
                <InfoLabel>Current Settings</InfoLabel>
                <InfoValue>
                  Theme: {footerTheme}, Links: {showLinks ? "Enabled" : "Disabled"},
                  Mode: {compactMode ? "Compact" : "Full"}
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        {/* Simple Footer (Classic) */}
        <Section>
          <SectionTitle>🦶 Simple Footer (Classic)</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Description</InfoLabel>
                <InfoValue>
                  Basic footer component with minimal styling and essential links
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Use Case</InfoLabel>
                <InfoValue>
                  Default footer for desktop and simple layouts
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <DemoContainer $theme={footerTheme}>
              <SimpleFooter
                theme={footerTheme}
                showLinks={showLinks}
                compact={compactMode}
              />
            </DemoContainer>
          </SectionContent>
        </Section>

        {/* Footer Verbose */}
        <Section>
          <SectionTitle>📋 Footer Verbose</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Description</InfoLabel>
                <InfoValue>
                  Comprehensive footer with detailed information, multiple sections, and extensive links
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Use Case</InfoLabel>
                <InfoValue>
                  Corporate pages, detailed site maps, and comprehensive navigation
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <VerboseDemoContainer $theme={footerTheme}>
              <FooterVerbose
                theme={footerTheme}
                showLinks={showLinks}
                compact={compactMode}
              />
            </VerboseDemoContainer>
          </SectionContent>
        </Section>

        {/* LiquidGlass Footer */}
        <Section>
          <SectionTitle>�� LiquidGlass Footer</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Description</InfoLabel>
                <InfoValue>
                  Modern footer with glass morphism effects, blur backgrounds, and premium styling
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Use Case</InfoLabel>
                <InfoValue>
                  Premium designs, modern web apps, and glass morphism UI themes
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <LiquidGlassDemoContainer>
              {/* Background pattern for glass effect */}
              <GlassBackground />

              <RelativeContainer>
                <LiquidGlassFooter
                  theme={footerTheme}
                  showLinks={showLinks}
                  compact={compactMode}
                />
              </RelativeContainer>
            </LiquidGlassDemoContainer>
          </SectionContent>
        </Section>

        {/* Footer Comparison */}
        <Section>
          <SectionTitle>📊 Footer Comparison</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Simple Footer</InfoLabel>
                <InfoValue>
                  ✅ Lightweight, ✅ Fast loading, ✅ Basic functionality, ❌ Limited styling
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Footer Verbose</InfoLabel>
                <InfoValue>
                  ✅ Comprehensive, ✅ SEO friendly, ✅ Detailed navigation, ❌ Heavy content
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>LiquidGlass Footer</InfoLabel>
                <InfoValue>
                  ✅ Modern design, ✅ Visual effects, ✅ Premium feel, ❌ Higher complexity
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <ComparisonGrid>
              <ComparisonCard $bgColor="#f8f9fa">
                <ComparisonTitle>Simple</ComparisonTitle>
                <ComparisonDescription>
                  Best for: Basic sites, minimal designs
                </ComparisonDescription>
              </ComparisonCard>

              <ComparisonCard $bgColor="#e3f2fd">
                <ComparisonTitle>Verbose</ComparisonTitle>
                <ComparisonDescription>
                  Best for: Corporate sites, detailed navigation
                </ComparisonDescription>
              </ComparisonCard>

              <ComparisonCard $gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                <ComparisonTitle $color="white">LiquidGlass</ComparisonTitle>
                <ComparisonDescription $color="white" $opacity={0.9}>
                  Best for: Modern apps, premium designs
                </ComparisonDescription>
              </ComparisonCard>
            </ComparisonGrid>
          </SectionContent>
        </Section>
      </TestPageContent>
    </TestPageContainer>
  );
};

export default withRouter(FooterComponentsTest);
