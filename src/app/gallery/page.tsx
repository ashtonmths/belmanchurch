import GalleryBrowser from "~/components/GalleryBrowser";
import { api } from "~/trpc/server";

export const revalidate = 900;

export default async function GalleryPage() {
  const folders = await api.gallery.getFolders();
  return <GalleryBrowser initialFolders={folders} />;
}
