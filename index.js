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

  const { affiliateTag, product1, product2, product3 } = settings

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
    productRows.push(...filteredProducts.slice(i, i + 4));
  }

  return `
    <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-family: sans-serif; justify-content: space-between;">
      ${productRows.map(product => `
        <div style="
          flex-basis: calc(25% - 1rem);
          margin-bottom: 1rem;
          border: 1px solid #ddd;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          background: #fff;
          position: relative;
        ">
          <div style="position: relative; width: 100%; padding-top: 100%; overflow: hidden;">
            <img src="${product.image}" alt="${product.title}" style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
            " />
            <div style="
              position: absolute;
              top: 0;
              right: 0;
              background: #3b82f6;
              color: white;
              font-size: 12px;
              padding: 4px 6px;
              border-bottom-left-radius: 8px;
            ">${product.percentage}% OFF</div>
          </div>
          <div style="padding: 0.75rem;">
            ${product.bestSellerRank < 60000 ? `
              <div style="background: gold; display: inline-block; padding: 2px 6px; font-size: 12px; border-radius: 4px; margin-bottom: 4px;">BEST SELLER</div>` : ''}
            <p style="font-weight: bold; font-size: 14px; margin: 0 0 4px;">
              ${product.title.length > 60 ? product.title.slice(0, 60) + '...' : product.title}
            </p>
            <p style="margin: 0 0 4px;">
              <span style="color: red; font-weight: bold;">$${product.discountedPrice.toFixed(2)}</span>
              <span style="text-decoration: line-through; color: #888; font-size: 12px;">$${product.price.toFixed(2)}</span>
            </p>
            <p style="font-size: 13px; margin: 0 0 4px;">⭐ ${product.ratingStars} (${product.ratingCount})</p>
            <p style="font-size: 12px; color: #666;">valid through<br/><strong>${formatDate(product.validTill)}</strong></p>
            <a href="${affiliateTag ? product.url.replace('getpoln-20', affiliateTag) : product.url}" target="_blank" style="
              display: block;
              text-align: center;
              background: #6366f1;
              color: white;
              padding: 6px 0;
              margin-top: 8px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
            ">Get Deal</a>
          </div>
        </div>
      `).join('')}
    </div>
    <style>
      /* Responsive Design */
      @media (max-width: 1200px) {
        .deal-item {
          flex-basis: calc(33.33% - 1rem);
        }
      }
      @media (max-width: 768px) {
        .deal-item {
          flex-basis: calc(50% - 1rem);
        }
      }
      @media (max-width: 480px) {
        .deal-item {
          flex-basis: 100%;
        }
      }
    </style>
  `;
};

app.get('/search', async (request, response) => {
  console.log(JSON.stringify(request.query))

  debugger

  response.json([
    { label: 'Creatine Gummies', value: 'gummies' }
  ]);

  // if (q == '') {
  //   return response.json([
  //     { label: 'Creatine Gummies', value: 'gummies' }
  //   ]);
  // }

  // const url = `https://qa-site-api.getpoln.com/crm/searchTerm?search=${encodeURIComponent(q)}`

  // const res = await axios.get(url);
  // const results = res.data?.data?.splice(0, 5) || []
  // return response.json(results)
})

app.post('/kit', async (request, response) => {
  const settings = request.body.settings;

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