import axios from 'axios';

import express from "express";

const app = express()
const port = 3001

app.use(express.json())

const logger = console

const getDeals = async (settings) => {
  const { category, search } = settings;
  let url = `https://site-api.getpoln.com/crm/deals?categories=Adult+Clothing%2C+Shoes+%26+Accessories&offset=0&limit=20`;

  if (search) {
    url = `https://site-api.getpoln.com/crm/deals?search=${encodeURIComponent(search)}&offset=0&limit=40`;
  } else if (category) {
    url = `https://site-api.getpoln.com/crm/deals?categories=${encodeURIComponent(category)}&offset=0&limit=40`;
  }

  const res = await axios.get(url);
  return res.data.data;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDealsHtml = (products, settings) => {

  const {
    titleLine1 = 'Our Favorite Mommy and Me',
    titleLine2 = "Matching PJs to Celebrate Mother's Day",
    titleFontSize = '18px',
    titleFontColor = '#6366f1',
    titleFontStyle = 'italic',
    titleBackgroundColor = '#c2c2f7',
    productTitleColor = '#6366f1',
    productTitleSize = '14px',
    buttonBackground = '#6366f1',
    buttonStyle = 'outline',
    buttonTextColor = buttonStyle === 'outline' ? buttonBackground : '#ffffff',
    buttonBorder = buttonStyle === 'outline' ? `1px solid ${buttonBackground}` : 'none',
  } = settings;

  const maxTitleLength = 45;

  const truncate = (text, length) => {
    return text.length > length ? text.substring(0, length).trim() + '...' : text;
  };

  const productHtml = products.slice(0, 3).map(product => {
    const {
      title = 'Product Title',
      image = 'https://via.placeholder.com/180x200',
      link = '#'
    } = product;

    const displayTitle = truncate(title, maxTitleLength);

    return `
      <td class="column" width="33.33%" style="padding: 10px; text-align: center;">
        <img src="${image}" alt="${title}" width="280" height="310" style="width: 280px; height: 310px; object-fit: cover; display: block; margin: auto;">
        <p class="product-title" style="max-width: 180px; font-size: ${productTitleSize}; font-weight: bold; margin: 15px auto 10px; color: ${productTitleColor}; word-wrap: break-word; overflow-wrap: break-word;">
          ${displayTitle}
        </p>
        <a href="${link}" style="width: 70%; display: inline-block; padding: 10px 20px; border: ${buttonBorder}; background: ${buttonStyle === 'outline' ? 'transparent' : buttonBackground}; text-decoration: none; color: ${buttonTextColor}; font-weight: bold;">
          SHOP NOW
        </a>
      </td>
    `;
  }).join('');

  return `
    <body style="Margin:0;padding:0;background-color:#ffffff;font-family:Arial,sans-serif;">

    <table role="presentation" width="80%" border="0" cellspacing="0" cellpadding="0" style="margin: auto;">
      <tr>
        <td align="center" style="padding: 20px 10px; background: ${titleBackgroundColor};">
          <h2 style="margin: 0; font-size: ${titleFontSize}; color: ${titleFontColor}; font-style: ${titleFontStyle};">
            ${titleLine1}
          </h2>
          <h2 style="margin: 0; font-size: ${titleFontSize}; color: ${titleFontColor}; font-style: ${titleFontStyle};">
            ${titleLine2}
          </h2>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${productHtml}
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
    <style>
      /* Responsive Design */
      @media (max-width: 600px) {
        .column {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        .product-title {
          max-width: 100% !important;
        }
      }
    </style>
  `;
};


app.post('/posts/html', async (request, response) => {
  const settings = {
    titleLine1: 'Hello Hekko Hllo',
    titleLine2: 'abcd efg hij k',
    titleFontSize: '20px',
    titleFontColor: '#b505f4',
    productTitleSize: '16px',
    buttonBackground: '#f09822',
    buttonStyle: 'solid'
  };

  logger.info(`Received request to getDeals`);

  const products = await getDeals(settings);

  const html = getDealsHtml(products, settings); // Show first 6 products

  response.json({
    code: 200,
    html
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})