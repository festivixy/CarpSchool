import React from "react";
import PropTypes from "prop-types";
import {
  ButtonContainer,
  Background,
  BlurContainer,
  MaskContainer,
  MaskShape,
  BlurEffect,
  FillLayer,
  GlassEffectLayer,
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
        <BlurContainer>
          <MaskContainer>
            <MaskShape />
          </MaskContainer>
          <BlurEffect />
        </BlurContainer>
        <FillLayer />
        <GlassEffectLayer />
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
