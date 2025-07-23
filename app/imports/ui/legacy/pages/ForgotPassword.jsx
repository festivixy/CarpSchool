import React from "react";
import {
  Grid,
  Segment,
  Header,
  Button,
  Divider,
  Input,
  Modal,
} from "semantic-ui-react";
import {
  AutoForm,
  TextField,
  SubmitField,
  ErrorsField,
} from "uniforms-semantic";
import swal from "sweetalert";
import Joi from "joi";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { JoiBridge } from "../forms/JoiBridge";

/** Create a schema to specify the structure of the data to appear in the form. */
const formSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().label("Email"),
});

const bridge = new JoiBridge(formSchema);

/** Renders the Page for adding a document. */
class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      captchaInput: "",
      captchaSvg: "",
      captchaSessionId: "",
      isLoadingCaptcha: false,
      showCaptchaErrorModal: false,
    };
  }

  componentDidMount() {
    this.generateNewCaptcha();
  }

  /** Generate a new CAPTCHA */
  generateNewCaptcha = () => {
    this.setState({ isLoadingCaptcha: true });
    Meteor.call("captcha.generate", (error, result) => {
      if (error) {
        swal("Error", "Failed to load CAPTCHA. Please try again.", "error");
        this.setState({ isLoadingCaptcha: false });
      } else {
        this.setState({
          captchaSvg: result.svg,
          captchaSessionId: result.sessionId,
          captchaInput: "",
          isLoadingCaptcha: false,
        });
      }
    });
  };

  /** Close the CAPTCHA error modal */
  closeCaptchaErrorModal = () => {
    this.setState({ showCaptchaErrorModal: false });
  };

  /** Handle CAPTCHA input change */
  handleCaptchaChange = (e, { value }) => {
    this.setState({ captchaInput: value });
  };

  /** On submit, insert the data. */
  submit(data, formRef) {
    const { email } = data;
    const { captchaInput, captchaSessionId } = this.state;

    // First verify CAPTCHA
    Meteor.call(
      "captcha.verify",
      captchaSessionId,
      captchaInput,
      (captchaError, isValidCaptcha) => {
        if (captchaError || !isValidCaptcha) {
          this.setState({ showCaptchaErrorModal: true });
          this.generateNewCaptcha(); // Generate new CAPTCHA
          return;
        }

        // CAPTCHA is valid, proceed with password reset
        Accounts.forgotPassword({ email }, (error) => {
          if (error) {
            swal("Error", error.message, "error");
            this.generateNewCaptcha(); // Generate new CAPTCHA on error
          } else {
            swal(
              "Success",
              "An email has been sent to reset your password.",
              "success",
            );
            formRef.reset();
            this.setState({ captchaInput: "" });
            this.generateNewCaptcha(); // Generate new CAPTCHA after success
          }
        });
      },
    );
  }

  /** Render the form. Use Uniforms: https://github.com/vazco/uniforms */
  render() {
    let fRef = null;
    return (
      <div>
        <Grid container centered>
          <Grid.Column>
            <AutoForm
              ref={(ref) => {
                fRef = ref;
              }}
              schema={bridge}
              onSubmit={(data) => this.submit(data, fRef)}
            >
              <Segment>
                <Header as="h2" textAlign="center">
                  Forgot Your Password?
                </Header>
                <TextField name="email" />

                <Divider />

                {/* CAPTCHA Section */}
                <div style={{ textAlign: "center", marginBottom: "1em" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5em",
                      fontWeight: "bold",
                    }}
                  >
                    Security Verification
                  </label>
                  <div
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      padding: "10px",
                      marginBottom: "0.5em",
                      backgroundColor: "#f9f9f9",
                      display: "inline-block",
                    }}
                  >
                    {this.state.isLoadingCaptcha ? (
                      <div>Loading CAPTCHA...</div>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: this.state.captchaSvg,
                        }}
                      />
                    )}
                  </div>
                  <br />
                  <Button
                    type="button"
                    size="small"
                    onClick={this.generateNewCaptcha}
                    loading={this.state.isLoadingCaptcha}
                  >
                    Refresh CAPTCHA
                  </Button>
                </div>

                <Input
                  label={{
                    basic: true,
                    content: "Enter the characters shown above",
                  }}
                  name="captchaInput"
                  placeholder="Enter CAPTCHA"
                  value={this.state.captchaInput}
                  onChange={this.handleCaptchaChange}
                  style={{
                    textAlign: "center",
                    marginBottom: "1em",
                    width: "100%",
                  }}
                />

                <SubmitField value="Submit" />
                <ErrorsField />
              </Segment>
            </AutoForm>
          </Grid.Column>
        </Grid>

        {/* CAPTCHA Error Modal */}
        <Modal
          open={this.state.showCaptchaErrorModal}
          onClose={this.closeCaptchaErrorModal}
          size="small"
        >
          <Modal.Header>Invalid CAPTCHA</Modal.Header>
          <Modal.Content>
            <p>
              The security verification code you entered is incorrect. Please
              try again with the new code that has been generated.
            </p>
          </Modal.Content>
          <Modal.Actions>
            <Button
              positive
              onClick={this.closeCaptchaErrorModal}
              content="OK"
            />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default ForgotPassword;
