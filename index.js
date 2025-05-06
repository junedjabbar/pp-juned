import axios from 'axios';

import express from "express";

const app = express()
const port = 3001

app.use(express.json())

const logger = console

const getUrl = () => {
  if (process.env.PB_PROFILE === 'local') {
    return 'http://localhost:3002/a'
  } else if (process.env.PB_PROFILE === 'prod') {
    return 'https://site-api.getpoln.com'
  }
  
  return 'https://qa-site-api.getpoln.com'
}

const getDeals = async (settings) => {
  const { category, search, product1, product2, product3 } = settings;
  let url = `${getUrl()}/crm/deals?categories=Adult+Clothing%2C+Shoes+%26+Accessories&offset=0&limit=40`;

  if (search) {
    url = `${getUrl()}/crm/deals?search=${encodeURIComponent(search)}&offset=0&limit=40`;
  } else if (category) {
    url = `${getUrl()}/crm/deals?categories=${encodeURIComponent(category)}&offset=0&limit=40`;
  } else if (product1 || product2 || product3) {
    const idsToMatch = [product1, product2, product3].filter(Boolean);
    url = `${getUrl()}/crm/deals?asin=${encodeURIComponent(idsToMatch)}`;
  }

  const res = await axios.get(url);

  if (product1 || product2 || product3) {
    return res.data
  }

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

function safeStringify(obj) {
  const seen = new Set();
  return JSON.stringify(obj, (key, value) => {
    // Prevent circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }, 2); // The `2` is for pretty-printing with indentation
}

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
  const output = {
    data: res.data && res.data.data && res.data.data.map(item => {
        return { label: item, value: item };
    })
};
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

  logger.info(`Received request to getDeals`);

  const products = await getDeals(settings);

  const html = getDealsHtml(products, settings); // Show first 6 products

  return response.json({
    code: 200,
    html
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})