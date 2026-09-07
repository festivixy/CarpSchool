const express = require('express');
const util = require('util');
const crypto = require('crypto');
const exec = util.promisify(require('child_process').exec);

const app = express();

// Every delivery must carry a valid X-Hub-Signature-256 computed with the
// webhook secret GitHub was configured with. Without this check any POST to
// this port took production down and redeployed whatever artifact was latest.
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const ALLOWED_REPOSITORY = process.env.GITHUB_REPOSITORY_FULL_NAME || 'zlc1004/Carpool';

const rawBodySaver = (req, res, buf) => { req.rawBody = buf; };

const signatureValid = (request) => {
    if (!WEBHOOK_SECRET) return false;
    const header = request.headers['x-hub-signature-256'];
    if (typeof header !== 'string' || !request.rawBody) return false;
    const expected = 'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET).update(request.rawBody).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(header);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

app.post('/webhook', express.json({ type: 'application/json', verify: rawBodySaver }), async (request, response) => {
    if (!WEBHOOK_SECRET) {
        console.error('GITHUB_WEBHOOK_SECRET is not set; refusing all deliveries');
        return response.status(503).send('Webhook not configured');
    }
    if (!signatureValid(request)) {
        console.warn('Rejected webhook delivery with a missing or invalid signature');
        return response.status(401).send('Invalid signature');
    }
    if (!request.body || !request.body.repository || request.body.repository.full_name !== ALLOWED_REPOSITORY) {
        console.warn('Rejected webhook delivery for an unexpected repository');
        return response.status(403).send('Unexpected repository');
    }

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
                    stdout, stderr = await exec('if not exist "..\\build" mkdir "..\\build"');
                    console.log(stdout);
                    console.log(stderr);
                    console.log('running docker compose down');
                    stdout, stderr = await exec('cd .. && docker compose down');
                    console.log(stdout);
                    console.log(stderr);
                    console.log('checking and removing old bundle if exists');
                    try {
                        stdout, stderr = await exec(`cd ..\\build && if exist app.tar.gz.old del /F app.tar.gz.old`);
                        console.log(stdout);
                        console.log(stderr);
                        stdout, stderr = await exec(`cd ..\\build && if exist app.tar.gz move app.tar.gz app.tar.gz.old`);
                        console.log(stdout);
                        console.log(stderr);
                    } catch {}
                    console.log('downloading new bundle');
                    stdout, stderr = await exec(`cd ..\\build && gh run download --name "meteor-bundle" --pattern "*"`);
                    console.log(stdout);
                    console.log(stderr);
                    console.log('Moving to deployment directory and starting services');
                    stdout, stderr = await exec(`cd ..\\build && move meteor-bundle\\app.tar.gz app.tar.gz`);
                    console.log(stdout);
                    console.log(stderr);
                    console.log('running docker compose up -d');
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

const port = process.env.PORT || 3100;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
