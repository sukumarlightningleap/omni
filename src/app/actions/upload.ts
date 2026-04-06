"use server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
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

  // Validate file type (basic)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Forbidden file format: ${file.type}`);
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = join(process.cwd(), "public", "uploads")
  
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (e) {
    // Directory already exists or permission issue handled by writeFile
  }

  // Sanitize filename and add timestamp to avoid collisions
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const uniqueName = `${timestamp}-${sanitizedName}`;
  const path = join(uploadDir, uniqueName)
  
  await writeFile(path, buffer)
  
  return { 
    url: `/uploads/${uniqueName}`,
    name: sanitizedName
  }
}
