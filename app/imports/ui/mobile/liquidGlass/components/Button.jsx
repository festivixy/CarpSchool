import React from "react";
import PropTypes from "prop-types";
import {
  ButtonContainer,
  Background,
  BlurContainer,
  FillLayer,
  LabelContainer,
  LabelSymbol,
  LabelText,
} from "../styles/Button";

/**
 * ButtonLiquidGlassText component with liquid glass effect
 */
function LiquidGlassButton({ label = "Label", onClick, ...props }) {
  return (
    <ButtonContainer onClick={onClick} {...props}>
      <Background>
        <BlurContainer />
        <FillLayer />
      </Background>
      <LabelContainer>
        <LabelSymbol>
          <LabelText>{label}</LabelText>
        </LabelSymbol>
      </LabelContainer>
    </ButtonContainer>
  );
}

LiquidGlassButton.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
};

export default LiquidGlassButton;
