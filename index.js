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

const getDealsHtml = (products, settings) => {

  const { affiliateTag, product1, product2, product3 } = settings
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter products based on product1, product2, product3 if defined
  let filteredProducts = [];
  if (product1 || product2 || product3) {
    const idsToMatch = [product1, product2, product3].filter(Boolean);
    filteredProducts = products.filter((p) => idsToMatch.includes(p.productId));
  } else {
    filteredProducts = products.slice(0, 20);
  }

  const productRows = [];
  for (let i = 0; i < filteredProducts.length; i += 4) {
    productRows.push(filteredProducts.slice(i, i + 4));
  }

  const mailHtml = `
        <style>
          /* Reset styles */
          body, table, td, div, p {
            margin: 0;
            padding: 0;
          }

          /* Base styles */
          body {
            background-color: #f3f4f6;
            font-family: Arial, sans-serif;
            width: 100% !important;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }

          /* Container styles */
          .container {
            width: 100%;
            max-width: 100%;
            background-color: #ffffff;
          }

          /* Product row styles */
          .product-row {
            width: 100%;
            display: inline-block;
          }

          /* Column styles */
          .column {
            display: inline-block;
            vertical-align: top;
            width: 25%;
            box-sizing: border-box;
            padding: 8px;
          }

          /* Card styles */
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            background-color: #fff;
            height: 100%;
          }

          .card-content {
            padding: 10px;
          }

          .badge-container {
            min-height: 24px;
            margin-bottom: 4px;
          }

          /* Product image styles */
          .product-img {
            width: 100%;
            height: 250px;
            object-fit: cover;
            display: block;
          }

          /* Deal tag styles */
          .deal-tag {
            position: absolute;
            top: 0;
            right: 0;
            background-color: #3b82f6;
            color: white;
            font-size: 12px;
            padding: 4px 6px;
            border-bottom-left-radius: 8px;
          }

          /* Best seller tag styles */
          .best-seller {
            background-color: gold;
            display: inline-block;
            padding: 2px 6px;
            font-size: 12px;
            border-radius: 4px;
            margin-bottom: 4px;
          }

          /* Button styles */
          .deal-button {
            display: block;
            text-align: center;
            background-color: #6366f1;
            color: white !important;
            padding: 8px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
          }

          /* Responsive styles */
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
            }

            .column {
              width: 100% !important;
              display: block !important;
            }
          }

          @media only screen and (min-width: 601px) and (max-width: 1024px) {
            .column {
              width: 50% !important;
            }
          }

          @media only screen and (min-width: 1025px) {
            .column {
              width: 25% !important;
            }
          }
        </style>
        <div class="container">
          ${productRows
      .map(
        (row) => `
            <div class="product-row" style="font-size: 0;">
              ${row
            .map(
              (product) => `
                <div class="column" style="font-size: 16px;">
                  <div class="card">
                    <div style="position: relative;">
                      <img src="${product.image}" alt="${product.title}" class="product-img">
                      <div class="deal-tag">${product.percentage}% OFF</div>
                    </div>
                    <div class="card-content">
                      <div class="badge-container">
                      ${product.bestSellerRank < 60000
                  ? `<div class="best-seller">BEST SELLER</div>`
                  : ''
                }
                      </div>
                      <p style="font-weight: bold; font-size: 14px; margin: 0 0 4px; color: #000000;">${product.title.length > 60
                  ? product.title.slice(0, 60) + '...'
                  : product.title
                }</p>
                      <p style="margin: 0 0 4px;">
                        <span style="color: red; font-weight: bold;">${product.discountedPrice.toFixed(
                  2
                )}</span>
                        <span style="text-decoration: line-through; color: #888; font-size: 12px;">${product.price.toFixed(
                  2
                )}</span>
                      </p>
                      <p style="font-size: 13px; margin: 0 0 4px;"><span style="font-weight: bold; color: #000000;">⭐ ${product.ratingStars
                }</span> <span style="color: #888;">(${product.ratingCount})</span></p>
                      <p style="font-size: 12px; color: #666;">valid through<br/><strong>${formatDate(
                  product.validTill
                )}</strong></p>
                      <div style="margin-top: 8px;">
                        <a href="${affiliateTag
                  ? product.url.replace('getpoln-20', affiliateTag)
                  : product.url
                }" target="_blank" class="deal-button" style="color: white !important;">Get Deal</a>
                      </div>
                    </div>
                  </div>
                </div>
              `
            )
            .join('')}
            </div>
          `
      )
      .join('')}
        </div>
    `;

  return mailHtml;
};

app.post('/posts/html', async (request, response) => {
  const settings = request.body.settings;

  logger.info(`Received request to getDeals`);

  const products = await getDeals(settings);

  const html = getDealsHtml(products, settings); // Show first 6 products

  response.setHeader('Content-Type', 'application/json');
  response.json({
    code: 200,
    html
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})