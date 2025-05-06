import axios from 'axios';

import express from "express";

const app = express()
const port = 3001

app.use(express.json())

const logger = console

const getUrl = () => {
  // if (process.env.PB_PROFILE === 'local') {
  //   return 'http://localhost:3002/a'
  // } else if (process.env.PB_PROFILE === 'prod') {
  //   return 'https://site-api.getpoln.com'
  // }

  return 'https://qa-site-api.getpoln.com'
}

const getDeals = async (settings) => {
  const { category, search, product1, product2, product3 } = settings;

  let url = `${getUrl()}/crm/deals?categories=Adult+Clothing%2C+Shoes+%26+Accessories&offset=0&limit=10`;

  const idsToMatch = [product1, product2, product3].filter(Boolean);
  if (idsToMatch.length > 0) {
    url = `${getUrl()}/crm/deals?asin=${encodeURIComponent(idsToMatch)}&offset=0&limit=10`;
  } else if (search?.trim()) {
    url = `${getUrl()}/crm/deals?search=${encodeURIComponent(search)}&offset=0&limit=10`;
  } else if (category?.trim()) {
    url = `${getUrl()}/crm/deals?categories=${encodeURIComponent(category)}&offset=0&limit=10`;
  }

  console.log(`Making api call [${url}]`);

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

const getDealsHtml2 = (products, settings) => {
  const {
    affiliateTag,
    titleLine1 = '',
    titleLine2 = '',
    titleFontSize = '18px',
    titleFontColor = '#6366f1',
    titleFontStyle = 'italic',
    titleBackgroundColor = '#c2c2f7',
    productTitleColor = '#6366f1',
    productTitleSize = '14px',
    buttonBackground = '#6366f1',
    buttonStyle = 'solid',
    buttonTextColor,
    cardBackgroundColor = '#f9f9f9',
    maxTitleLength = 40,
  } = settings;

  const isOutline = buttonStyle === 'outline';
  const finalButtonBackground = isOutline ? 'transparent' : buttonBackground;
  const finalButtonBorder = isOutline ? `1px solid ${buttonBackground}` : 'none';
  const finalButtonTextColor = isOutline
      ? (buttonTextColor || buttonBackground)
      : (buttonTextColor || '#ffffff');

  const filteredProducts = products.slice(0, 20);

  const truncate = (text, length) =>
      text.length > length ? text.substring(0, length).trim() + '...' : text;

  const productHtml = [];
  for (let i = 0; i < filteredProducts.length; i += 3) {
    const rowItems = filteredProducts.slice(i, i + 3).map(product => {
      const {
        title = product?.title,
        image = product?.image,
        url
      } = product;

      const link = affiliateTag ? url.replace('getpoln-20', affiliateTag) : url;
      const displayTitle = truncate(title, maxTitleLength);

      return `
        <td class="column" width="33.33%" style="padding: 10px; text-align: center;">
          <div style="background: ${cardBackgroundColor}; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <img src="${image}" alt="${title}" width="280" height="310" style="width: 280px; height: 310px; object-fit: cover; display: block; margin: auto; border-radius: 6px;">
            <p class="product-title" style="max-width: 180px; font-size: ${productTitleSize}; font-weight: bold; margin: 15px auto 10px; color: ${productTitleColor}; word-wrap: break-word; overflow-wrap: break-word;">
              ${displayTitle}
            </p>
            <a href="${link}" style="width: 70%; display: inline-block; padding: 10px 20px; border: ${finalButtonBorder}; background: ${finalButtonBackground}; text-decoration: none; color: ${finalButtonTextColor}; font-weight: bold; border-radius: 5px;">
              SHOP NOW
            </a>
          </div>
        </td>
      `;
    }).join('');

    productHtml.push(`<tr>${rowItems}</tr>`);
  }

  return `
  <body style="Margin:0;padding:0;background-color:#ffffff;font-family:Arial,sans-serif;">
    <table role="presentation" width="80%" border="0" cellspacing="0" cellpadding="0" style="margin: auto;">
      ${
      (titleLine1 || titleLine2) &&
      `<tr>
          <td align="center" style="padding: 20px 10px; background: ${titleBackgroundColor};">
            ${titleLine1 ? `<h2 style="margin: 0; font-size: ${titleFontSize}; color: ${titleFontColor}; font-style: ${titleFontStyle};">${titleLine1}</h2>` : ''}
            ${titleLine2 ? `<h2 style="margin: 0; font-size: ${titleFontSize}; color: ${titleFontColor}; font-style: ${titleFontStyle};">${titleLine2}</h2>` : ''}
          </td>
        </tr>`
  }
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${productHtml.join('')}
          </table>
        </td>
      </tr>
      <br/>
      <tr>
        <td align="center" style="padding: 20px 10px; background: ${titleBackgroundColor};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td style="vertical-align: middle;">
                <span style="font-size: 22px; color: ${titleFontColor};">
                  Powered by
                </span>
              </td>
              <td style="vertical-align: middle;">
                <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1746541456/temp/ajfnbz1ejntpjbkyqfaj.png" alt="Brand Logo" style="width: 130px;height: 35px; display: block;" />
              </td>
            </tr>
          </table>
        </td>
    </tr>
    </table>
  </body>
  `
};


function cleanText(text) {
  return text
    .replace(/^Title:\s*/, '') // remove 'Title:'
    .replace(/[^\w\s]/g, '')   // remove special characters (except letters, numbers, spaces)
    .replace(/\s+/g, ' ')      // normalize whitespace
    .trim()
    .split(' ')                       // split into words
    .slice(0, 5)                     // take first 5
    .join(' ');
}

app.post('/categories', async (request, response) => {
  const url = `${getUrl()}/crm/categories`

  const res = await axios.get(url);
  const output = res.data && res.data.data && res.data.data.map(item => {
    return { label: item, value: item };
  })

  return response.json({
    code: 200,
    data: output || []
  })
})

app.post('/search', async (request, response) => {
  const search = request.body.search;

  console.log('Request: ', search);

  if (search === '') {
    return response.json({ code: 200, data: [{ label: 'Creatine Gummies', value: 'gummies' }] });
  }

  const url = `${getUrl()}/crm/searchTerm?search=${encodeURIComponent(search)}`

  const res = await axios.get(url);
  const results = res.data?.data?.splice(0, 5) || []
  results.forEach(r => {
    r.label = cleanText(r.label)
    r.value = cleanText(r.label)
  })
  console.log(`Returning results: [${JSON.stringify(results)}]`)
  return response.json({ code: 200, data: results })
})

app.post('/kit', async (request, response) => {
  const settings = request.body.settings;

  logger.info(`Received request to getDeals with params [${JSON.stringify(settings)}]`);

  const products = await getDeals(settings);

  const html = getDealsHtml2(products, settings); // Show first 6 products

  return response.json({
    code: 200,
    html
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})