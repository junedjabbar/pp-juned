import { config } from './config.js';

const { CLIENT_ID, COGNITO_BASE_URI, KIT_AUTHORIZATION_URL, KIT_CLIENT_ID, KIT_CLIENT_SECRET, KIT_TOKEN_URL } = config;

const logger = console

export default function appAuth(app) {
    app.get('/app/authorize', (req, res) => {
        const { state, redirect_uri } = req.query;

        logger.info(`→ /app/authorize request received:`, req.query);

        const redirectUri = `https://pp-juned.vercel.app/app/redirect`;

        // Build the Cognito authorization URL
        const authorizationUrl = `${COGNITO_BASE_URI}/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;

        // Redirect to Cognito's OAuth authorization endpoint
        res.redirect(authorizationUrl);
    });

    app.get(
        "/app/redirect", (req, res) => {
            logger.info('→ /app/redirect request received');

            const redirectUri = 'https://pp-juned.vercel.app/app/oauth';
            const state = Math.random().toString(36).substring(2, 15)

            const url = `${KIT_AUTHORIZATION_URL}?client_id=${KIT_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&state=${state}`

            res.redirect(url);
        }
    );

    app.get('/app/oauth', async (req, res) => {
        const { code } = req.body;

        logger.info('→ /app/oauth request received:', req.body);

        const redirectUri = 'https://pp-juned.vercel.app/app/oauth'

        const url = `${KIT_TOKEN_URL}?client_id=${KIT_CLIENT_ID}&client_secret=${KIT_CLIENT_SECRET}&grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`

        const response = await axios.post(url);

        logger.info('→ /app/oauth response:', response.data);

        res.redirect('https://app.kit.com/apps/1232/install');
    });
}