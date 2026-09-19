import GalleryBrowser from "~/components/GalleryBrowser";
import { getCachedGalleryFolders } from "~/server/gallery-data";

export const revalidate = 900;

export default async function GalleryPage() {
  const folders = await getCachedGalleryFolders();
  return <GalleryBrowser initialFolders={folders} />;
}
