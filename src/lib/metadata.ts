import type { Metadata } from "next";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  if (noIndex) {
    return {
      title,
      description,
      robots: { index: false, follow: false },
    };
  }

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: `${title} | St. Joseph Church, Belman`,
      description,
      images: [
        {
          url: "/screenshots/hero.png",
          width: 1440,
          height: 1000,
          alt: "Inside St. Joseph Church, Belman",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | St. Joseph Church, Belman`,
      description,
      images: ["/screenshots/hero.png"],
    },
  };
}
