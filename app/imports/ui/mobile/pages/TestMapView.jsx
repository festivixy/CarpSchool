import React, { useState } from "react";
import MapView from "../components/MapView";
import InteractiveMapPicker from "../components/InteractiveMapPicker";
import LiquidGlassButton from "../liquidGlass/components/Button";
import LiquidGlassNavbar from "../liquidGlass/components/Navbar";
import LiquidGlassDropdown from "../liquidGlass/components/Dropdown";
import {
  Container,
  Header,
  AppName,
  Content,
  Copy,
  Title,
  Subtitle,
  Section,
  SectionTitle,
  SectionContent,
  ComponentContainer,
  ControlsGrid,
  ControlItem,
  Label,
  Input,
  InfoCard,
  InfoItem,
  InfoLabel,
  InfoValue,
} from "../styles/TestMapView";

/**
 * Test page for MapView component - Admin only
 */
const MobileTestMapView = () => {
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

  const handleAddPoint = () => {
    const lat = parseFloat(newPointLat);
    const lng = parseFloat(newPointLng);

    if (!isNaN(lat) && !isNaN(lng)) {
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
    { value: "vancouver", label: "Vancouver", icon: "🏙️" },
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

  const handleNavClick = (item, e) => {
    console.log("Navigation clicked:", item);
    alert(`Navigation clicked: ${item}`);
  };

  const handleSignOut = () => {
    console.log("Sign out clicked");
    alert("Sign out clicked");
  };

  return (
    <Container>
      <Header>
        <AppName>Components Test</AppName>
      </Header>

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
            logoText="TestApp"
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

      <style jsx>{`
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
          <Title>Components Test</Title>
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
                <Label htmlFor="newPointLat">Add Point - Latitude</Label>
                <Input
                  id="newPointLat"
                  type="number"
                  step="0.000001"
                  value={newPointLat}
                  onChange={(e) => setNewPointLat(e.target.value)}
                  placeholder="Enter latitude"
                />
              </ControlItem>
              <ControlItem>
                <Label htmlFor="newPointLng">Add Point - Longitude</Label>
                <Input
                  id="newPointLng"
                  type="number"
                  step="0.000001"
                  value={newPointLng}
                  onChange={(e) => setNewPointLng(e.target.value)}
                  placeholder="Enter longitude"
                />
              </ControlItem>
            </ControlsGrid>

            <ControlsGrid>
              <ControlItem>
                <Label htmlFor="newPointLabel">
                  Add Point - Label (optional)
                </Label>
                <Input
                  id="newPointLabel"
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
              <Label htmlFor="tileServer">
                Self-hosted Tile Server URL (optional)
              </Label>
              <Input
                id="tileServer"
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
          <SectionTitle>🌐 LiquidGlass Navbar Test</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Component Demo</InfoLabel>
                <InfoValue>
                  The navbar above is a live demo of the LiquidGlassNavbar
                  component with glass morphism effects
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
              backgroundPosition: `${backgroundPosition.x}px ${backgroundPosition.y}px, ${backgroundPosition.x}px ${backgroundPosition.y}px, 0 0`,
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
                <InfoLabel>🧪 LiquidGlass Dropdown Features</InfoLabel>
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
                  5. Test clear functionality with the 'X' button
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
                    backgroundPosition: `${backgroundPosition.x}px ${backgroundPosition.y}px, ${backgroundPosition.x}px ${backgroundPosition.y}px, 0 0`,
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
                  8. Use "Reset Pattern" button to center the background
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
                <Label htmlFor="mapHeight">Map Height</Label>
                <Input
                  id="mapHeight"
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
                  onClick={() =>
                    setSelectedLocation({ lat: 49.345196, lng: -123.149805 })
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
                <InfoValue>Tileserver proxy (/tileserver/...)</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Geocoding</InfoLabel>
                <InfoValue>
                  TileServer GL (local) with Nominatim fallback
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>🧪 Test Instructions</InfoLabel>
                <InfoValue>
                  1. Search for a location (e.g., "Central Park, New York")
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
      </Content>
    </Container>
  );
};

export default MobileTestMapView;
