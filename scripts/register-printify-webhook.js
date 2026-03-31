import https from 'https';
import fs from 'fs';

// For node >= 20, --env-file is used, but we'll manually load .env.local just in case they don't pass it
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: body });
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function registerWebhook() {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN;
  
  const NGROK_URL = process.argv[2] || "[PASTE_YOUR_NGROK_URL_HERE]";
  const targetUrl = `${NGROK_URL}/api/webhooks/printify`;

  if (!shopId || !token) {
    console.error("\x1b[41m\x1b[37m ERROR \x1b[0m Missing Printify credentials in .env.local");
    process.exit(1);
  }

  if (NGROK_URL.includes("PASTE_YOUR_NGROK_URL")) {
    console.error("\x1b[43m\x1b[30m WARNING \x1b[0m Please provide your Ngrok URL as an argument:");
    console.log("          node scripts/register-printify-webhook.js https://your-ngrok-url.ngrok-free.app\n");
    process.exit(1);
  }

  try {
    const getOptions = {
      hostname: 'api.printify.com',
      port: 443,
      path: `/v1/shops/${shopId}/webhooks.json`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log(`\x1b[36m[i]\x1b[0m Checking existing Printify webhooks for Shop: ${shopId}...`);
    const existingRes = await httpsRequest(getOptions);
    
    if (existingRes.statusCode !== 200) {
      throw new Error(`Failed to fetch existing webhooks. status: ${existingRes.statusCode}, msg: ${existingRes.data}`);
    }

    const existingWebhooks = JSON.parse(existingRes.data);

    const duplicate = existingWebhooks.find(
      (w) => w.url === targetUrl && w.topic === "product:published"
    );

    if (duplicate) {
      console.log(`\x1b[42m\x1b[30m SUCCESS \x1b[0m Webhook is already registered and active!`);
      console.log(`          URL: ${targetUrl}\n`);
      return;
    }

    console.log(`\x1b[36m[i]\x1b[0m Registering new webhook...`);
    const payload = JSON.stringify({
      topic: "product:published",
      url: targetUrl
    });

    const postOptions = {
      ...getOptions,
      method: 'POST',
      headers: {
        ...getOptions.headers,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const postRes = await httpsRequest(postOptions, payload);

    if (postRes.statusCode >= 200 && postRes.statusCode < 300) {
      console.log(`\x1b[42m\x1b[30m SUCCESS \x1b[0m Webhook successfully established!`);
      console.log(`          Payloads will be sent to: ${targetUrl}\n`);
    } else {
      throw new Error(`Failed to create webhook: ${postRes.data}`);
    }

  } catch (err) {
    console.error(`\x1b[41m\x1b[37m FATAL \x1b[0m Failed to register webhook.`);
    console.error(err);
  }
}

registerWebhook();
