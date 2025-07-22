import React, { useState } from "react";
import MapView from "../components/MapView";
import InteractiveMapPicker from "../components/InteractiveMapPicker";
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
  const [latitude, setLatitude] = useState(49.2827);
  const [longitude, setLongitude] = useState(-123.1207);
  const [tileServerUrl, setTileServerUrl] = useState("");
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 49.2827,
    lng: -123.1207,
  });
  const [mapPickerHeight, setMapPickerHeight] = useState("400px");

  const handleLatitudeChange = (e) => {
    setLatitude(parseFloat(e.target.value) || 0);
  };

  const handleLongitudeChange = (e) => {
    setLongitude(parseFloat(e.target.value) || 0);
  };

  return (
    <Container>
      <Header>
        <AppName>MapView Test</AppName>
      </Header>

      <Content>
        <Copy>
          <Title>Test MapView Component</Title>
          <Subtitle>
            Interactive testing page for the MapView component with price chips
            overlay
          </Subtitle>
        </Copy>

        <Section>
          <SectionTitle>🗺️ Map Component</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={handleLatitudeChange}
                  placeholder="Enter latitude"
                />
              </ControlItem>
              <ControlItem>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={handleLongitudeChange}
                  placeholder="Enter longitude"
                />
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
                latitude={latitude}
                longitude={longitude}
                tileServerUrl={tileServerUrl || undefined}
              />
            </ComponentContainer>

            <InfoCard>
              <InfoItem>
                <InfoLabel>Current Coordinates</InfoLabel>
                <InfoValue>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Component Size</InfoLabel>
                <InfoValue>376px × 272px</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Map Source</InfoLabel>
                <InfoValue>
                  {tileServerUrl ? "Self-hosted tiles" : "Public OSM"}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Price Chips</InfoLabel>
                <InfoValue>7 sample price points displayed</InfoValue>
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
                <button
                  onClick={() =>
                    setSelectedLocation({ lat: 49.2827, lng: -123.1207 })
                  }
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Reset to Vancouver
                </button>
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
                <InfoValue>Nominatim (OpenStreetMap)</InfoValue>
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
