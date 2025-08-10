import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import SimpleFooter from "../../desktop/components/SimpleFooter";
import FooterVerbose from "../../desktop/components/FooterVerbose";
import LiquidGlassFooter from "../../liquidGlass/components/Footer";
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

/**
 * Test page for Footer components - Admin only
 * Tests all 3 footer variants: Classic (Simple), Verbose, and LiquidGlass
 */
const FooterComponentsTest = ({ history }) => {
  const [footerTheme, setFooterTheme] = useState("light");
  const [showLinks, setShowLinks] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <Container>
      <BackButton />
      
      {/* Fixed Header */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "white",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: "600",
          color: "#333"
        }}>
          Footer Components Test
        </h1>
      </div>

      <Content style={{ paddingTop: "80px" }}>
        {/* Footer Controls */}
        <Section>
          <SectionTitle>⚙️ Footer Configuration</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <Label>Theme</Label>
                <select
                  value={footerTheme}
                  onChange={(e) => setFooterTheme(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "white"
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </ControlItem>

              <ControlItem>
                <Label>Show Links</Label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={showLinks}
                    onChange={(e) => setShowLinks(e.target.checked)}
                  />
                  Enable footer links
                </label>
              </ControlItem>

              <ControlItem>
                <Label>Compact Mode</Label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                  />
                  Use compact layout
                </label>
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

            <ComponentContainer style={{ 
              backgroundColor: footerTheme === "dark" ? "#333" : "#f8f9fa",
              padding: "20px",
              borderRadius: "8px"
            }}>
              <SimpleFooter 
                theme={footerTheme}
                showLinks={showLinks}
                compact={compactMode}
              />
            </ComponentContainer>
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

            <ComponentContainer style={{ 
              backgroundColor: footerTheme === "dark" ? "#222" : "#ffffff",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e0e0e0"
            }}>
              <FooterVerbose 
                theme={footerTheme}
                showLinks={showLinks}
                compact={compactMode}
              />
            </ComponentContainer>
          </SectionContent>
        </Section>

        {/* LiquidGlass Footer */}
        <Section>
          <SectionTitle>✨ LiquidGlass Footer</SectionTitle>
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

            <ComponentContainer style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "40px 20px",
              borderRadius: "16px",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Background pattern for glass effect */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 50%)
                `,
                zIndex: 0
              }} />
              
              <div style={{ position: "relative", zIndex: 1 }}>
                <LiquidGlassFooter 
                  theme={footerTheme}
                  showLinks={showLinks}
                  compact={compactMode}
                />
              </div>
            </ComponentContainer>
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

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
              marginTop: "20px"
            }}>
              <div style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>Simple</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                  Best for: Basic sites, minimal designs
                </p>
              </div>
              
              <div style={{
                padding: "16px",
                backgroundColor: "#e3f2fd",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>Verbose</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                  Best for: Corporate sites, detailed navigation
                </p>
              </div>
              
              <div style={{
                padding: "16px",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                borderRadius: "8px",
                textAlign: "center",
                color: "white"
              }}>
                <h4 style={{ margin: "0 0 8px 0" }}>LiquidGlass</h4>
                <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
                  Best for: Modern apps, premium designs
                </p>
              </div>
            </div>
          </SectionContent>
        </Section>
      </Content>
    </Container>
  );
};

export default withRouter(FooterComponentsTest);
