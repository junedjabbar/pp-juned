import axios from 'axios';
import { config } from './config.js';

const logger = console

const { CLIENT_ID, COGNITO_BASE_URI, REDIRECT_URI } = config;

export default function pluginAuth(app) {

    // Route to handle the OAuth authorization request
    app.get('/authorize', (req, res) => {
        const { state } = req.query;

        logger.info('→ /authorize request received:', req.query);

        // Build the Cognito authorization URL
        const authorizationUrl = `${COGNITO_BASE_URI}/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}`;

        // Redirect to Cognito's OAuth authorization endpoint
        res.redirect(authorizationUrl);
    });

    // Route to handle token exchange after the user authenticates (Token URL)
    app.post('/token', async (req, res) => {
        const { code } = req.body;

        logger.info('→ /token request received:', req.body);

        if (!code) {
            return res.status(400).send('Authorization code missing.');
        }

        // Prepare the token request to Cognito
        const tokenParams = new URLSearchParams();
        tokenParams.append('grant_type', 'authorization_code');
        tokenParams.append('client_id', CLIENT_ID);
        // tokenParams.append('client_secret', CLIENT_SECRET);
        tokenParams.append('code', code);
        tokenParams.append('redirect_uri', REDIRECT_URI);

        try {
            // Make the token request to Cognito's /token endpoint
            const tokenResponse = await axios.post(`${COGNITO_BASE_URI}/oauth2/token`, tokenParams.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            logger.info('← Token response:', tokenResponse.data);

            // Return the token response to the client
            res.json(tokenResponse.data);
        } catch (err) {
            console.error('Token exchange failed:', err.response?.data || err.message);
            res.status(500).send('Token exchange failed.');
        }
    });

    // Route to handle refresh token grant (Refresh Token URL)
    app.post('/refresh_token', async (req, res) => {
        const { refresh_token } = req.body;

        logger.info('→ /refresh_token request received:', req.body);

        if (!refresh_token) {
            return res.status(400).json({ error: 'Missing refresh_token' });
        }

        // Prepare the refresh token request to Cognito
        const tokenParams = new URLSearchParams();
        tokenParams.append('grant_type', 'refresh_token');
        tokenParams.append('client_id', CLIENT_ID);
        tokenParams.append('refresh_token', refresh_token);

        try {
            // Make the token request to Cognito's /token endpoint
            const tokenResponse = await axios.post(
                `${COGNITO_BASE_URI}/oauth2/token`,
                tokenParams.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const { access_token, expires_in, refresh_token: new_refresh_token } = tokenResponse.data;

            logger.info('← Refreshed token response:', tokenResponse.data);

            // Return the formatted response
            res.json({
                access_token,
                expires_in,
                refresh_token: new_refresh_token || refresh_token,
                created_at: Math.floor(Date.now() / 1000),
            });
        } catch (err) {
            console.error('Refresh token exchange failed:', err.response?.data || err.message);
            res.status(500).json({ error: 'Token refresh failed.' });
        }
    });
}