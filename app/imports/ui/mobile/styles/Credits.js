import styled from "styled-components";

export const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  position: absolute;
  left: 20px;
  top: 20px;

  &:hover {
    background-color: rgba(240, 240, 240, 1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const HeaderWithBack = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`;
