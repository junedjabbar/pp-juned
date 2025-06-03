import { Strategy as OAuth2Strategy } from "passport-oauth2";

const KIT_BASE_URL = "https://app.kit.com";
const KIT_OAUTH_CLIENT_ID = "L8MkRYebdxJBwFbHePBqHGErFtlWuArXnzOpGcSn47g";
const KIT_OAUTH_CLIENT_SECRET = "lXgfjN1K7wROqZ2z_xCz2lUpzLl56hnXaBThokxmVss";
const KIT_OAUTH_AUTHORIZATION_URL = `${KIT_BASE_URL}/oauth/authorize`;
const KIT_OAUTH_TOKEN_URL = `${KIT_BASE_URL}/oauth/token`;
const KIT_OAUTH_CALLBACK_URL = `${KIT_BASE_URL}/oauth/kit/callback`;

const logger = console

OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.get(
    `${KIT_BASE_URL}/v4/account`,
    accessToken,
    (err, body, res) => {
      if (err) {
        return done(new Error("Failed to fetch user profile"));
      }
      const json = JSON.parse(body);
      done(null, json);
    }
  );
};

const oauthConfiguration = {
  authorizationURL: KIT_OAUTH_AUTHORIZATION_URL,
  tokenURL: KIT_OAUTH_TOKEN_URL,
  clientID: KIT_OAUTH_CLIENT_ID,
  clientSecret: KIT_OAUTH_CLIENT_SECRET,
  callbackURL: KIT_OAUTH_CALLBACK_URL,
};

export default function kitOAuth() {
  return new OAuth2Strategy(
    oauthConfiguration,
    (accessToken, refreshToken, profile, cb) => {
      // Find or create user in database
      const user = {
        kitId: profile.account.id,
        kitAccessToken: accessToken,
        kitRefreshToken: refreshToken,
      };
      logger.info("Authenticated Kit user", { user, profile });
      return cb(null, user);
    }
  );
}

logger.info("Kit OAuth Configuration", oauthConfiguration);