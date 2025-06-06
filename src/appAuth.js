import axios from 'axios';
import { config } from './config.js';
import { safeStringify } from './utils.js';
import { encryptState, decryptState } from './crypto.js';

const { CLIENT_ID, COGNITO_BASE_URI, KIT_AUTHORIZATION_URL, KIT_CLIENT_ID, KIT_CLIENT_SECRET, KIT_TOKEN_URL, KIT_USERINFO_URL } = config;

const logger = console

const APP_REDIRECT_URI = `https://pp-juned.vercel.app/app/redirect`;
const APP_OAUTH_URI = `https://pp-juned.vercel.app/app/oauth`;

async function getPolnUserId(code) {
    try {
        const data = {
            client_id: CLIENT_ID,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: APP_REDIRECT_URI
        };

        const response = await axios.post(
            `${COGNITO_BASE_URI}/oauth2/token`,
            data,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        logger.info('→ cognito/token response:', response?.data);

        const accessToken = response.data.access_token;

        // Get Poln user info
        const userInfoResp = await axios.get(`${COGNITO_BASE_URI}/oauth2/userInfo`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const polnUserId = userInfoResp.data.sub; // Or userInfoResp.data.email 

        return polnUserId;
    } catch (error) {
        logger.error('Exception in getPolnUserId:', error.response?.data || error.message);
    }
    return null;
}

export default function appAuth(app) {
    app.get('/app/authorize', (req, res) => {
        logger.info(`→ /app/authorize request received:`, safeStringify(req));

        // Build the Cognito authorization URL
        const authorizationUrl = `${COGNITO_BASE_URI}/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${APP_REDIRECT_URI}`;

        // Redirect to Cognito's OAuth authorization endpoint
        res.redirect(authorizationUrl);
    });

    app.get(
        "/app/redirect", async (req, res) => {
            const { code } = req.query;
            logger.info('→ /app/redirect request received');
            const polnUserId = await getPolnUserId(code);

            // Encrypt before redirecting to Kit
            const cypherRes = encryptState(JSON.stringify({ polnUserId, timestamp: Date.now() }))
            const state = Buffer.from(JSON.stringify(cypherRes)).toString('base64');

            // Redirect to Kit OAuth
            const url = `${KIT_AUTHORIZATION_URL}?client_id=${KIT_CLIENT_ID}&redirect_uri=${APP_OAUTH_URI}&response_type=code&state=${encodeURIComponent(state)}`;

            res.redirect(url);
        }
    );

    app.post('/revoke', async (req, res) => {
        const { client_id, client_secret, token } = req.body;

        logger.info('→ /app/revoke request received:', safeStringify(req));

        res.status(200).send('Revoke request successful');
    });

    app.get('/app/oauth', async (req, res) => {
        const { code, state } = req.query;

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

            // Then, decrypt when Kit redirects back
            const stateData = JSON.parse(decryptState(state));

            logger.info('→ /app/oauth stateData:', safeStringify(stateData));

            response = await axios.post(KIT_TOKEN_URL, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const kitUserResp = await axios.get(KIT_USERINFO_URL, {
                headers: { Authorization: `Bearer ${response.data.access_token}` },
            });

            const kitUserId = kitUserResp.data.user?.email
            const kitPrimaryEmail = kitUserResp.data.account?.primary_email

            logger.info('→ /app/oauth kitUserId:', safeStringify(kitUserResp));
            logger.info('→ /app/oauth kitUserId:', safeStringify({ kitUserId, kitPrimaryEmail }));

        } catch (error) {
            logger.error('Token request failed:', error.response?.data || error.message);
        }

        logger.info('→ /app/oauth response:', response?.data);

        res.redirect('https://app.kit.com/apps/1229/install');
    });
}