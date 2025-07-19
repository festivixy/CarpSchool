import React, { useState } from "react";
import MapView from "../components/MapView";
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
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [tileServerUrl, setTileServerUrl] = useState("");

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
      </Content>
    </Container>
  );
};

export default MobileTestMapView;
