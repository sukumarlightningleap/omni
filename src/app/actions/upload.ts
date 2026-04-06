"use server"

import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"

export async function uploadFile(formData: FormData) {
  const session = await auth()
  
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Missing administrative clearance.")
  }

  const file = formData.get("file") as File
  if (!file) {
    throw new Error("No file payload detected.")
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Forbidden file format: ${file.type}`);
  }

  // Enforce size limit for Vercel Blob Free tier (typically 4.5MB for serverless functions)
  const MAX_SIZE = 4.5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("File size exceeds 4.5MB limit.");
  }

  try {
    // Sanitize filename and add timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueName = `${timestamp}-${sanitizedName}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueName, file, {
      access: 'public',
      addRandomSuffix: true, // Double safety against collisions
    });

    return { 
      url: blob.url,
      name: sanitizedName
    }
  } catch (error) {
    console.error("Vercel Blob Upload Failed:", error);
    throw new Error("Cloud synchronization failure. Persistent storage rejected the payload.");
  }
}
