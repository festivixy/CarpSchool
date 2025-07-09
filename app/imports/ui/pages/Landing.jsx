import React from 'react';
import { Grid, Container, Image, Divider, Header } from 'semantic-ui-react';

/** A simple static component to render some text for the landing page. */
class Landing extends React.Component {
  render() {

    return (
        <div className='landing-background'>
          <Grid verticalAlign='middle' textAlign='center'>
            <Grid.Row>
              <Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden />
            </Grid.Row>
            <Grid.Row>
              <Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden />
            </Grid.Row>
            <Grid.Row>
              <Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden />
            </Grid.Row>
            <Grid container stackable>
              <Grid.Column width={6}>
                <Grid.Row>
                  <Header as='h1' textAlign='center' inverted>What is UHber (/ʌ-bər/)?</Header>
                  <Container textAlign='justified'>
                    <p>The UHber website provides a space for students traveling to/from the UH Manoa campus to easily
                      coordinate carpools. </p>

                    <p>The use of UH-email/UH ID numbers ensures that each user is a verified UH Manoa
                      student; this system also prohibits banned users from continuing to use the UHber website.</p>
                  </Container>
                </Grid.Row>
                <Divider hidden />
                <Grid.Row>
                  <Header as='h1' textAlign='center' inverted>How to Use UHber</Header>
                  <Container textAlign='justified'>
                    <p>After signing up for UHber with your UH email, users can sign in to look through a list of future
                      rides or create a new ride. After creating a new ride or signing up for a ride, users can view their
                      scheduled rides on their calendar.</p>

                    <p>The user profile can be edited to set your information, including: contact info, address/location,
                      user type (driver, rider, or both), and car picture. </p>
                  </Container>
                </Grid.Row>
                <Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden />
                <Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden />
                <Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden />
                <Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden />
                <Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden />
                <Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden /><Divider hidden />

              </Grid.Column>
            </Grid>

          </Grid>
        </div>
    );
  }
}

export default Landing;
