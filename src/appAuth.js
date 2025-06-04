import axios from 'axios';
import { config } from './config.js';
import { safeStringify } from './utils.js';

const { CLIENT_ID, COGNITO_BASE_URI, KIT_AUTHORIZATION_URL, KIT_CLIENT_ID, KIT_CLIENT_SECRET, KIT_TOKEN_URL, KIT_REDIRECT_URI } = config;

const logger = console

export default function appAuth(app) {
    app.get('/app/authorize', (req, res) => {
        const { state, redirect } = req.query;

        logger.info(`→ /app/authorize request received:`, req.query);

        // Build the Cognito authorization URL
        const authUrl = `${COGNITO_BASE_URI}/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${KIT_REDIRECT_URI}&kitRedirectUri=${redirect}`;

        // Redirect to Cognito's OAuth authorization endpoint
        res.redirect(authUrl);
    });

    app.get(
        "/app/redirect", (req, res) => {
            const { state, kitRedirectUri } = req.query;
            logger.info('→ /app/redirect request received', req.query);

            const url = `${KIT_AUTHORIZATION_URL}?client_id=${KIT_CLIENT_ID}&redirect_uri=${KIT_REDIRECT_URI}&response_type=code&state=${state}&kitRedirectUri=${kitRedirectUri}`

            res.redirect(url);
        }
    );

    app.get('/app/oauth', async (req, res) => {
        const { code, kitRedirectUri } = req.query;

        logger.info('→ /app/oauth request received:', safeStringify(req));

        const data = {
            client_id: KIT_CLIENT_ID,
            client_secret: KIT_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: KIT_REDIRECT_URI
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

        res.redirect(kitRedirectUri || 'https://app.kit.com/apps/1229/install');
    });
}