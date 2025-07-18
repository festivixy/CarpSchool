import styled from "styled-components";

// Styled Components for TestImageUpload
export const Container = styled.div`
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  margin: 0 auto;
  padding: 20px 0;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 0;
  }
`;

export const Header = styled.div`
  display: flex;
  max-width: 100%;
  flex-direction: column;
  font-size: 28px;
  color: rgba(0, 0, 0, 1);
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.5px;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const AppName = styled.h1`
  margin: 20px 0;
  color: rgba(0, 0, 0, 0.87);
`;

export const Content = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 0 24px;
  max-width: 1000px;

  @media (max-width: 768px) {
    padding: 0 20px;
    max-width: 100%;
  }
`;

export const Copy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(0, 0, 0, 1);
  text-align: center;
  justify-content: start;
  margin-bottom: 40px;
  max-width: 600px;

  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

export const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: rgba(0, 0, 0, 0.87);
  letter-spacing: -0.3px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  color: rgba(100, 100, 100, 1);
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

export const Section = styled.div`
  width: 100%;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 20px 0;
  letter-spacing: -0.2px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

export const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
`;

export const ComponentContainer = styled.div`
  width: 100%;
  max-width: 600px;

  /* Override semantic-ui styles for better integration */
  .ui.segment {
    border-radius: 12px;
    border: 1px solid rgba(230, 230, 230, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 24px;
  }

  .ui.button {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .ui.button.primary {
    background-color: rgba(0, 0, 0, 1);

    &:hover {
      background-color: rgba(40, 40, 40, 1);
      transform: translateY(-1px);
    }
  }

  .ui.input input {
    border-radius: 8px;
    border: 1px solid rgba(224, 224, 224, 1);

    &:focus {
      border-color: rgba(0, 0, 0, 0.3);
    }
  }

  .ui.message {
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    .ui.segment {
      padding: 20px;
    }
  }
`;

export const StatusCard = styled.div`
  background-color: ${(props) => (props.success // eslint-disable-line
      ? "rgba(240, 255, 240, 1)"
      : props.error
        ? "rgba(255, 240, 240, 1)"
        : "rgba(250, 250, 250, 1)")};
  border: 1px solid
    ${(props) => (props.success // eslint-disable-line
        ? "rgba(200, 255, 200, 1)"
        : props.error
          ? "rgba(255, 200, 200, 1)"
          : "rgba(230, 230, 230, 1)")};
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 600px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const StatusHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
`;

export const StatusIcon = styled.div`
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
`;

export const StatusInfo = styled.div`
  flex: 1;
`;

export const StatusLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

export const StatusValue = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: rgba(80, 80, 80, 1);
  word-break: break-all;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

export const InfoGrid = styled.div`
  display: grid;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: rgba(230, 230, 230, 1);
  margin: 40px 0;
  max-width: 600px;

  @media (max-width: 768px) {
    margin: 32px 0;
  }
`;
