export const config = {
    // Cognito Configuration
    CLIENT_ID: '3b3l42tko1ub7vig2nd3cmrvs',  // Replace with your actual client ID
    COGNITO_BASE_URI: `https://auth.getpoln.com`,
    REDIRECT_URI: 'https://app.kit.com/apps/install',  // Kit's redirect URI

    // Kit Configuration
    KIT_CLIENT_ID: "9XRtQii32__TpuC9uVohiF0pAV6yBf9N0qLIL1G_SJc",
    KIT_CLIENT_SECRET: "TCT85ihc0QESitWGFTHsAhAWcxqKuOuvQ1XzuiWsmKo",
    KIT_AUTHORIZATION_URL: `https://app.kit.com/oauth/authorize`,
    KIT_TOKEN_URL: `https://app.kit.com/oauth/token`,
    KIT_CALLBACK_URL: `https://app.kit.com/oauth/kit/callback`,
    KIT_REDIRECT_URI: 'https://pp-juned.vercel.app/app/redirect',
}