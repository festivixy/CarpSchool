import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import MapView from "../../components/MapView";
import InteractiveMapPicker from "../components/InteractiveMapPicker";
import PathMapView from "../components/PathMapView";
import LiquidGlassButton from "../../liquidGlass/components/Button";
import LiquidGlassNavbar from "../../liquidGlass/components/Navbar";
import LiquidGlassDropdown from "../../liquidGlass/components/Dropdown";
import LiquidGlassFooter from "../../liquidGlass/components/Footer";
import LiquidGlassTextInput from "../../liquidGlass/components/TextInput";
import LiquidGlassIconButton from "../../liquidGlass/components/IconButton";
import MobileNavBarCSS from "../components/MobileNavBarCSS";
import {
  Container,
  Content,
  Copy,
  Subtitle,
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

import FooterVerbose from "../../desktop/components/FooterVerbose";

/**
 * Test page for MapView component - Admin only
 */
const MobileTestMapView = ({ history }) => {
  const [coordinates, setCoordinates] = useState([
    { lat: 49.345196, lng: -123.149805, label: "Vancouver" },
    { lat: 49.35, lng: -123.155, label: "Point 2" },
    { lat: 49.34, lng: -123.145, label: "Point 3" },
  ]);
  const [tileServerUrl, setTileServerUrl] = useState("");
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 49.345196,
    lng: -123.149805,
  });
  const [mapPickerHeight, setMapPickerHeight] = useState("400px");
  const [newPointLat, setNewPointLat] = useState("");
  const [newPointLng, setNewPointLng] = useState("");
  const [newPointLabel, setNewPointLabel] = useState("");
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dropdownValue, setDropdownValue] = useState(null);
  const [multiDropdownValue, setMultiDropdownValue] = useState([]);
  const [searchDropdownValue, setSearchDropdownValue] = useState(null);
  const [gotoTestInput, setGotoTestInput] = useState("");

  // PathMapView state
  const [pathStartCoord, setPathStartCoord] = useState({
    lat: 49.345196,
    lng: -123.149805,
  });
  const [pathEndCoord, setPathEndCoord] = useState({
    lat: 49.35,
    lng: -123.155,
  });
  const [pathStartLat, setPathStartLat] = useState("49.345196");
  const [pathStartLng, setPathStartLng] = useState("-123.149805");
  const [pathEndLat, setPathEndLat] = useState("49.35");
  const [pathEndLng, setPathEndLng] = useState("-123.155");
  const [pathMapHeight, setPathMapHeight] = useState("450px");
  const [routingService, setRoutingService] = useState("osrm");

  const handleAddPoint = () => {
    const lat = parseFloat(newPointLat);
    const lng = parseFloat(newPointLng);

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      setCoordinates([
        ...coordinates,
        {
          lat,
          lng,
          label: newPointLabel || `Point ${coordinates.length + 1}`,
        },
      ]);
      setNewPointLat("");
      setNewPointLng("");
      setNewPointLabel("");
    }
  };

  const handleRemovePoint = (index) => {
    setCoordinates(coordinates.filter((_, i) => i !== index));
  };

  const handleClearPoints = () => {
    setCoordinates([]);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - backgroundPosition.x,
      y: e.clientY - backgroundPosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    setBackgroundPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - backgroundPosition.x,
      y: touch.clientY - backgroundPosition.y,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    setBackgroundPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Dropdown options
  const cityOptions = [
    { value: "vancouver", label: "Vancouver", icon: "🏙" },
    { value: "toronto", label: "Toronto", icon: "🌆" },
    { value: "montreal", label: "Montreal", icon: "🏛️" },
    { value: "calgary", label: "Calgary", icon: "🏔️" },
    { value: "ottawa", label: "Ottawa", icon: "🏛️" },
    { value: "edmonton", label: "Edmonton", icon: "🌲" },
    { value: "winnipeg", label: "Winnipeg", icon: "❄️" },
    { value: "quebec", label: "Quebec City", icon: "🏰" },
    { value: "halifax", label: "Halifax", icon: "⚓" },
    { value: "victoria", label: "Victoria", icon: "🌺" },
  ];

  const transportOptions = [
    { value: "car", label: "Car", icon: "🚗" },
    { value: "bus", label: "Bus", icon: "🚌" },
    { value: "bike", label: "Bike", icon: "🚲" },
    { value: "walk", label: "Walking", icon: "🚶" },
    { value: "train", label: "Train", icon: "🚆" },
    { value: "plane", label: "Plane", icon: "✈️", disabled: true },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleDropdownChange = (value, option) => {
    console.log("Dropdown changed:", value, option);
    setDropdownValue(value);
  };

  const handleMultiDropdownChange = (values, option) => {
    console.log("Multi dropdown changed:", values, option);
    setMultiDropdownValue(values);
  };

  const handleSearchDropdownChange = (value, option) => {
    console.log("Search dropdown changed:", value, option);
    setSearchDropdownValue(value);
  };

  const handleNavClick = (item, _e) => {
    console.log("Navigation clicked:", item);
    alert(`Navigation clicked: ${item}`);
  };

  const handleSignOut = () => {
    console.log("Sign out clicked");
    alert("Sign out clicked");
  };

  // PathMapView handlers
  const updatePathStartCoord = () => {
    const lat = parseFloat(pathStartLat);
    const lng = parseFloat(pathStartLng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      setPathStartCoord({ lat, lng });
    }
  };

  const updatePathEndCoord = () => {
    const lat = parseFloat(pathEndLat);
    const lng = parseFloat(pathEndLng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      setPathEndCoord({ lat, lng });
    }
  };

  const resetPathToVancouver = () => {
    setPathStartCoord({ lat: 49.345196, lng: -123.149805 });
    setPathEndCoord({ lat: 49.35, lng: -123.155 });
    setPathStartLat("49.345196");
    setPathStartLng("-123.149805");
    setPathEndLat("49.35");
    setPathEndLng("-123.155");
  };

  const swapPathPoints = () => {
    const tempCoord = pathStartCoord;
    const tempLat = pathStartLat;
    const tempLng = pathStartLng;

    setPathStartCoord(pathEndCoord);
    setPathStartLat(pathEndLat);
    setPathStartLng(pathEndLng);

    setPathEndCoord(tempCoord);
    setPathEndLat(tempLat);
    setPathEndLng(tempLng);
  };

  const handleGotoTest = () => {
    if (gotoTestInput.trim()) {
      history.push(`/_test/${gotoTestInput.trim()}`);
    }
  };

  return (
    <Container>
      {/* Demo LiquidGlass Navbar */}
      <div
        style={{
          position: "sticky",
          top: "60px", // Position a little lower under the old navbar
          marginBottom: "20px",
          borderRadius: "0 0 12px 12px", // Only bottom edges rounded
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          zIndex: 999,
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <LiquidGlassNavbar
            logoText=""
            user={{
              name: "John Doe",
              avatar: null,
            }}
            isAdmin={true}
            notifications={3}
            onNavClick={handleNavClick}
            onSignOut={handleSignOut}
            onLogoClick={() => alert("Logo clicked!")}
            className="test-navbar"
          />
        </div>
      </div>

      <style>{`
        .test-navbar {
          position: relative !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          z-index: 1 !important;
        }
      `}</style>

      <Content>
        <Copy>
          <Subtitle>
            Interactive testing page for LiquidGlass components and MapView
            integration
          </Subtitle>
        </Copy>

        <Section>
          <SectionTitle>🗺️ Map Component</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Add Point - Latitude"
                  type="number"
                  value={newPointLat}
                  onChange={(e) => setNewPointLat(e.target.value)}
                  placeholder="Enter latitude"
                />
              </ControlItem>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Add Point - Longitude"
                  type="number"
                  value={newPointLng}
                  onChange={(e) => setNewPointLng(e.target.value)}
                  placeholder="Enter longitude"
                />
              </ControlItem>
            </ControlsGrid>

            <ControlsGrid>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Add Point - Label (optional)"
                  type="text"
                  value={newPointLabel}
                  onChange={(e) => setNewPointLabel(e.target.value)}
                  placeholder="Enter point label"
                />
              </ControlItem>
              <ControlItem>
                <Label>Actions</Label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <LiquidGlassButton
                    label="Add Point"
                    onClick={handleAddPoint}
                  />
                  <LiquidGlassButton
                    label="Clear All"
                    onClick={handleClearPoints}
                  />
                </div>
              </ControlItem>
            </ControlsGrid>

            <ControlItem>
              <LiquidGlassTextInput
                label="Self-hosted Tile Server URL (optional)"
                type="text"
                value={tileServerUrl}
                onChange={(e) => setTileServerUrl(e.target.value)}
                placeholder="http://localhost:8080 or http://your-tiles-server.com"
              />
            </ControlItem>

            <ComponentContainer>
              <MapView
                coordinates={coordinates}
                tileServerUrl={tileServerUrl || undefined}
              />
            </ComponentContainer>

            <InfoCard>
              <InfoItem>
                <InfoLabel>Current Points</InfoLabel>
                <InfoValue>
                  {coordinates.length} point(s) displayed
                  {coordinates.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      {coordinates.map((coord, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px",
                          }}
                        >
                          <span>
                            {coord.label}: {coord.lat.toFixed(6)},{" "}
                            {coord.lng.toFixed(6)}
                          </span>
                          <button
                            onClick={() => handleRemovePoint(index)}
                            style={{
                              padding: "2px 6px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "2px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Component Size</InfoLabel>
                <InfoValue>376px × 272px</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Map Source</InfoLabel>
                <InfoValue>
                  {tileServerUrl ? "Self-hosted tiles" : "Tileserver proxy"}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Features</InfoLabel>
                <InfoValue>
                  Interactive Leaflet map with markers and popups
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>🛣️ Path Finding Map</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Component Test</InfoLabel>
                <InfoValue>
                  Testing the PathMapView component that finds routes between two coordinate points
                  using OSRM routing service
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <ControlsGrid>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Start Point - Latitude"
                  type="number"
                  value={pathStartLat}
                  onChange={(e) => setPathStartLat(e.target.value)}
                  placeholder="Enter start latitude"
                  step="0.000001"
                />
              </ControlItem>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Start Point - Longitude"
                  type="number"
                  value={pathStartLng}
                  onChange={(e) => setPathStartLng(e.target.value)}
                  placeholder="Enter start longitude"
                  step="0.000001"
                />
              </ControlItem>
            </ControlsGrid>

            <ControlsGrid>
              <ControlItem>
                <LiquidGlassTextInput
                  label="End Point - Latitude"
                  type="number"
                  value={pathEndLat}
                  onChange={(e) => setPathEndLat(e.target.value)}
                  placeholder="Enter end latitude"
                  step="0.000001"
                />
              </ControlItem>
              <ControlItem>
                <LiquidGlassTextInput
                  label="End Point - Longitude"
                  type="number"
                  value={pathEndLng}
                  onChange={(e) => setPathEndLng(e.target.value)}
                  placeholder="Enter end longitude"
                  step="0.000001"
                />
              </ControlItem>
            </ControlsGrid>

            <ControlsGrid>
              <ControlItem>
                <Label>Map Height</Label>
                <LiquidGlassTextInput
                  type="text"
                  value={pathMapHeight}
                  onChange={(e) => setPathMapHeight(e.target.value)}
                  placeholder="e.g., 450px, 60vh"
                />
              </ControlItem>
              <ControlItem>
                <Label>Routing Service</Label>
                <LiquidGlassDropdown
                  options={[
                    { value: "osrm", label: "OSRM (Recommended)" },
                    { value: "straight-line", label: "Straight Line (Fallback)" },
                  ]}
                  value={routingService}
                  onChange={(value) => setRoutingService(value)}
                  width="200px"
                />
              </ControlItem>
            </ControlsGrid>

            <ControlsGrid>
              <ControlItem>
                <Label>Quick Actions</Label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <LiquidGlassButton
                    label="Update Points"
                    onClick={() => {
                      updatePathStartCoord();
                      updatePathEndCoord();
                    }}
                  />
                  <LiquidGlassButton
                    label="Swap A ↔ B"
                    onClick={swapPathPoints}
                  />
                  <LiquidGlassButton
                    label="Reset Vancouver"
                    onClick={resetPathToVancouver}
                  />
                </div>
              </ControlItem>
              <ControlItem>
                <Label>Current Points</Label>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  A: {pathStartCoord.lat.toFixed(6)}, {pathStartCoord.lng.toFixed(6)}<br/>
                  B: {pathEndCoord.lat.toFixed(6)}, {pathEndCoord.lng.toFixed(6)}
                </div>
              </ControlItem>
            </ControlsGrid>

            <ComponentContainer>
              <PathMapView
                startCoord={pathStartCoord}
                endCoord={pathEndCoord}
                tileServerUrl={tileServerUrl || undefined}
                height={pathMapHeight}
                routingService={routingService}
              />
            </ComponentContainer>

            <InfoCard>
              <InfoItem>
                <InfoLabel>🧪 PathMapView Features</InfoLabel>
                <InfoValue>
                  1. Route finding between two coordinate points
                  <br />
                  2. OSRM routing service with straight-line fallback
                  <br />
                  3. Custom start (A) and end (B) markers
                  <br />
                  4. Route visualization with distance and duration
                  <br />
                  5. Interactive controls for route management
                  <br />
                  6. Automatic map centering and zoom fitting
                  <br />
                  7. Error handling and loading states
                  <br />
                  8. Responsive design for mobile and desktop
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>📱 Testing Instructions</InfoLabel>
                <InfoValue>
                  1. Enter coordinates for start and end points
                  <br />
                  2. Click &quot;Update Points&quot; to apply coordinate changes
                  <br />
                  3. Use &quot;Find Route&quot; button (🗺️) on the map to calculate path
                  <br />
                  4. Try &quot;Swap A ↔ B&quot; to reverse the route direction
                  <br />
                  5. Use &quot;Reset Vancouver&quot; for quick test coordinates
                  <br />
                  6. Toggle between OSRM and straight-line routing
                  <br />
                  7. Adjust map height to see responsive behavior
                  <br />
                  8. Check route distance and duration information
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>🌐 LiquidGlass Component Tests</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Navigation Bar Demo</InfoLabel>
                <InfoValue>
                  The navbar above is a live demo of the LiquidGlassNavbar
                  component with glass morphism effects
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>🔐 LiquidGlass Login Test</InfoLabel>
                <InfoValue>
                  <div style={{ marginBottom: "12px" }}>
                    Test the LiquidGlass SignIn page with full functionality including
                    CAPTCHA, form validation, and glass morphism effects.
                  </div>
                  <LiquidGlassButton
                    label="🚀 Open LiquidGlass Login Test"
                    onClick={() => window.open("/_test/liquidglass/login", "_blank")}
                  />
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>🧪 LiquidGlass Navbar Features</InfoLabel>
                <InfoValue>
                  1. Fixed position with glass morphism backdrop
                  <br />
                  2. Responsive design with mobile hamburger menu
                  <br />
                  3. Dropdown menus with smooth animations
                  <br />
                  4. Scroll-based transparency adjustments
                  <br />
                  5. User avatar with notification badges
                  <br />
                  6. Admin role support with special menus
                  <br />
                  7. Smooth hover and click interactions
                  <br />
                  8. Modern glass effect with blur and transparency
                  <br />
                  9. Auto-closing dropdowns and mobile menu
                  <br />
                  10. Touch-friendly mobile interface
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>📱 Testing Instructions</InfoLabel>
                <InfoValue>
                  1. Click navigation items to see console logs
                  <br />
                  2. Try dropdowns (My Rides, Admin, User menu)
                  <br />
                  3. Resize window to test mobile responsiveness
                  <br />
                  4. Scroll page to see transparency changes
                  <br />
                  5. Test mobile hamburger menu on small screens
                  <br />
                  6. Notice the notification badge on user avatar
                  <br />
                  7. Observe glass effect against background elements
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>📋 LiquidGlass Dropdown Test</SectionTitle>
          <SectionContent
            style={{
              background: `linear-gradient(45deg,
                transparent 45%,
                #007bff 47%,
                #007bff 53%,
                transparent 55%),
                linear-gradient(-45deg,
                transparent 45%,
                #28a745 47%,
                #28a745 53%,
                transparent 55%),
                linear-gradient(0deg,
                #f8f9fa 0%,
                #e9ecef 100%)`,
              backgroundSize: "30px 30px, 30px 30px, 100% 100%",
              backgroundPosition: `${backgroundPosition.x}px ${backgroundPosition.y}px, ` +
                `${backgroundPosition.x}px ${backgroundPosition.y}px, 0 0`,
              borderRadius: "8px",
              position: "relative",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              touchAction: "none",
              padding: "20px",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <InfoCard>
              <InfoItem>
                <InfoLabel>Component Demo</InfoLabel>
                <InfoValue>
                  Testing the LiquidGlassDropdown component with various
                  configurations and glass morphism effects
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <ControlsGrid>
              <ControlItem>
                <Label>Basic Dropdown</Label>
                <LiquidGlassDropdown
                  options={statusOptions}
                  value={dropdownValue}
                  placeholder="Select status..."
                  onChange={handleDropdownChange}
                  width="200px"
                />
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Selected: {dropdownValue || "None"}
                </div>
              </ControlItem>

              <ControlItem>
                <Label>Multi-Select Dropdown</Label>
                <LiquidGlassDropdown
                  options={transportOptions}
                  value={multiDropdownValue}
                  placeholder="Select transport methods..."
                  multiple={true}
                  clearable={true}
                  onChange={handleMultiDropdownChange}
                  width="250px"
                />
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Selected:{" "}
                  {multiDropdownValue.length > 0
                    ? multiDropdownValue.join(", ")
                    : "None"}
                </div>
              </ControlItem>
            </ControlsGrid>

            <ControlsGrid>
              <ControlItem>
                <Label>Searchable Dropdown</Label>
                <LiquidGlassDropdown
                  options={cityOptions}
                  value={searchDropdownValue}
                  placeholder="Search and select city..."
                  searchable={true}
                  clearable={true}
                  onChange={handleSearchDropdownChange}
                  width="250px"
                />
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Selected: {searchDropdownValue || "None"}
                </div>
              </ControlItem>

              <ControlItem>
                <Label>Disabled Dropdown</Label>
                <LiquidGlassDropdown
                  options={statusOptions}
                  value="active"
                  placeholder="Disabled dropdown..."
                  disabled={true}
                  width="200px"
                />
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  This dropdown is disabled
                </div>
              </ControlItem>
            </ControlsGrid>

            <ControlsGrid>
              <ControlItem>
                <Label>Loading State</Label>
                <LiquidGlassDropdown
                  options={[]}
                  placeholder="Loading options..."
                  loading={true}
                  width="200px"
                />
              </ControlItem>

              <ControlItem>
                <Label>Empty Options</Label>
                <LiquidGlassDropdown
                  options={[]}
                  placeholder="No options available..."
                  width="200px"
                />
              </ControlItem>
            </ControlsGrid>

            <InfoCard>
              <InfoItem>
                <InfoLabel>���� LiquidGlass Dropdown Features</InfoLabel>
                <InfoValue>
                  1. Glass morphism effect with backdrop blur and transparency
                  <br />
                  2. Single and multi-select functionality
                  <br />
                  3. Searchable options with real-time filtering
                  <br />
                  4. Keyboard navigation (Arrow keys, Enter, Escape, Tab)
                  <br />
                  5. Clear selection functionality
                  <br />
                  6. Disabled state support
                  <br />
                  7. Loading and empty states
                  <br />
                  8. Icons support for options
                  <br />
                  9. Smooth animations and hover effects
                  <br />
                  10. Responsive design with touch support
                  <br />
                  11. Custom positioning (top/bottom)
                  <br />
                  12. Configurable width and max-height
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>📱 Testing Instructions</InfoLabel>
                <InfoValue>
                  1. Click dropdowns to see glass morphism opening animation
                  <br />
                  2. Try selecting single and multiple options
                  <br />
                  3. Test search functionality in the cities dropdown
                  <br />
                  4. Use keyboard navigation (arrow keys, enter, escape)
                  <br />
                  5. Test clear functionality with the &#39;X&#39; button
                  <br />
                  6. Notice the glass effect blurring background elements
                  <br />
                  7. Drag the background pattern to see transparency effects
                  <br />
                  8. Check console for selection events
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>✨ LiquidGlassButton Test</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Component Test</InfoLabel>
                <InfoValue>
                  Testing the LiquidGlassButton component with different labels
                  and actions
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <ControlsGrid>
              <ControlItem>
                <Label>Background Control</Label>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <LiquidGlassButton
                    label="Reset Pattern"
                    onClick={() => setBackgroundPosition({ x: 0, y: 0 })}
                  />
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    Drag the background to test glass effect
                  </span>
                </div>
              </ControlItem>
              <ControlItem>
                <Label>Sample Buttons</Label>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    padding: "40px 20px",
                    background: `linear-gradient(45deg,
                      transparent 45%,
                      #007bff 47%,
                      #007bff 53%,
                      transparent 55%),
                      linear-gradient(-45deg,
                      transparent 45%,
                      #28a745 47%,
                      #28a745 53%,
                      transparent 55%),
                      linear-gradient(0deg,
                      #f8f9fa 0%,
                      #e9ecef 100%)`,
                    backgroundSize: "30px 30px, 30px 30px, 100% 100%",
                    backgroundPosition: `${backgroundPosition.x}px ${backgroundPosition.y}px, ` +
                      `${backgroundPosition.x}px ${backgroundPosition.y}px, 0 0`,
                    borderRadius: "8px",
                    position: "relative",
                    cursor: isDragging ? "grabbing" : "grab",
                    userSelect: "none",
                    touchAction: "none",
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <LiquidGlassButton
                    label="Sample Action"
                    onClick={() => alert("LiquidGlassButton clicked!")}
                  />
                  <LiquidGlassButton
                    label="Test Button"
                    onClick={() => console.log("Test button pressed")}
                  />
                  <LiquidGlassButton
                    label="Glass Effect"
                    onClick={() => alert("Glass effect working!")}
                  />
                </div>
              </ControlItem>
            </ControlsGrid>

            <InfoCard>
              <InfoItem>
                <InfoLabel>🧪 LiquidGlassButton Features & Testing</InfoLabel>
                <InfoValue>
                  1. Liquid glass visual effect with multiple layers
                  <br />
                  2. Blur effects and glass-like transparency
                  <br />
                  3. Interactive hover and click states
                  <br />
                  4. Customizable label text
                  <br />
                  5. Smooth animations and transitions
                  <br />
                  6. Modern design with glass morphism style
                  <br />
                  7. 🖱️ <strong>Drag the background</strong> to test
                  transparency effect
                  <br />
                  8. Use &quot;Reset Pattern&quot; button to center the background
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>📝 LiquidGlass TextInput & IconButton Test</SectionTitle>
          <SectionContent
            style={{
              background: `linear-gradient(45deg,
                transparent 45%,
                #007bff 47%,
                #007bff 53%,
                transparent 55%),
                linear-gradient(-45deg,
                transparent 45%,
                #007bff 47%,
                #007bff 53%,
                transparent 55%),
                linear-gradient(0deg,
                #f8f9fa 0%,
                #e9ecef 100%)`,
              backgroundSize: "30px 30px, 30px 30px, 100% 100%",
              backgroundPosition: `${backgroundPosition.x}px ${backgroundPosition.y}px, ` +
                `${backgroundPosition.x}px ${backgroundPosition.y}px, 0 0`,
              borderRadius: "8px",
              position: "relative",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              touchAction: "none",
              padding: "20px",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <InfoCard>
              <InfoItem>
                <InfoLabel>Component Demo</InfoLabel>
                <InfoValue>
                  Testing the LiquidGlassTextInput and LiquidGlassIconButton components with glass morphism effects
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <ControlsGrid>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Text Input Test"
                  type="text"
                  placeholder="Type something..."
                  helperText="This is a LiquidGlass TextInput with glass morphism effect"
                  icon="📝"
                  iconPosition="left"
                />
              </ControlItem>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Email Input Test"
                  type="email"
                  placeholder="your@email.com"
                  helperText="Email input with validation"
                  icon="📧"
                  iconPosition="left"
                />
              </ControlItem>
            </ControlsGrid>

            <ControlsGrid>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Password Input"
                  type="password"
                  placeholder="Enter password"
                  icon="🔒"
                  iconPosition="left"
                />
              </ControlItem>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Search Input"
                  type="search"
                  placeholder="Search..."
                  icon="🔍"
                  iconPosition="right"
                />
              </ControlItem>
            </ControlsGrid>

            <ControlItem>
              <Label>IconButton Examples</Label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <LiquidGlassIconButton
                  icon="❤️"
                  title="Like"
                  onClick={() => alert("Liked!")}
                />
                <LiquidGlassIconButton
                  icon="⭐"
                  title="Star"
                  size="large"
                  onClick={() => alert("Starred!")}
                />
                <LiquidGlassIconButton
                  icon="🔔"
                  title="Notifications"
                  badge={3}
                  onClick={() => alert("3 notifications")}
                />
                <LiquidGlassIconButton
                  icon="+"
                  title="Add"
                  size="small"
                  color="primary"
                  onClick={() => alert("Add clicked!")}
                />
                <LiquidGlassIconButton
                  icon="⚙️"
                  title="Settings"
                  color="secondary"
                  onClick={() => alert("Settings")}
                />
                <LiquidGlassIconButton
                  icon="🗑️"
                  title="Delete"
                  color="danger"
                  onClick={() => alert("Delete")}
                />
                <LiquidGlassIconButton
                  icon="💾"
                  title="Save"
                  color="success"
                  onClick={() => alert("Saved!")}
                />
              </div>
            </ControlItem>

            <InfoCard>
              <InfoItem>
                <InfoLabel>🧪 LiquidGlass TextInput Features</InfoLabel>
                <InfoValue>
                  • Glass morphism effect with blur and transparency
                  <br />
                  • Multiple input types (text, email, password, search, etc.)
                  <br />
                  ��� Icon support (left or right positioning)
                  <br />
                  • Label animations and floating labels
                  <br />
                  • Error states and helper text
                  <br />
                  • Character counting and validation
                  <br />
                  • Responsive design and accessibility
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>🧪 LiquidGlass IconButton Features</InfoLabel>
                <InfoValue>
                  • Circular glass morphism design
                  <br />
                  • Support for emojis and single characters
                  <br />
                  • Multiple sizes (small, medium, large, xlarge)
                  <br />
                  • Color variants (default, primary, secondary, success, warning, danger)
                  <br />
                  • Badge support for notifications
                  <br />
                  • Hover and active state animations
                  <br />
                  • Accessible with proper ARIA labels
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>🎯 Interactive Map Picker</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Map Height"
                  type="text"
                  value={mapPickerHeight}
                  onChange={(e) => setMapPickerHeight(e.target.value)}
                  placeholder="e.g., 400px, 50vh"
                />
              </ControlItem>
              <ControlItem>
                <Label>Reset to Default Location</Label>
                <LiquidGlassButton
                  label="Reset to Vancouver"
                  onClick={() => setSelectedLocation({ lat: 49.345196, lng: -123.149805 })
                  }
                />
              </ControlItem>
            </ControlsGrid>

            <ComponentContainer>
              <InteractiveMapPicker
                initialLat={selectedLocation.lat}
                initialLng={selectedLocation.lng}
                onLocationSelect={(location) => {
                  setSelectedLocation(location);
                  console.log("Location selected:", location);
                }}
                selectedLocation={selectedLocation}
                height={mapPickerHeight}
              />
            </ComponentContainer>

            <InfoCard>
              <InfoItem>
                <InfoLabel>Selected Coordinates</InfoLabel>
                <InfoValue>
                  {selectedLocation.lat.toFixed(6)},{" "}
                  {selectedLocation.lng.toFixed(6)}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Coordinate String</InfoLabel>
                <InfoValue>
                  {selectedLocation.lat},{selectedLocation.lng}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Map Height</InfoLabel>
                <InfoValue>{mapPickerHeight}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Features</InfoLabel>
                <InfoValue>
                  Click to select, drag marker, search locations, GPS center
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Tile Source</InfoLabel>
                <InfoValue>TileServer (tileserver.carp.school)</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Geocoding</InfoLabel>
                <InfoValue>
                  Nominatim (nominatim.carp.school)
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>🧪 Test Instructions</InfoLabel>
                <InfoValue>
                  1. Search for a location (e.g., &quot;Central Park, New York&quot;)
                  <br />
                  2. Click anywhere on the map to select coordinates
                  <br />
                  3. Drag the red marker to fine-tune position
                  <br />
                  4. Use zoom controls (+/-) to change map scale
                  <br />
                  5. Click GPS button (📍) to center on your location
                  <br />
                  6. Try different map heights in the control above
                  <br />
                  7. Check browser console for location selection events
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>🚀 Goto Test</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Navigation Tool</InfoLabel>
                <InfoValue>
                  Enter a test path to navigate to /_test/ + your input.
                  Use this to quickly navigate to different test pages or routes.
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <ControlsGrid>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Test Path"
                  type="text"
                  value={gotoTestInput}
                  onChange={(e) => setGotoTestInput(e.target.value)}
                  placeholder="Enter test path (e.g., components, login, maps)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleGotoTest();
                    }
                  }}
                />
              </ControlItem>
              <ControlItem>
                <Label>Quick Choices</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <LiquidGlassButton
                    label="liquidglass/login"
                    onClick={() => setGotoTestInput("liquidglass/login")}
                    style={{ fontSize: "12px", padding: "8px 12px" }}
                  />
                  <LiquidGlassButton
                    label="native-blur"
                    onClick={() => setGotoTestInput("native-blur")}
                    style={{ fontSize: "12px", padding: "8px 12px" }}
                  />
                </div>
              </ControlItem>
              <ControlItem>
                <Label>Actions</Label>
                <LiquidGlassButton
                  label="Go to Test"
                  onClick={handleGotoTest}
                />
              </ControlItem>
            </ControlsGrid>

            <InfoCard>
              <InfoItem>
                <InfoLabel>📱 Usage Instructions</InfoLabel>
                <InfoValue>
                  1. Enter a test path in the input field above
                  <br />
                  2. Click &quot;Go to Test&quot; button or press Enter
                  <br />
                  3. You will be redirected to /_test/ + your input
                  <br />
                  4. Example: entering &quot;components&quot; goes to /_test/components
                  <br />
                  5. Use this for quick navigation during development and testing
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>📱 LiquidGlass Mobile NavBar Test</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Component Demo</InfoLabel>
                <InfoValue>
                  Testing the MobileNavBarCSS component - a bottom tab bar with glass morphism effects.
                  The navbar is positioned fixed at the bottom of the screen.
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>🧪 LiquidGlass Mobile NavBar Features</InfoLabel>
                <InfoValue>
                  • Fixed bottom navigation with glass morphism effect
                  <br />
                  • 5 navigation tabs: Home/My Rides, Join Ride, Create Ride, Messages, Profile
                  <br />
                  • Notification badge on Messages tab
                  <br />
                  • Upward-opening dropdown menus
                  <br />
                  • User authentication integration
                  <br />
                  • Admin role support with special menu items
                  <br />
                  • Modal integration for Join/Create ride functionality
                  <br />
                  • SVG icon support with hover animations
                  <br />
                  • Responsive design with touch-friendly interactions
                  <br />
                  • Glass effect with backdrop blur and transparency
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>📱 SVG Icons Included</InfoLabel>
                <InfoValue>
                  The component uses inline SVG icons for optimal performance:
                  <br />
                  • <strong>Home icon</strong> - House outline for My Rides/Home tab
                  <br />
                  • <strong>Search icon</strong> - Magnifying glass for Join Ride tab
                  <br />
                  • <strong>Plus icon</strong> - Add/create symbol for Create Ride tab
                  <br />
                  • <strong>Chat icon</strong> - Message bubble for Messages tab
                  <br />
                  • <strong>User icon</strong> - Profile silhouette for Profile tab
                  <br />
                  All icons are 24x24px with consistent stroke styling and hover animations.
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>📱 Testing Instructions</InfoLabel>
                <InfoValue>
                  1. Scroll to the bottom of the page to see the fixed navbar
                  <br />
                  2. Click each tab to test navigation functionality
                  <br />
                  3. Click the Profile tab to see the upward dropdown menu
                  <br />
                  4. Notice the notification badge (5) on the Messages tab
                  <br />
                  5. Test Join Ride and Create Ride modals by clicking their tabs
                  <br />
                  6. Try signing in/out to see different menu options
                  <br />
                  7. Admin users will see additional options in the Profile dropdown
                  <br />
                  8. Observe the glass morphism effects and hover animations
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>
      </Content>

      {/* Demo LiquidGlass Mobile NavBar - Fixed at bottom */}
      <MobileNavBarCSS items={[
        { id: "home", label: "My Rides", icon: "🏠", action: "home" },
        { id: "join", label: "Join Ride", icon: "🔍", action: "join" },
        { id: "create", label: "Create", icon: "➕", action: "create" },
        { id: "messages", label: "Messages", icon: "💬", action: "messages" },
        { id: "profile", label: "Profile", icon: "👤", action: "profile" },
      ]} />

      {/* Demo LiquidGlass Footer */}
      <LiquidGlassFooter
        companyName=""
        description="Testing the LiquidGlass footer component with glass morphism effects and responsive design."
        email="contact@carp.school"
        phone="+1 (555) 123-TEST"
        address="123 Test Street, Component City, CC 12345"
        onNewsletterSubmit={(email) => {
          console.log("Newsletter signup:", email);
          alert(`Newsletter signup: ${email}`);
        }}
        onLinkClick={(link) => {
          console.log("Footer link clicked:", link);
          alert(`Footer link clicked: ${link}`);
        }}
      />
      <FooterVerbose
        companyName=""
        description="Testing the LiquidGlass footer component with glass morphism effects and responsive design."
        email="contact@carp.school"
        phone="+1 (555) 123-TEST"
        address="123 Test Street, Component City, CC 12345"
        onNewsletterSubmit={(email) => {
          console.log("Newsletter signup:", email);
          alert(`Newsletter signup: ${email}`);
        }}
        onLinkClick={(link) => {
          console.log("Footer link clicked:", link);
          alert(`Footer link clicked: ${link}`);
        }}
      />
    </Container>
  );
};

export default withRouter(MobileTestMapView);
