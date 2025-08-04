import styled from "styled-components";

export const MapContainer = styled.div`
  width: 376px;
  height: 272px;
  flex-shrink: 0;
  background: #fafcff;
  position: relative;
  overflow: hidden;
`;

export const MapImage = styled.img`
  width: 376px;
  height: 320px;
  flex-shrink: 0;
  position: absolute;
  left: 0px;
  top: 0px;
  object-fit: cover;
`;

export const PriceChip = styled.div`
  display: inline-flex;
  min-height: 28px;
  padding: 8px 12px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 24px;
  position: absolute;

  ${(props) => (props.selected
      ? `
    background: rgba(0, 0, 0, 0.8999999761581421);
  `
      : `
    background: #FCFEFF;
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.08);
  `)}
`;

export const PriceText = styled.div`
  text-align: center;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 135%;
  position: relative;

  ${(props) => (props.selected
      ? `
    color: #FFF;
  `
      : `
    color: #1B2228;
  `)}
`;
