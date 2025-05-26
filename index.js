import axios from 'axios';
import express from "express";

const app = express()
const port = 3001

app.use(express.json())

const logger = console

// Cognito Configuration
const CLIENT_ID = '3b3l42tko1ub7vig2nd3cmrvs';  // Replace with your actual client ID
// const CLIENT_SECRET = '12s0pl46lp4cpkgojapmsvt24urp2r2rh0rulrjp41jb6kh3g76c';  // Replace with your actual client secret
const COGNITO_DOMAIN = 'auth.getpoln.com';  // Replace with your actual Cognito domain
const COGNITO_BASE_URI = `https://${COGNITO_DOMAIN}`;
const REDIRECT_URI = 'https://app.kit.com/apps/install';  // Kit's redirect URI

function safeStringify(obj) {
  const seen = new Set()
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]'
      }
      seen.add(value)
    }

    return value
  }, 3)
}

// Route to handle the OAuth authorization request
app.get('/authorize', (req, res) => {
  const { client_id, redirect_uri, response_type, state } = req.query;

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

const getDealsHtml = (products, settings, tagStyles = {}) => {
  const {
    affiliateTag,
    titleLine1 = '',
    titleBackgroundColor = '#c2c2f7',
    buttonText = 'SHOP NOW',
    buttonStyle = 'solid',
    buttonBackground = '#6366f1',
    buttonTextColor,
    cardBackgroundColor = '#ffffff',
    discountColor = 'red',
    imageBackgroundColor = '',
    bodyBackgroundColor = '#ffffff',
  } = settings;

  // Only extract font-family as inline style string, if it exists
  const fontFamilyStyle = styleObj => {
    if (styleObj && styleObj.fontFamily) {
      return `font-family: ${styleObj.fontFamily}`;
    }
    return '';
  };

  const productTitleStyles = (styleObj) => {
    const keysToKeep = ['fontFamily', 'color'];
    return Object.entries(styleObj || {})
      .filter(([key]) => keysToKeep.includes(key))
      .map(([key, value]) => {
        // fontSize is a number, convert to px
        if (key === 'fontSize' && typeof value === 'number') {
          return `font-size: ${value}px`;
        }
        // fontWeight can be number or string, just return as-is
        // fontFamily and color are strings
        // Convert camelCase to kebab-case for CSS
        const cssKey = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  };

  const extractSelectedStyles = (styleObj) => {
    const keysToKeep = ['fontFamily', 'fontSize', 'color', 'fontWeight'];
    return Object.entries(styleObj || {})
      .filter(([key]) => keysToKeep.includes(key))
      .map(([key, value]) => {
        // fontSize is a number, convert to px
        if (key === 'fontSize' && typeof value === 'number') {
          return `font-size: ${value}px`;
        }
        // fontWeight can be number or string, just return as-is
        // fontFamily and color are strings
        // Convert camelCase to kebab-case for CSS
        const cssKey = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  };

  const pStyle = fontFamilyStyle(tagStyles.p);
  const h2Style = fontFamilyStyle(tagStyles.h2);
  const aStyle = fontFamilyStyle(tagStyles.a);
  const h4Style = extractSelectedStyles(tagStyles.h4);
  const pTitleSyle = productTitleStyles(tagStyles.p)

  const isOutline = buttonStyle === 'outline';
  const finalButtonBackground = isOutline ? 'transparent' : buttonBackground;
  const finalButtonBorder = isOutline ? `1px solid ${buttonBackground}` : 'none';
  const finalButtonTextColor = isOutline
    ? (buttonTextColor || buttonBackground)
    : (buttonTextColor || '#ffffff');

  const truncate = (text, fontSizePx = 14, containerWidthPx = 180, lines = 2) => {
    const avgCharWidth = fontSizePx * 0.5;
    const maxChars = Math.floor((containerWidthPx / avgCharWidth) * lines);
    if (text.length <= maxChars) return text;
    const toReturn = text.substring(0, maxChars - 3).trim() + '...'
    return toReturn.trim();
  };

  const filteredProducts = products.slice(0, 9);
  const rows = [];
  for (let i = 0; i < filteredProducts.length; i += 3) {
    const rowItems = filteredProducts.slice(i, i + 3).map(product => {

      const {
        title = product?.title,
        image = product?.image,
        percentageOff = product?.percentage,
        url,
      } = product;

      const link = affiliateTag ? url.replace('getpoln-20', affiliateTag) : url;
      const displayTitle = truncate(title, 10, 80, 2);

      return `
        <td width="33.33%" style="padding: 10px; text-align: center;">
          <div style="background: ${cardBackgroundColor}; padding: 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); position: relative;">
            <div style="position: relative; background: ${imageBackgroundColor || 'transparent'}; border-radius: 4px;">
              <img src="${image}" alt="${title}" class="datadyno-img" />
              <div style="position: absolute; top: 8px; right: 8px; background: ${discountColor}; color: white; font-size: 14px; font-weight: bold; padding: 2px 6px; border-radius: 3px;">
                ${percentageOff}% OFF
              </div>
            </div>
            <p style="${pTitleSyle}; margin: 12px auto 8px; max-width: 180px; word-wrap: break-word;">
              ${displayTitle}
            </p>
            <a href="${link}" style="${aStyle}; display: inline-block; padding: 4px 10px; border: ${finalButtonBorder}; background: ${finalButtonBackground}; color: ${finalButtonTextColor}; border-radius: 5px; text-decoration: none;">
              ${buttonText}
            </a>
          </div>
        </td>
      `;
    }).join('');

    const columnCount = filteredProducts.slice(i, i + 3).length;
    const totalColumns = 3;
    const emptyCells = totalColumns - columnCount;
    const emptyHtml = '<td width="33.33%"></td>'.repeat(Math.floor(emptyCells / 2));

    rows.push(`<tr>${emptyHtml}${rowItems}${emptyHtml}</tr>`);
  }

  return `
  <body style="Margin:0;padding:0;background-color:${bodyBackgroundColor};">
    <style>
      img.datadyno-img {
        width: 119px !important;
        height: 122px !important;
        display: block !important;
        margin: 0 auto !important;
        object-fit: contain !important;
        border-radius: 6px !important;
        background-color: #fff !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
      }
    </style>
    <table role="presentation" width="90%" border="0" cellspacing="0" cellpadding="0" style="margin: auto;">
      ${titleLine1 && `<tr>
        <td align="center" style="padding: 20px 10px; background: ${titleBackgroundColor};">
          <h4 style="${h4Style}">${titleLine1}</h4>
        </td>
      </tr>`}
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rows.join('')}
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 30px 10px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: auto;">
            <tr>
              <td style="vertical-align: middle; padding-right: 10px;">
                <span style="font-size: 18px;">
                  Powered by
                </span>
              </td>
              <td style="vertical-align: middle;">
                <a href="https://datadyno.co/user/deals" target="_blank" style="display: inline-block; text-decoration: none;">
                  <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1747049158/temp/hff1b0ossms0dvgofjkz.png" alt="Brand Logo" style="width: 130px; height: 35px; display: block; border: 0;" />
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  `;
};

const getDealsHtml2 = (products, settings, tagStyles = {}) => {
  const {
    affiliateTag,
    titleLine1 = '',
    titleBackgroundColor = '#232f3e',
    buttonText = 'SHOP NOW',
    buttonStyle = 'solid',
    buttonBackground = '#ffd814', // Amazon Yellow
    buttonTextColor,
    cardBackgroundColor = '#ffffff',
    discountColor = '#cc0c39',
    imageBackgroundColor = '#ffffff',
    bodyBackgroundColor = '#eaeded',
  } = settings;

  const fontFamilyStyle = styleObj =>
      styleObj?.fontFamily
          ? `font-family: ${styleObj.fontFamily}`
          : 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  const extractSelectedStyles = styleObj => {
    const keysToKeep = ['fontFamily', 'fontSize', 'color', 'fontWeight'];
    return Object.entries(styleObj || {})
        .filter(([key]) => keysToKeep.includes(key))
        .map(([key, value]) => {
          if (key === 'fontSize' && typeof value === 'number') return `font-size: ${value}px`;
          const cssKey = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
          return `${cssKey}: ${value}`;
        })
        .join('; ');
  };

  const pStyle = fontFamilyStyle(tagStyles.p);
  const aStyle = fontFamilyStyle(tagStyles.a);
  const h4Style = extractSelectedStyles(tagStyles.h4);

  const isOutline = buttonStyle === 'outline';
  const finalButtonBackground = isOutline ? 'transparent' : buttonBackground;
  const finalButtonBorder = isOutline ? `2px solid ${buttonBackground}` : 'none';
  const finalButtonTextColor = isOutline
      ? (buttonTextColor || buttonBackground)
      : (buttonTextColor || '#0f1111');

  const truncate = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substring(0, maxLength - 3).trim() + '...';
  };

  const filteredProducts = products.slice(0, 9);

  const productRows = filteredProducts.map(product => {
    const {
      title = '',
      image,
      percentageOff,
      url,
      price,
      originalPrice,
    } = product;

    const link = affiliateTag ? url.replace('getpoln-20', affiliateTag) : url;
    const displayTitle = truncate(title, 100);

    const titleCommonStyles = `${pStyle}; font-size: 16px; font-weight: 500; color: #0f1111; margin: 0 0 8px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;`;

    return `
      <tr>
        <td style="padding: 0 0 20px 0;">
          <!-- Desktop Layout -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="desktop-table" style="background: ${cardBackgroundColor}; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #d5dbdb;">
            <tr>
              <td width="200" style="padding: 20px; vertical-align: middle; text-align: center; background: #f7f8f8; border-right: 1px solid #e7e7e7;">
                <div style="background: ${imageBackgroundColor}; padding: 15px; border-radius: 4px; border: 1px solid #e7e7e7;">
                  <img src="${image}" alt="${title}" class="product-img" style="width: 140px; height: 140px; object-fit: contain; display: block; margin: 0 auto;" />
                </div>
              </td>
              <td style="padding: 20px; vertical-align: middle; position: relative;">
                <div style="position: absolute; top: 15px; right: 15px; background: ${discountColor}; color: white; font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 3px;">
                  ${percentageOff}% OFF
                </div>
                <h3 style="${titleCommonStyles}">${displayTitle}</h3>
                ${price ? `
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 18px; font-weight: 700; color: #b12704; margin-right: 8px;">${price}</span>
                  ${originalPrice ? `<span style="font-size: 14px; color: #565959; text-decoration: line-through;">${originalPrice}</span>` : ''}
                </div>` : ''}
                <div style="margin-bottom: 15px;">
                  <span style="color: ${discountColor}; font-size: 14px; font-weight: 600;">You Save: ${percentageOff}%</span>
                </div>
                <a href="${link}" style="${aStyle}; display: inline-block; padding: 8px 16px; border: ${finalButtonBorder}; background: ${finalButtonBackground}; color: ${finalButtonTextColor}; border-radius: 3px; text-decoration: none; font-weight: 600; font-size: 13px; cursor: pointer;">
                  ${buttonText}
                </a>
              </td>
            </tr>
          </table>

          <!-- Mobile Layout -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="mobile-table" style="background: ${cardBackgroundColor}; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #d5dbdb; display: none;">
            <tr>
              <td style="padding: 20px; text-align: center; position: relative; background: #f7f8f8; border-bottom: 1px solid #e7e7e7;">
                <div style="position: absolute; top: 10px; right: 10px; background: ${discountColor}; color: white; font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 3px;">
                  ${percentageOff}% OFF
                </div>
                <div style="background: ${imageBackgroundColor}; padding: 15px; border-radius: 4px; border: 1px solid #e7e7e7; display: inline-block;">
                  <img src="${image}" alt="${title}" class="product-img-mobile" style="width: 120px; height: 120px; object-fit: contain; display: block;" />
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center;">
                <h3 style="${titleCommonStyles}">${displayTitle}</h3>
                ${price ? `
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 18px; font-weight: 700; color: #b12704; margin-right: 8px;">${price}</span>
                  ${originalPrice ? `<span style="font-size: 14px; color: #565959; text-decoration: line-through;">${originalPrice}</span>` : ''}
                </div>` : ''}
                <div style="margin-bottom: 15px;">
                  <span style="color: ${discountColor}; font-size: 14px; font-weight: 600;">You Save: ${percentageOff}%</span>
                </div>
                <a href="${link}" style="${aStyle}; display: inline-block; padding: 8px 16px; border: ${finalButtonBorder}; background: ${finalButtonBackground}; color: ${finalButtonTextColor}; border-radius: 3px; text-decoration: none; font-weight: 600; font-size: 13px; cursor: pointer;">
                  ${buttonText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  return `
  <body style="Margin:0;padding:0;background-color:${bodyBackgroundColor};">
    <!--[if mso]>
    <style type="text/css">
      table { border-collapse: collapse; }
      .product-img { width: 140px !important; height: 140px !important; }
    </style>
    <![endif]-->

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0; padding: 20px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; width: 100%; margin: 0 auto; background: transparent;">

            ${titleLine1 ? `
            <tr>
              <td style="padding: 25px 20px; text-align: center; background: ${titleBackgroundColor}; color: white;">
                <h1 style="${h4Style}; font-size: 24px; font-weight: 400; color: white; margin: 0; font-family: 'Amazon Ember', Arial, sans-serif;">
                  ${titleLine1}
                </h1>
                <p style="color: #cccccc; margin: 5px 0 0 0; font-size: 14px; font-family: 'Amazon Ember', Arial, sans-serif;">
                  Great deals, delivered daily
                </p>
              </td>
            </tr>` : ''}

            <tr>
              <td style="padding: 20px; background: white;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  ${productRows}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 20px; text-align: center; background: #232f3e; color: white;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: auto;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 12px;">
                      <span style="font-size: 14px; color: #cccccc; font-weight: 400; font-family: 'Amazon Ember', Arial, sans-serif;">
                        Powered by
                      </span>
                    </td>
                    <td style="vertical-align: middle;">
                      <a href="https://datadyno.co/user/deals" target="_blank" style="display: inline-block; text-decoration: none;">
                        <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1747049158/temp/hff1b0ossms0dvgofjkz.png" alt="DataDyno" style="width: 100px; height: auto; display: block; border: 0;" />
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="color: #999999; font-size: 11px; margin: 12px 0 0 0; line-height: 1.4; font-family: 'Amazon Ember', Arial, sans-serif;">
                  © 2025 DataDyno. All rights reserved.<br>
                  <a href="#" style="color: #999999; text-decoration: none;">Unsubscribe</a> | 
                  <a href="#" style="color: #999999; text-decoration: none;">Privacy Policy</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  `;
};

app.post('/debug/html', async (request, response) => {
  const settings = request.body.settings;
  const styles = request.body.styles;
  const dealProducts = request.body.products

  logger.info(`Request received for dealslist: [${safeStringify(request)}]`)

  const { list } = settings;

  if (list === 'Empty List') {
    const noListHtml = `
      <body style="Margin:0;padding:20px; font-family: Arial, sans-serif; background-color: #ffffff;">
        <h2 style="text-align: center; color: #333333;">
          No deals list selected.
        </h2>
        <p style="text-align: center;">
          Please <a href="https://datadyno.co/creator/deals" target="_blank" style="color: #6366f1; text-decoration: none; font-weight: bold;">click here</a> to create a deals list.
        </p>
      </body>
    `;
    return response.json({
      code: 200,
      html: noListHtml
    });
  }

  if (dealProducts.length === 0) {
    const noProductsHtml = `
      <body style="Margin:0;padding:20px; font-family: Arial, sans-serif; background-color: #ffffff;">
        <h2 style="text-align: center; color: #333333;">
          There are no products in the list.
        </h2>
        <p style="text-align: center;">
          Please <a href="https://datadyno.co/creator/deals" target="_blank" style="color: #6366f1; text-decoration: none; font-weight: bold;">click here</a> to add products to your deals list.
        </p>
      </body>
    `;
    return response.json({
      code: 200,
      html: noProductsHtml
    });
  }

  const html = getDealsHtml2(dealProducts, settings, styles);

  return response.json({
    code: 200,
    html
  });
});

app.post('/html', async (request, response) => {
  const settings = request.body.settings;
  const styles = request.body.styles;
  const dealProducts = request.body.products

  logger.info(`Request received for dealslist: [${safeStringify(request)}]`)

  const { list } = settings;

  if (list === 'Empty List') {
    const noListHtml = `
      <body style="Margin:0;padding:20px; font-family: Arial, sans-serif; background-color: #ffffff;">
        <h2 style="text-align: center; color: #333333;">
          No deals list selected.
        </h2>
        <p style="text-align: center;">
          Please <a href="https://datadyno.co/creator/deals" target="_blank" style="color: #6366f1; text-decoration: none; font-weight: bold;">click here</a> to create a deals list.
        </p>
      </body>
    `;
    return response.json({
      code: 200,
      html: noListHtml
    });
  }

  if (dealProducts.length === 0) {
    const noProductsHtml = `
      <body style="Margin:0;padding:20px; font-family: Arial, sans-serif; background-color: #ffffff;">
        <h2 style="text-align: center; color: #333333;">
          There are no products in the list.
        </h2>
        <p style="text-align: center;">
          Please <a href="https://datadyno.co/creator/deals" target="_blank" style="color: #6366f1; text-decoration: none; font-weight: bold;">click here</a> to add products to your deals list.
        </p>
      </body>
    `;
    return response.json({
      code: 200,
      html: noProductsHtml
    });
  }

  const html = getDealsHtml(dealProducts, settings, styles);

  return response.json({
    code: 200,
    html
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})