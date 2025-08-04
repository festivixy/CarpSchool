import styled from "styled-components";

export const DemoContainer = styled.div`
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
`;

export const BackgroundContent = styled.div`
  padding: 20px;
  padding-bottom: 120px; /* Space for toolbar */
`;

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

export const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const CardTitle = styled.h3`
  color: white;
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
`;

export const CardText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
`;

export const StatusBar = styled.div`
  position: fixed;
  top: env(safe-area-inset-top, 20px);
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 1001;
`;

export const StatusItem = styled.div`
  background: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
`;

export const ControlsContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 20px;
  right: 20px;
  transform: translateY(-50%);
  z-index: 999;
`;

export const ControlsContent = styled.div`
  padding: 24px;
`;

export const ControlGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const ControlLabel = styled.label`
  display: block;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

export const StyleSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const StyleButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${props => (props.active
    ? "rgba(0, 122, 255, 0.8)"
    : "rgba(0, 0, 0, 0.1)")
  };
  
  color: ${props => (props.active
    ? "white"
    : "rgba(0, 0, 0, 0.7)")
  };
  
  &:hover {
    background: ${props => (props.active
      ? "rgba(0, 122, 255, 1)"
      : "rgba(0, 0, 0, 0.2)")
    };
  }
`;

export const IntensitySlider = styled.input`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0, 122, 255, 0.8);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

export const ToolbarToggle = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${props => (props.active
    ? "rgba(255, 59, 48, 0.8)"
    : "rgba(0, 122, 255, 0.8)")
  };
  
  color: white;
  
  &:hover {
    background: ${props => (props.active
      ? "rgba(255, 59, 48, 1)"
      : "rgba(0, 122, 255, 1)")
    };
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

export const LoadingText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 500;
`;
