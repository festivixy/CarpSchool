import React, { useState } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import MapView from "../../components/MapView";
import InteractiveMapPicker from "../../mobile/components/InteractiveMapPicker";
import PathMapView from "../../components/PathMapView";
import LiquidGlassButton from "../../liquidGlass/components/Button";
import LiquidGlassTextInput from "../../liquidGlass/components/TextInput";
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
  MarginContainer,
} from "../styles/MapComponentsTest";

/**
 * Test page for Map components - Admin only
 */
const MapComponentsTest = ({ history: _history }) => {
  // MapView state
  const [coordinates, setCoordinates] = useState([
    { lat: 49.345196, lng: -123.149805, label: "Vancouver" },
    { lat: 49.35, lng: -123.155, label: "Point 2" },
    { lat: 49.34, lng: -123.145, label: "Point 3" },
  ]);
  const [tileServerUrl, setTileServerUrl] = useState("");
  const [newPointLat, setNewPointLat] = useState("");
  const [newPointLng, setNewPointLng] = useState("");
  const [newPointLabel, setNewPointLabel] = useState("");

  // InteractiveMapPicker state
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 49.345196,
    lng: -123.149805,
  });
  const [mapPickerHeight, setMapPickerHeight] = useState("400px");

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
  const [routingService] = useState("osrm");

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

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    console.log("Selected location:", location);
  };

  const handlePathUpdate = () => {
    const startLat = parseFloat(pathStartLat);
    const startLng = parseFloat(pathStartLng);
    const endLat = parseFloat(pathEndLat);
    const endLng = parseFloat(pathEndLng);

    if (!Number.isNaN(startLat) && !Number.isNaN(startLng)) {
      setPathStartCoord({ lat: startLat, lng: startLng });
    }
    if (!Number.isNaN(endLat) && !Number.isNaN(endLng)) {
      setPathEndCoord({ lat: endLat, lng: endLng });
    }
  };

  return (
    <Container>
      <BackButton />

      {/* Fixed Header */}
      <TestPageHeader>
        <TestPageTitle>
          Map Components Test
        </TestPageTitle>
      </TestPageHeader>

      <Content style={{ paddingTop: "80px" }}>
        {/* MapView Component Test */}
        <Section>
          <SectionTitle>🗺️ MapView Component</SectionTitle>
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
                <FlexContainer>
                  <LiquidGlassButton
                    label="Add Point"
                    onClick={handleAddPoint}
                  />
                  <LiquidGlassButton
                    label="Clear All"
                    onClick={handleClearPoints}
                  />
                </FlexContainer>
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
                    <MarginContainer>
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
                    </MarginContainer>
                  )}
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        {/* InteractiveMapPicker Component Test */}
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
                  placeholder="400px"
                />
              </ControlItem>
            </ControlsGrid>

            <ComponentContainer style={{ height: mapPickerHeight }}>
              <InteractiveMapPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={selectedLocation}
                height={mapPickerHeight}
              />
            </ComponentContainer>

            <InfoCard>
              <InfoItem>
                <InfoLabel>Selected Location</InfoLabel>
                <InfoValue>
                  Lat: {selectedLocation.lat.toFixed(6)}, Lng:{" "}
                  {selectedLocation.lng.toFixed(6)}
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        {/* PathMapView Component Test */}
        <Section>
          <SectionTitle>🛣️ Path Finding Map</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Start Latitude"
                  type="number"
                  value={pathStartLat}
                  onChange={(e) => setPathStartLat(e.target.value)}
                  placeholder="49.345196"
                />
              </ControlItem>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Start Longitude"
                  type="number"
                  value={pathStartLng}
                  onChange={(e) => setPathStartLng(e.target.value)}
                  placeholder="-123.149805"
                />
              </ControlItem>
              <ControlItem>
                <LiquidGlassTextInput
                  label="End Latitude"
                  type="number"
                  value={pathEndLat}
                  onChange={(e) => setPathEndLat(e.target.value)}
                  placeholder="49.35"
                />
              </ControlItem>
              <ControlItem>
                <LiquidGlassTextInput
                  label="End Longitude"
                  type="number"
                  value={pathEndLng}
                  onChange={(e) => setPathEndLng(e.target.value)}
                  placeholder="-123.155"
                />
              </ControlItem>
              <ControlItem>
                <LiquidGlassTextInput
                  label="Map Height"
                  type="text"
                  value={pathMapHeight}
                  onChange={(e) => setPathMapHeight(e.target.value)}
                  placeholder="450px"
                />
              </ControlItem>
              <ControlItem>
                <Label>Actions</Label>
                <LiquidGlassButton
                  label="Update Path"
                  onClick={handlePathUpdate}
                />
              </ControlItem>
            </ControlsGrid>

            <ComponentContainer style={{ height: pathMapHeight }}>
              <PathMapView
                startCoordinate={pathStartCoord}
                endCoordinate={pathEndCoord}
                height={pathMapHeight}
                routingService={routingService}
              />
            </ComponentContainer>

            <InfoCard>
              <InfoItem>
                <InfoLabel>Route Service</InfoLabel>
                <InfoValue>{routingService.toUpperCase()}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Start Point</InfoLabel>
                <InfoValue>
                  {pathStartCoord.lat.toFixed(6)}, {pathStartCoord.lng.toFixed(6)}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>End Point</InfoLabel>
                <InfoValue>
                  {pathEndCoord.lat.toFixed(6)}, {pathEndCoord.lng.toFixed(6)}
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>
      </Content>
    </Container>
  );
};

MapComponentsTest.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(MapComponentsTest);
