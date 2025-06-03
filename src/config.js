export const config = {
    // Cognito Configuration
    CLIENT_ID: '3b3l42tko1ub7vig2nd3cmrvs',  // Replace with your actual client ID
    COGNITO_DOMAIN: 'auth.getpoln.com',  // Replace with your actual Cognito domain
    COGNITO_BASE_URI: `https://${COGNITO_DOMAIN}`,
    REDIRECT_URI: 'https://app.kit.com/apps/install',  // Kit's redirect URI

    // Kit Configuration
    KIT_BASE_URL: "https://app.kit.com",
    KIT_OAUTH_CLIENT_ID: "L8MkRYebdxJBwFbHePBqHGErFtlWuArXnzOpGcSn47g",
    KIT_OAUTH_CLIENT_SECRET: "lXgfjN1K7wROqZ2z_xCz2lUpzLl56hnXaBThokxmVss",
    KIT_OAUTH_AUTHORIZATION_URL: `${KIT_BASE_URL}/oauth/authorize`,
    KIT_OAUTH_TOKEN_URL: `${KIT_BASE_URL}/oauth/token`,
    KIT_OAUTH_CALLBACK_URL: `${KIT_BASE_URL}/oauth/kit/callback`,
}