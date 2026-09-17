import GalleryBrowser from "~/components/GalleryBrowser";

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GalleryBrowser initialAlbumId={id} />;
}
