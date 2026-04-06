import { prisma } from "@/lib/prisma";
import NavbarClient from "./NavbarClient";

export async function getVisibleCollections() {
  try {
    const collections = await prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        handle: true,
        imageUrl: true,
      },
    });
    return collections;
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export default async function Navbar() {
  const collections = await getVisibleCollections();

  const formattedCollections = collections.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.name,
    imageUrl: c.imageUrl,
  }));

  return <NavbarClient initialCollections={formattedCollections} />;
}
