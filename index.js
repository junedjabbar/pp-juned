import axios from 'axios';

import express from "express";

const app = express()
const port = 3001

app.use(express.json())

const logger = console

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

function getUrl() {
  // if (process.env.PB_PROFILE === 'local') {
  //   return 'http://localhost:3002/a'
  // }
  return 'https://api.getpoln.com'
}

const data = [
  {
    "May Electronics & Smart Tech": [
      {
        "path": "|172282|493964|10048700011|7939901011|",
        "productId": "B0CSSQZ5K4",
        "actualProductId": "B0CSSQZ5K4",
        "title": "Smart Watch Large Display, Compatible with Android 6.0+/ iOS 9.0+, Smart Watches for Women with Clear Bluetooth Calls, Health/Sleep/Fitness Tracker Watch, Waterproof Smart Watches for Men (Black)",
        "description": "The WNH smart watch is a versatile and advanced wearable device that offers an array of features to enhance your daily life. Designed for both men and women, this smart watch effortlessly combines style with functionality. As a health & fitness tracker, the WNH smart watch helps you stay on top of your health goals by monitoring your heart rate, tracking your steps, and calculating calories burned throughout the day. Whether you're hitting the gym or going for a jog, this smartwatch is the perfect companion to keep you motivated and help you achieve optimal performance. With its seamless compatibility with both Android phones and iPhones, this smart watch ensures that you stay connected to your digital world at all times. Receive notifications, calls, and messages directly on your wrist, making it convenient to stay updated without grabbing your phone constantly. The WNH smart watch boasts a user-friendly interface that allows you to easily navigate through its various functions. Equipped with Bluetooth 5.3 chip, this device lets you control music playback, and your camera on your phone, and even find your phone when it's misplaced. Whether you're a tech-savvy individual or simply someone who appreciates the convenience of a smart watch, the WNH smart watch is the perfect companion for your everyday life. With its sleek design and impressive range of features, it has become a must-have item for anyone seeking a stylish and functional smartwatch. Upgrade your lifestyle with the WNH smart watch today. Non-medical use.",
        "image": "https://m.media-amazon.com/images/I/715YuGFJt2L.__AC_SX300_SY300_QL70_ML2_.jpg",
        "promoCode": "A2N2EJ9UPWM9JQ",
        "bestSellerRank": 101965,
        "discountedPrice": 44.99,
        "price": 59.99,
        "productUrl": "https://www.amazon.com/dp/B0CSSQZ5K4?tag=getpoln-20",
        "url": "https://www.amazon.com/promocode/A2N2EJ9UPWM9JQ?linkCode=pf4&linkId=z7b5638deb81af5805803e8dc94cfdez&_encoding=UTF-8&ref_=assoc_tag_ph_1524305840367&tag=getpoln-20&creative=9325&camp=1789",
        "percentage": 25,
        "startedOn": "2025-04-17T04:00:00.000Z",
        "validTill": "2025-05-15T23:59:00.000Z",
        "ratingStars": 4,
        "ratingCount": 370,
        "rn": 1,
        "totalCount": 82
      },
      {
        "path": "|172282|493964|172623|689637011|7073956011|",
        "productId": "B0DKW41TPZ",
        "actualProductId": "B0DKW41TPZ",
        "title": "Retro Bluetooth Speaker Retro Radio with 5.4 Bluetooth Version, FM Radio, Bass Vintage Wireless Speaker Support USB/TF/AUX Player for Home Office Room Bedroom, Decorations",
        "description": "Retro Bluetooth Speaker Retro Radio with 5.4 Bluetooth Version, FM Radio, Bass Vintage Wireless Speaker Support USB/TF/AUX Player for Home Office Room Bedroom, Decorations",
        "image": "https://m.media-amazon.com/images/I/71ZjLqmGYHL.__AC_SX300_SY300_QL70_ML2_.jpg",
        "promoCode": "A3HE4AUSLJ3P6Z",
        "bestSellerRank": 678,
        "discountedPrice": 22.39,
        "price": 31.99,
        "productUrl": "https://www.amazon.com/dp/B0DKW41TPZ?tag=getpoln-20",
        "url": "https://www.amazon.com/promocode/A3HE4AUSLJ3P6Z?linkCode=pf4&linkId=z7b5638deb81af5805803e8dc94cfdez&_encoding=UTF-8&ref_=assoc_tag_ph_1524305836474&tag=getpoln-20&creative=9325&camp=1789",
        "percentage": 30,
        "startedOn": "2025-04-17T03:00:00.000Z",
        "validTill": "2025-05-15T23:59:00.000Z",
        "ratingStars": 4.5,
        "ratingCount": 43,
        "rn": 1,
        "totalCount": 82
      },
      {
        "path": "|172282|493964|24046923011|172541|12097479011|",
        "productId": "B0DL5DM8MD",
        "actualProductId": "B0DJX43743",
        "title": "Bluetooth Headphones, Foldable Wireless Over-Ear Headphones with Hidden Mic for Cell Phone, Laptop, PC, Suitable for Music, School, Workouts, and Gaming (White)",
        "description": "Bluetooth Headphones, Foldable Wireless Over-Ear Headphones with Hidden Mic for Cell Phone, Laptop, PC, Suitable for Music, School, Workouts, and Gaming (White)",
        "image": "https://m.media-amazon.com/images/I/71ippJ9TE1L.__AC_SX300_SY300_QL70_FMwebp_.jpg",
        "promoCode": "AGJA62OJLIIVC",
        "bestSellerRank": 199307,
        "discountedPrice": 39.98,
        "price": 79.96,
        "productUrl": "https://www.amazon.com/dp/B0DJX43743?tag=getpoln-20",
        "url": "https://www.amazon.com/promocode/AGJA62OJLIIVC?linkCode=pf4&linkId=z7b5638deb81af5805803e8dc94cfdez&_encoding=UTF-8&ref_=assoc_tag_ph_1524305945901&tag=getpoln-20&creative=9325&camp=1789",
        "percentage": 50,
        "startedOn": "2025-04-20T13:00:00.000Z",
        "validTill": "2025-05-11T23:59:00.000Z",
        "ratingStars": 5,
        "ratingCount": 1,
        "rn": 1,
        "totalCount": 82
      }
    ]
  },
  {
    "May Beauty & Skincare": [
      {
        "path": "|3760911|11055981|11058281|11058331|10312668011|",
        "productId": "B0DHZKPPPC",
        "actualProductId": "B0DHZKPPPC",
        "title": "Eyelash Serum, Premium Eyelash Growth Serum for Longer, Thicker, Fuller Lashes, Rapid Eyelash Growth Serum for Natural Lashes and Eyebrows, 5ml",
        "description": "Premium Eyelash Growth Serum for Longer, Thicker, Fuller Lashes",
        "image": "https://m.media-amazon.com/images/I/4101bOdPlGL._SX300_SY300_QL70_ML2_.jpg",
        "promoCode": "A95SN6C8JE9F8",
        "bestSellerRank": 1196824,
        "discountedPrice": 5,
        "price": 9.99,
        "productUrl": "https://www.amazon.com/dp/B0DHZKPPPC?tag=getpoln-20",
        "url": "https://www.amazon.com/promocode/A95SN6C8JE9F8?linkCode=pf4&linkId=z7b5638deb81af5805803e8dc94cfdez&_encoding=UTF-8&ref_=assoc_tag_ph_1524305945605&tag=getpoln-20&creative=9325&camp=1789",
        "percentage": 50,
        "startedOn": "2025-04-20T13:00:00.000Z",
        "validTill": "2025-05-17T23:59:00.000Z",
        "ratingStars": 3.5,
        "ratingCount": 10,
        "rn": 1,
        "totalCount": 91
      },
      {
        "path": "|3760911|11055981|11058281|11058331|11058451|",
        "productId": "B0D5LX6HNH",
        "actualProductId": "B0D5LT216Z",
        "title": "Eyebrow Stencil Kit, One Step Brow Powder Stamp Makeup with 12 Reusable Eyebrow Stencils＆1 liquid concealer, Professional Waterproof Brow Powder Stamp (#2 Natural brown)",
        "description": "Easy to use Designed for beginners, no skills required, you will get the perfect eyebrow look effortlessly",
        "image": "https://m.media-amazon.com/images/I/51cUyCmd0qL._SX300_SY300_QL70_FMwebp_.jpg",
        "promoCode": "A3JT1PUCEV7VMB",
        "bestSellerRank": 862654,
        "discountedPrice": 5,
        "price": 9.99,
        "productUrl": "https://www.amazon.com/dp/B0D5LT216Z?tag=getpoln-20",
        "url": "https://www.amazon.com/promocode/A3JT1PUCEV7VMB?linkCode=pf4&linkId=z7b5638deb81af5805803e8dc94cfdez&_encoding=UTF-8&ref_=assoc_tag_ph_1524305696973&tag=getpoln-20&creative=9325&camp=1789",
        "percentage": 50,
        "startedOn": "2025-04-14T04:00:00.000Z",
        "validTill": "2025-05-13T23:59:00.000Z",
        "ratingStars": 0,
        "ratingCount": 0,
        "rn": 1,
        "totalCount": 91
      }
    ]
  },
  {
    "Summer Clothing": [
      {
        "path": "|7141123011|7141124011|7147440011|1040660|1045024|2346727011|",
        "productId": "B0DPM5LM5Y",
        "actualProductId": "B0CSJRK3G2",
        "title": "VOBCTY Women's Casual Short Sleeve Tshirt Dress Summer Side Split Loose V Neck Dresses",
        "description": "VOBCTY Women's Casual Short Sleeve Tshirt Dress Summer Side Split Loose V Neck Dresses",
        "image": "https://m.media-amazon.com/images/I/51ZD0HDp16L.__AC_SY445_SX342_QL70_FMwebp_.jpg",
        "promoCode": "A2G9L5C424IQJS",
        "bestSellerRank": 26060,
        "discountedPrice": 10.19,
        "price": 16.99,
        "productUrl": "https://www.amazon.com/dp/B0CSJRK3G2?tag=getpoln-20",
        "url": "https://www.amazon.com/promocode/A2G9L5C424IQJS?linkCode=pf4&linkId=z7b5638deb81af5805803e8dc94cfdez&_encoding=UTF-8&ref_=assoc_tag_ph_1524305524540&tag=getpoln-20&creative=9325&camp=1789",
        "percentage": 40,
        "startedOn": "2025-04-13T00:01:00.000Z",
        "validTill": "2025-05-12T23:59:00.000Z",
        "ratingStars": 4.2,
        "ratingCount": 224,
        "rn": 1,
        "totalCount": 206
      },
      {
        "path": "|7141123011|7141124011|7147440011|1040660|2368343011|1044544|",
        "productId": "B0D6XY274S",
        "actualProductId": "B0D6TWB9J4",
        "title": "Teacher Shirts Women: Tie Dye Teacher Tshirt Funny Teacher Life Shirt Teacher Tee Tops Short Sleeve Teacher Gifts",
        "description": "Teacher Shirts Women: Tie Dye Teacher Tshirt Funny Teacher Life Shirt Teacher Tee Tops Short Sleeve Teacher Gifts",
        "image": "https://m.media-amazon.com/images/I/81fN1pCeC9L.__AC_SY445_SX342_QL70_ML2_.jpg",
        "promoCode": "A30EZ1WJDR40W7",
        "bestSellerRank": 520877,
        "discountedPrice": 10,
        "price": 19.99,
        "productUrl": "https://www.amazon.com/dp/B0D6TWB9J4?tag=getpoln-20",
        "url": "https://www.amazon.com/promocode/A30EZ1WJDR40W7?linkCode=pf4&linkId=z7b5638deb81af5805803e8dc94cfdez&_encoding=UTF-8&ref_=assoc_tag_ph_1524305752244&tag=getpoln-20&creative=9325&camp=1789",
        "percentage": 50,
        "startedOn": "2025-04-15T05:00:00.000Z",
        "validTill": "2025-05-14T23:59:00.000Z",
        "ratingStars": 4.6,
        "ratingCount": 35,
        "rn": 1,
        "totalCount": 206
      },
      {
        "path": "|7141123011|7141124011|7147441011|1040658|2476517011|121177981011|",
        "productId": "B0DNF5B5T1",
        "actualProductId": "B0DNF5B5T1",
        "title": "M MAELREG Mens Button Up Short Sleeve with Pocket Lightweight Casual Beach Summer Tops Wedding Mens Vacation Shirts Blue Indigo",
        "description": "M MAELREG Mens Button Up Short Sleeve with Pocket Lightweight Casual Beach Summer Tops Wedding Mens Vacation Shirts Blue Indigo",
        "image": "https://m.media-amazon.com/images/I/61S+IVatgZL._AC_SX342_SY445_.jpg",
        "promoCode": "AUHIG1E85ZJWV",
        "bestSellerRank": null,
        "discountedPrice": 25.17,
        "price": 35.95,
        "productUrl": "https://www.amazon.com/dp/B0DNF5B5T1?tag=getpoln-20",
        "url": "https://www.amazon.com/promocode/AUHIG1E85ZJWV?linkCode=pf4&linkId=z7b5638deb81af5805803e8dc94cfdez&_encoding=UTF-8&ref_=assoc_tag_ph_1524305832724&tag=getpoln-20&creative=9325&camp=1789",
        "percentage": 30,
        "startedOn": "2025-04-17T03:00:00.000Z",
        "validTill": "2025-05-16T23:59:00.000Z",
        "ratingStars": 3,
        "ratingCount": 1,
        "rn": 1,
        "totalCount": 206
      }
    ]
  }
]

const executeApiCall = async (token, url) => {
  const finalUrl = `${getUrl()}${url}`
  const res = await axios.get(finalUrl, {
    headers: {
      'Authorization': token
    },
  });


  return res.data
}

const getDealsHtml2 = (products, settings) => {
  const {
    affiliateTag,
    titleLine1 = '',
    titleLine2 = '',
    titleFontSize = '18px',
    titleFontColor = '#000000',
    titleFontStyle = 'italic',
    titleBackgroundColor = '#c2c2f7',
    productTitleColor = '#6366f1',
    productTitleSize = '14px',
    buttonBackground = '#6366f1',
    buttonStyle = 'solid',
    buttonTextColor,
    cardBackgroundColor = '#ffffff',
    maxTitleLength = 40,
    discountColor = 'red',
    discountFontSize = '14px',
    imageBackgroundColor = '',
    headerFontFamily = 'Arial, sans-serif',
    descriptionFontFamily = 'Arial, sans-serif',
    discountFontFamily = 'Arial, sans-serif',
    buttonFontFamily = 'Arial, sans-serif',
    buttonText = 'SHOP NOW'
  } = settings;

  const isOutline = buttonStyle === 'outline';
  const finalButtonBackground = isOutline ? 'transparent' : buttonBackground;
  const finalButtonBorder = isOutline ? `1px solid ${buttonBackground}` : 'none';
  const finalButtonTextColor = isOutline
    ? (buttonTextColor || buttonBackground)
    : (buttonTextColor || '#ffffff');

  const truncate = (text, fontSizePx = 14, containerWidthPx = 180, lines = 2) => {
    const avgCharWidth = fontSizePx * 0.5; // Approximate average char width in px
    const maxChars = Math.floor((containerWidthPx / avgCharWidth) * lines);
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars - 3).trim() + '...';
  };

  const filteredProducts = products.slice(0, 9); // Max 3x3

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
      const displayTitle = truncate(title, parseInt(productTitleSize), 180, 2);

      return `
        <td width="33.33%" style="padding: 10px; text-align: center;">
          <div style="background: ${cardBackgroundColor}; padding: 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); position: relative;">
            <div style="position: relative; background: ${imageBackgroundColor || 'transparent'}; border-radius: 4px;">
              <img src="${image}" alt="${title}" class="datadyno-img" />
              <div style="position: absolute; top: 8px; right: 8px; background: ${discountColor}; color: white; font-size: ${discountFontSize}; font-family: ${discountFontFamily}; padding: 2px 6px; border-radius: 3px; font-weight: bold;">
                ${percentageOff}% OFF
              </div>
            </div>
            <p style="font-size: ${productTitleSize}; color: ${productTitleColor}; font-weight: bold; font-family: ${descriptionFontFamily}; margin: 12px auto 8px; max-width: 180px; word-wrap: break-word;">
              ${displayTitle}
            </p>
            <a href="${link}" style="
                font-family: ${buttonFontFamily};
                display: inline-block;
                padding: 4px 10px;          /* smaller padding */
                border: ${finalButtonBorder};
                background: ${finalButtonBackground};
                text-decoration: none;
                color: ${finalButtonTextColor};
                font-weight: bold;
                border-radius: 5px;
                font-size: 12px;            /* smaller font size */
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
  <body style="Margin:0;padding:0;background-color:#ffffff;font-family:${headerFontFamily};">
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
      ${(titleLine1 || titleLine2) &&
    `<tr>
        <td align="center" style="padding: 20px 10px; background: ${titleBackgroundColor};">
          ${titleLine1 ? `<h2 style="margin: 0; font-size: ${titleFontSize}; color: ${titleFontColor}; font-style: ${titleFontStyle}; font-family: ${headerFontFamily};">${titleLine1}</h2>` : ''}
          ${titleLine2 ? `<h2 style="margin: 0; font-size: ${titleFontSize}; color: ${titleFontColor}; font-style: ${titleFontStyle}; font-family: ${headerFontFamily};">${titleLine2}</h2>` : ''}
        </td>
      </tr>`
    }
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
                <span style="font-size: 18px; color: ${titleFontColor}; font-family: ${headerFontFamily};">
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

app.post('/dealslist', async (request, response) => {
  const { key, search } = request.body;

  console.log(`Request received for dealslist: [${safeStringify(request)}]`)

  const authHeader = request.headers;

  console.log(`AuthHeader is: ${JSON.stringify(authHeader)}`)

  console.log(`Raw Header is: ${request.rawHeaders}`)

  const apiResponse = await executeApiCall(key, '/creator/lists')

  const output = []

  if (apiResponse.lists && apiResponse.lists.length) {
    apiResponse.lists.forEach(i => {
      output.push({ label: i.listName, value: i.listName })
    })
  }

  return response.json({ code: 200, data: output })
})

app.post('/deals', async (request, response) => {
  const settings = request.body.settings;

  logger.info(`Received request to getDeals with params [${JSON.stringify(settings)}]`);

  const { list, key } = settings;

  const url = `/creator/lists/${list}`

  const apiResponse = await executeApiCall(key, url)

  const dealProducts = apiResponse.products
  // data.find(d => d[list])[list]

  // const products = await getDeals(settings);

  const html = getDealsHtml2(dealProducts, settings); // Show first 6 products

  return response.json({
    code: 200,
    html
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})