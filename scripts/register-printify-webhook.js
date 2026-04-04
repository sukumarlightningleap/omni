import https from 'https';
import fs from 'fs';

// For node >= 20, --env-file is used, but we'll manually load .env.local just in case they don't pass it
// Support both .env and .env.local
const envFiles = ['.env', '.env.local'].filter(f => fs.existsSync(f));

envFiles.forEach(envFile => {
  console.log(`\x1b[36m[i]\x1b[0m Loading credentials from ${envFile}...`);
  const envContent = fs.readFileSync(envFile, 'utf-8');
  envContent.split('\n').forEach(line => {
    const cleanLine = line.split('#')[0].trim();
    if (!cleanLine) return;

    const match = cleanLine.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
});

if (envFiles.length === 0) {
  console.warn("\x1b[33m[!]\x1b[0m No .env or .env.local file found. Relying on existing environment variables.");
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
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;
  
  // Use the provided URL (live or ngrok) or fallback to a placeholder
  const BASE_URL = process.argv[2];
  if (!BASE_URL || BASE_URL.includes("your-vercel-domain")) {
    console.error("\x1b[41m\x1b[37m ERROR \x1b[0m Please provide your actual Public URL (e.g., ngrok or Vercel).");
    console.log("Usage: node scripts/register-printify-webhook.js https://your-public-url.com");
    process.exit(1);
  }

  const targetUrl = `${BASE_URL.replace(/\/$/, '')}/api/webhooks/printify`;

  if (!shopId || !token) {
    console.error("\x1b[41m\x1b[37m ERROR \x1b[0m Missing Printify credentials.");
    console.log(`Checked: PRINTIFY_SHOP_ID: ${shopId ? 'FOUND' : 'MISSING'}`);
    console.log(`Checked: PRINTIFY_API_TOKEN: ${token ? 'FOUND' : 'MISSING'}`);
    console.log("\nMake sure your .env file contains:");
    console.log("PRINTIFY_SHOP_ID=your_id");
    console.log("PRINTIFY_API_TOKEN=your_token");
    process.exit(1);
  }

  console.log(`\x1b[34m[v]\x1b[0m Target Endpoint: ${targetUrl}`);

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
      (w) => w.url === targetUrl && (w.topic === "product:publish:finished" || w.topic === "product:published")
    );

    if (duplicate) {
      console.log(`\x1b[42m\x1b[30m SUCCESS \x1b[0m Webhook is already registered and active!`);
      console.log(`          URL: ${targetUrl}\n`);
      return;
    }

    console.log(`\x1b[36m[i]\x1b[0m Registering new webhook...`);
    const payload = JSON.stringify({
      topic: "product:publish:finished",
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
      console.error(`\x1b[41m\x1b[37m ERROR \x1b[0m Failed to create webhook. Status: ${postRes.statusCode}`);
      console.error(`RESPONSE: ${postRes.data}`);
      process.exit(1);
    }

  } catch (err) {
    console.error(`\x1b[41m\x1b[37m FATAL \x1b[0m Failed to register webhook.`);
    console.error(err);
  }
}

registerWebhook();
