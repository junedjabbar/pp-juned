import axios from 'axios';
import { config } from './config.js';
import { safeStringify } from './utils.js';

const { CLIENT_ID, COGNITO_BASE_URI, KIT_AUTHORIZATION_URL, KIT_CLIENT_ID, KIT_CLIENT_SECRET, KIT_TOKEN_URL } = config;

const logger = console

const APP_REDIRECT_URI = `https://pp-juned.vercel.app/app/redirect`;
const APP_OAUTH_URI = `https://pp-juned.vercel.app/app/oauth`;

export default function appAuth(app) {
    app.get('/app/authorize', (req, res) => {
        logger.info(`→ /app/authorize request received:`, safeStringify(req));

        // Build the Cognito authorization URL
        const authorizationUrl = `${COGNITO_BASE_URI}/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${APP_REDIRECT_URI}`;

        // Redirect to Cognito's OAuth authorization endpoint
        res.redirect(authorizationUrl);
    });

    app.get(
        "/app/redirect", (req, res) => {
            const { code } = req.query;
            logger.info('→ /app/redirect request received');

            // TODO: Get this user's information from cognito and send it to poln
            
            const state = Math.random().toString(36).substring(2, 15)

            const url = `${KIT_AUTHORIZATION_URL}?client_id=${KIT_CLIENT_ID}&redirect_uri=${APP_OAUTH_URI}&response_type=code&state=${state}`

            res.redirect(url);
        }
    );

    app.get('/app/oauth', async (req, res) => {
        const { code } = req.query;

        logger.info('→ /app/oauth request received:', safeStringify(req));

        const data = {
            client_id: KIT_CLIENT_ID,
            client_secret: KIT_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: APP_OAUTH_URI
        };

        let response
        try {
            response = await axios.post(KIT_TOKEN_URL, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        } catch (error) {
            logger.error('Token request failed:', error.response?.data || error.message);
        }

        logger.info('→ /app/oauth response:', response?.data);

        res.redirect('https://app.kit.com/apps/1229/install');
    });
}