import styled from 'styled-components';

export const ModalOverlay = styled.div`
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 99999;

  * {
    box-sizing: border-box;
  }
`;

export const ModalContent = styled.div`
  min-width: 340px;
  max-width: 340px;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  position: relative;

  h1 {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 10px;
    text-align: center;
  }
`;

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export const AppLogo = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
`;

export const AppName = styled.h2`
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

export const InstallButton = styled.button`
  width: 100%;
  background: ${props => props.disabled ? '#ccc' : '#007bff'};
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  font-weight: 700;
  padding: 10px;
  margin-top: 10px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.disabled ? '#ccc' : '#0056b3'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'scale(0.98)'};
  }
`;

export const SkipButton = styled.button`
  all: initial;
  font: inherit;
  width: 100%;
  text-align: center;
  cursor: pointer;
  color: #a0a0a0;
  font-size: 14px;
  text-decoration: underline;
  margin-top: 20px;
  padding: 10px;

  &:hover {
    color: #666;
  }
`;

export const IOSInstructions = styled.div`
  ol {
    margin-block: 4px;
    padding: 0;
    margin-left: 20px;
  }

  li {
    margin-bottom: 8px;

    p {
      margin-block: 4px;
    }
  }
`;

export const ShareIcon = styled.span`
  vertical-align: middle;
  margin: 0 4px;

  svg {
    fill: currentColor;
  }
`;
