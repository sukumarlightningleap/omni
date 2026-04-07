import { prisma } from "./prisma";

export interface PrintifyProduct {
  _id: string;
  name: string;
  description: string;
  descriptionHtml?: string;
  image: string;
  rawPrice: number;
  slug: string;
  category?: string;
}

/**
 * Fetches all products from the Printify shop and maps them for local synchronization.
 */
export async function fetchPrintifyProducts(page = 1): Promise<PrintifyProduct[] | null> {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;

  if (!shopId || !token) return null;

  try {
    const res = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) return null;

    const data = await res.json();
    
    // Map Printify API structure to the internal sync format
    return data.data.map((p: any) => ({
      _id: p.id,
      name: p.title,
      description: p.description,
      descriptionHtml: p.description, // Printify description is usually HTML-ready
      image: p.images?.[0]?.src || "",
      rawPrice: (p.variants?.[0]?.price || 0) / 100, // Printify prices are in cents
      slug: p.id, // Use ID as slug for consistency with dynamic routes
    }));
  } catch (err) {
    console.error("fetchPrintifyProducts Error:", err);
    return null;
  }
}

/**
 * Fetches single product details from Printify.
 */
export async function fetchPrintifyProductById(productId: string) {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;

  if (!shopId || !token) return null;

  try {
    const res = await fetch(`https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("fetchPrintifyProductById Error:", err);
    return null;
  }
}

/**
 * Automates the handoff from a Prisma Order to the Printify Production Pipeline.
 * 1. Resolves variants and SKUs.
 * 2. Maps shipping details.
 * 3. Pushes to Printify API.
 * 4. Updates Order status to PROCESSING or MANUAL_INTERVENTION_REQUIRED.
 */
export async function createPrintifyOrder(orderId: string) {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;

  if (!shopId || !token) {
    console.error("Printify credentials missing for fulfillment.");
    return { success: false, error: "CREDENTIALS_MISSING" };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } }
      }
    });

    if (!order) return { success: false, error: "ORDER_NOT_FOUND" };

    // Extract address details from the raw string we saved in the webhook
    // Format: "Name | Email | Line1, City, State Zip, Country"
    const [name, email, addressPart] = (order.shippingAddress || "").split(" | ");
    const addressDetails = addressPart?.split(", ") || [];

    const printifyLineItems = await Promise.all(order.items.map(async item => {
      // Re-fetch to ensure we have the latest variant list
      const pRes = await fetch(`https://api.printify.com/v1/shops/${shopId}/products/${item.product.printifyId}.json`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const pData = pRes.ok ? await pRes.json() : null;
      
      return {
        product_id: item.product.printifyId,
        variant_id: pData?.variants?.[0]?.id || 1, // Fallback to first variant
        quantity: item.quantity
      };
    }));

    const printifyPayload = {
      external_id: order.id,
      label: `UNRWLY-${order.id.substring(0,6)}`,
      line_items: printifyLineItems,
      shipping_method: 1, // Standard
      address_to: {
        first_name: name?.split(' ')[0] || "Customer",
        last_name: name?.split(' ').slice(1).join(' ') || "Unrwly",
        email: email || "",
        country: addressDetails[addressDetails.length - 1] || "US",
        region: addressDetails[addressDetails.length - 2]?.split(' ')[0] || "",
        city: addressDetails[addressDetails.length - 3] || "",
        address1: addressDetails[0] || "",
        address2: addressDetails[1] || "",
        zip: addressDetails[addressDetails.length - 2]?.split(' ').slice(1).join(' ') || ""
      }
    };

    const res = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders.json`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(printifyPayload)
    });

    if (res.ok) {
      const pOrder = await res.json();
      await prisma.order.update({
        where: { id: order.id },
        data: {
          printifyOrderId: pOrder.id,
          status: "PROCESSING",
          internalNotes: (order.internalNotes || "") + `\n[SYSTEM]: MONEY: VERIFIED // PRODUCTION: TRIGGERED (ID: ${pOrder.id})`
        }
      });
      return { success: true, printifyOrderId: pOrder.id };
    } else {
      const errBody = await res.text();
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "MANUAL_INTERVENTION_REQUIRED",
          internalNotes: (order.internalNotes || "") + `\n[SYSTEM]: PRODUCTION_FAILURE: ${errBody}`
        }
      });
      return { success: false, error: errBody };
    }
  } catch (err) {
    console.error("Printify Bridge Error:", err);
    return { success: false, error: "NETWORK_FAILURE" };
  }
}
