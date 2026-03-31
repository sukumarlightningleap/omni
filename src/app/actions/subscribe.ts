"use strict";

/**
 * Newsletter Subscription Server Action
 * Handles email submissions for marketing.
 */
export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email");

  // Log the subscription
  console.log("Newsletter Subscription:", {
    email,
    timestamp: new Date().toISOString(),
  });

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    message: "Welcome to the rebellion. Check your inbox for your 10% discount.",
  };
}
