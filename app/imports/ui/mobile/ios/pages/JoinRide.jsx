import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import {
  MainPageContainer,
  FixedHeader,
  HeaderTitle,
  ContentPadding,
  InputSection,
  CodeInputs,
  CodeInput,
  Dash,
  ErrorMessage,
  Success,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  Actions,
  ButtonPrimary,
} from "../styles/JoinRide";

/**
 * iOS-specific Join Ride page
 * Uses JoinRideModal component logic adapted for page layout
 */
class JoinRide extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      codeInputs: ["", "", "", "", "", "", "", ""], // 8 separate inputs
      isJoining: false,
      error: null,
      success: false,
    };
    this.inputRefs = [];
  }

  componentDidMount() {
    this.prefillCodeIfProvided();
    // Focus first input
    setTimeout(() => {
      if (this.inputRefs[0]) {
        this.inputRefs[0].focus();
      }
    }, 100);
  }

  componentDidUpdate(prevProps) {
    // If prefillCode prop changed, update the inputs
    if (prevProps.prefillCode !== this.props.prefillCode) {
      this.prefillCodeIfProvided();
    }
  }

  prefillCodeIfProvided = () => {
    const { prefillCode } = this.props;
    if (prefillCode && prefillCode.length >= 8) {
      // Remove dash and take first 8 characters
      const cleanCode = prefillCode.replace(/-/g, "").slice(0, 8);
      const newInputs = ["", "", "", "", "", "", "", ""];

      for (let i = 0; i < cleanCode.length && i < 8; i++) {
        newInputs[i] = cleanCode[i].toUpperCase();
      }

      this.setState({ codeInputs: newInputs, error: null });
    }
  };

  handleInputChange = (index, e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (value.length <= 1) {
      const newInputs = [...this.state.codeInputs];
      newInputs[index] = value;
      this.setState({ codeInputs: newInputs, error: null });

      // Auto-advance to next input if character was entered
      if (value.length === 1 && index < 7) {
        setTimeout(() => {
          if (this.inputRefs[index + 1]) {
            this.inputRefs[index + 1].focus();
          }
        }, 50);
      }
    }
  };

  handleKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (
      e.key === "Backspace" &&
      this.state.codeInputs[index] === "" &&
      index > 0
    ) {
      setTimeout(() => {
        if (this.inputRefs[index - 1]) {
          this.inputRefs[index - 1].focus();
        }
      }, 50);
    }
  };

  handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (pastedText.length <= 8) {
      const newInputs = ["", "", "", "", "", "", "", ""];
      for (let i = 0; i < pastedText.length; i++) {
        newInputs[i] = pastedText[i];
      }
      this.setState({ codeInputs: newInputs, error: null });

      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedText.length, 7);
      setTimeout(() => {
        if (this.inputRefs[nextIndex]) {
          this.inputRefs[nextIndex].focus();
        }
      }, 50);
    }
  };

  handleJoinRide = () => {
    const shareCode = this.state.codeInputs.join("");

    if (shareCode.length !== 8) {
      this.setState({ error: "Please enter all 8 characters of the code" });
      return;
    }

    // Format as XXXX-XXXX for server
    const formattedCode = `${shareCode.slice(0, 4)}-${shareCode.slice(4)}`;

    this.setState({ isJoining: true, error: null });

    Meteor.call("rides.joinWithCode", formattedCode, (error, _result) => {
      this.setState({ isJoining: false });

      if (error) {
        this.setState({ error: error.message });
      } else {
        this.setState({
          success: true,
          error: null,
        });

        // Show success for 2 seconds then navigate
        setTimeout(() => {
          this.props.history.push("/myRides");
        }, 2000);
      }
    });
  };

  handleTryAgain = () => {
    this.setState({
      success: false,
      error: null,
      codeInputs: ["", "", "", "", "", "", "", ""],
    });
    setTimeout(() => {
      if (this.inputRefs[0]) {
        this.inputRefs[0].focus();
      }
    }, 100);
  };

  render() {
    const { codeInputs, isJoining, error, success } = this.state;

    const isComplete = codeInputs.every((input) => input.length === 1);

    return (
      <MainPageContainer>
        {/* Fixed Header */}
        <FixedHeader>
        </FixedHeader>

        <ContentPadding>
          <FixedHeader>
            <HeaderTitle>Join a Ride</HeaderTitle>
            <div style={{
              fontSize: "14px",
              color: "rgba(100, 100, 100, 1)",
              margin: "0",
              lineHeight: "1.4",
            }}>
              Enter the 8-character code shared by the driver
            </div>
          </FixedHeader>

          {success ? (
            <Success>
              <SuccessIcon>✓</SuccessIcon>
              <SuccessTitle>Successfully Joined!</SuccessTitle>
              <SuccessMessage>
                You have been added to the ride. Check your rides page for
                details.
              </SuccessMessage>
            </Success>
          ) : (
            <>
              {/* Code Input Section */}
              <InputSection>

                <CodeInputs>
                  {codeInputs.map((value, index) => (
                    <React.Fragment key={index}>
                      <CodeInput
                        ref={(ref) => {
                          this.inputRefs[index] = ref;
                        }}
                        value={value}
                        onChange={(e) => this.handleInputChange(index, e)}
                        onKeyDown={(e) => this.handleKeyDown(index, e)}
                        onPaste={index === 0 ? this.handlePaste : undefined}
                        maxLength={1}
                        type="text"
                        inputMode="alphanumeric"
                        autoCapitalize="characters"
                        autoComplete="off"
                        spellCheck="false"
                      />
                      {index === 3 && <Dash>-</Dash>}
                    </React.Fragment>
                  ))}
                </CodeInputs>

                {error && <ErrorMessage>{error}</ErrorMessage>}
              </InputSection>

              {/* Action Buttons */}
              <Actions>
                <ButtonPrimary
                  onClick={this.handleJoinRide}
                  disabled={isJoining || !isComplete}
                >
                  {isJoining ? "Joining..." : "Join Ride"}
                </ButtonPrimary>
              </Actions>
            </>
          )}
        </ContentPadding>
      </MainPageContainer>
    );
  }
}

JoinRide.propTypes = {
  history: PropTypes.object.isRequired,
  prefillCode: PropTypes.string,
};

export default withRouter(withTracker(() => ({
  // Add any subscriptions if needed
}))(JoinRide));
