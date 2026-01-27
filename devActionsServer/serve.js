const express = require('express');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const app = express();

app.post('/webhook', express.json({ type: 'application/json' }), async (request, response) => {

    // Respond to indicate that the delivery was successfully received.
    // Your server should respond with a 2XX response within 10 seconds of receiving a webhook delivery. If your server takes longer than that to respond, then GitHub terminates the connection and considers the delivery a failure.
    response.status(202).send('Accepted');
    console.log('Received a webhook event');

    // Check the `x-github-event` header to learn what event type was sent.
    const githubEvent = request.headers['x-github-event'];
    const body = request.body;
    // You should add logic to handle each event type that your webhook is subscribed to.
    // For example, this code handles the `issues` and `ping` events.
    //
    // If any events have an `action` field, you should also add logic to handle each action that you are interested in.
    // For example, this code handles the `opened` and `closed` actions for the `issue` event.
    //
    // For more information about the data that you can expect for each event type, see [AUTOTITLE](/webhooks/webhook-events-and-payloads).
    if (githubEvent === 'workflow_run') {
        const workflow_run_name = body.workflow_run.name;
        const workflow_run_display_title = body.workflow_run.display_title;
        const workflow_run_conclusion = body.workflow_run.conclusion;
        const repository_name = body.repository.full_name;
        const action = body.action;
        if (action === 'completed') {
            if (workflow_run_name === 'Build Meteor Server Bundle') {
                console.log(`Workflow: ${workflow_run_name} completed`);
                console.log(`Repository: ${repository_name}`);
                console.log(`Display Title: ${workflow_run_display_title}`);
                console.log(`Conclusion: ${workflow_run_conclusion}`);
                if (workflow_run_conclusion === 'success') {
                    let stdout, stderr;
                    console.log('making sure build directory exists');
                    stdout, stderr = await exec('mkdir -p ../build');
                    console.log(stdout);
                    console.log(stderr);
                    console.log('running docker compose down');
                    stdout, stderr = await exec('cd .. && docker compose down');
                    console.log(stdout);
                    console.log(stderr);
                    console.log('checking and removing old bundle if exists');
                    stdout, stderr = await exec(`cd ../build && rm -f app.tar.gz.old`);
                    console.log(stdout);
                    console.log(stderr);
                    try {
                        stdout, stderr = await exec(`cd ../build && mv app.tar.gz app.tar.gz.old`);
                        console.log(stdout);
                        console.log(stderr);
                    } catch (error) {
                        console.error(`Error renaming old bundle: ${error}`);
                    }
                    console.log('downloading new bundle');
                    stdout, stderr = await exec(`cd ../build && gh run download --name "meteor-bundle" --pattern "*"`);
                    console.log(stdout);
                    console.log(stderr);
                    console.log('running docker compose up -d --build');
                    stdout, stderr = await exec('cd .. && docker compose up -d');
                    console.log(stdout);
                    console.log(stderr);
                    console.log('Deployment completed successfully!');
                }
            } else if (githubEvent === 'ping') {
                console.log('GitHub sent the ping event');
            } else {
                console.log(`Unhandled event: ${githubEvent}`);
            }
        }
    }
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
