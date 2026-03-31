"use strict";

/**
 * Contact Form Server Action
 * Handles contact submissions from the UI.
 */
export async function handleContactForm(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const orderNumber = formData.get("orderNumber");
  const message = formData.get("message");

  // Log the payload as requested
  console.log("Contact Form Submission:", {
    name,
    email,
    orderNumber,
    message,
    timestamp: new Date().toISOString(),
  });

  // Simulate a small delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: "Message Sent!",
  };
}
