import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

export const AppName = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;
