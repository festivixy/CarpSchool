import styled from "styled-components";

export const MapContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
`;

export const SearchContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }

  &::placeholder {
    color: rgba(130, 130, 130, 1);
  }
`;

export const SearchButton = styled.button`
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  min-width: 48px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(40, 40, 40, 1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SearchResults = styled.div`
  background-color: white;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
`;

export const SearchResult = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(240, 240, 240, 1);
  font-size: 14px;
  line-height: 1.4;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(248, 250, 252, 1);
  }
`;

export const MapWrapper = styled.div`
  position: relative;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 12px;
  overflow: hidden;
  background-color: rgba(248, 250, 252, 1);

  /* Leaflet map styles */
  .leaflet-container {
    font-family: inherit;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 8px;
  }

  .leaflet-popup-content {
    font-family: inherit;
    font-size: 14px;
  }

  .leaflet-control-zoom {
    display: none; /* Hide default zoom controls */
  }

  .leaflet-control-attribution {
    font-size: 11px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
  }
`;

export const MapControls = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
`;

export const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  &:hover {
    background-color: rgba(248, 250, 252, 1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const LocationInfo = styled.div`
  background-color: rgba(248, 250, 252, 1);
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const LocationLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(100, 100, 100, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const LocationValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
`;

export const HelpText = styled.div`
  font-size: 13px;
  color: rgba(100, 100, 100, 1);
  line-height: 1.5;
  padding: 12px 16px;
  background-color: rgba(240, 248, 255, 1);
  border: 1px solid rgba(191, 219, 254, 1);
  border-radius: 8px;
`;
