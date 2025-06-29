import express from "express";
import pluginAuth from "./src/pluginAuth.js";
import appAuth from "./src/appAuth.js";
import { safeStringify } from "./src/utils.js";

const app = express()
const port = 3001

app.use(express.json())

const logger = console

pluginAuth(app)
appAuth(app)

const getDealsHtml2 = (products, settings, tagStyles = {}) => {
  const {
    titleLine1 = '',
    titleBackgroundColor = '#131921',
    buttonText = 'SHOP NOW',
    buttonStyle = 'solid',
    buttonBackground = '#ff9900',
    buttonTextColor,
    cardBackgroundColor = '#ffffff',
    discountColor = 'red',
    imageBackgroundColor = '',
    bodyBackgroundColor = '#ffffff',
    creatorSettings
  } = settings;

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
          if (key === 'fontSize' && typeof value === 'number') {
            return `font-size: ${value}px`;
          }
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
          if (key === 'fontSize' && typeof value === 'number') {
            return `font-size: ${value}px`;
          }
          const cssKey = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
          return `${cssKey}: ${value}`;
        })
        .join('; ');
  };

  const pStyle = fontFamilyStyle(tagStyles.p);
  const h2Style = fontFamilyStyle(tagStyles.h2);
  const aStyle = fontFamilyStyle(tagStyles.a);
  const h4Style = extractSelectedStyles(tagStyles.h4);
  const pTitleSyle = productTitleStyles(tagStyles.p);

  const isOutline = buttonStyle === 'outline';
  const finalButtonBackground = isOutline ? 'transparent' : buttonBackground;
  const finalButtonBorder = isOutline ? `1px solid ${buttonBackground}` : 'none';
  const finalButtonTextColor = isOutline
      ? (buttonTextColor || buttonBackground)
      : (buttonTextColor || '#ffffff');

  // 🔧 Updated lines = 3
  const truncate = (text, fontSizePx = 14, containerWidthPx = 180, lines = 3) => {
    const avgCharWidth = fontSizePx * 0.5;
    const maxChars = Math.floor((containerWidthPx / avgCharWidth) * lines);
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars - 3).trim() + '...';
  };

  const filteredProducts = products.slice(0, 9);
  const rows = [];

  const affiliateTag = creatorSettings?.affiliateTagId || settings.affiliateTag

  for (let i = 0; i < filteredProducts.length; i += 3) {
    const rowItems = filteredProducts.slice(i, i + 3).map(product => {
      const {
        title = product?.title,
        image = product?.image,
        percentageOff = product?.percentage,
        url,
      } = product;

      const link = affiliateTag ? url.replace('getpoln-20', affiliateTag) : url;
      const displayTitle = truncate(title, 10, 120, 3); // 🔧 Updated to 3 lines

      return `
        <td width="33.33%" style="padding: 10px; text-align: center; vertical-align: top;">
          <div style="background: ${cardBackgroundColor}; padding: 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); position: relative; height: 330px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="position: relative; background: ${imageBackgroundColor || 'transparent'}; border-radius: 4px;">
              <img src="${image}" alt="${title}" class="datadyno-img" />
              <div style="position: absolute; top: 8px; right: 8px; background: ${discountColor}; color: white; font-size: 14px; font-weight: bold; padding: 2px 6px; border-radius: 3px;">
                ${percentageOff}% OFF
              </div>
            </div>
            <p style="${pTitleSyle}; margin: 12px auto 8px; max-width: 180px; 
              overflow: hidden; 
              text-overflow: ellipsis; 
              display: -webkit-box; 
              -webkit-line-clamp: 3; /* 🔧 Changed from 2 to 3 */
              -webkit-box-orient: vertical; 
              height: 63px; /* 🔧 Changed from 42px to 63px */
              line-height: 21px;
              word-wrap: break-word;
              flex-grow: 0;
            ">
              ${displayTitle}
            </p>
            <a href="${link}" style="${aStyle}; 
              display: inline-flex; 
              align-items: center; 
              justify-content: center;
              height: 40px; 
              min-width: 120px;
              padding: 0 20px; 
              border: ${finalButtonBorder}; 
              background: ${finalButtonBackground}; 
              color: ${finalButtonTextColor}; 
              border-radius: 5px; 
              text-decoration: none; 
              font-weight: bold;
              font-size: 14px;
              margin: 0 auto;
              box-sizing: border-box;
              ">
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
  <div style="Margin:0;padding:0;background-color:${bodyBackgroundColor};">
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
          <h4 style="color: #ffffff; margin: 0;${h4Style.replace(/color:[^;]+;?/, '')}">${titleLine1}</h4>
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
              <td style="vertical-align: middle; padding-right: 10px; font-size: 14px; white-space: nowrap;">
                Powered by
              </td>
              <td style="vertical-align: middle; white-space: nowrap;">
                <a href="https://datadyno.co/user/deals" target="_blank" style="display: inline-block; text-decoration: none;">
                  <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1747049158/temp/hff1b0ossms0dvgofjkz.png" alt="Brand Logo" style="width: 90px; height: 25px; display: block; border: 0;" />
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
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

  const html = getDealsHtml2(dealProducts, settings, styles);

  return response.json({
    code: 200,
    html
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})