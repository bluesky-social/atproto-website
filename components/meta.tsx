import { Metadata } from "next";

export function getMetadata({
  title,
  description,
  image,
}: {
  title?: string;
  image?: string;
  description?: string;
} = {}): Metadata {
  title = title ? `${title} | AT Protocol` : "The AT Protocol";
  description =
    description || "A social networking technology created by Bluesky.";
  return {
    title,
    openGraph: {
      title,
      type: "article",
      images: [`https://atproto.com/img/${image || "default-social-card.jpg"}`]
    },
    twitter: {
      title,
      description,
      images: [`https://atproto.com/img/${image || "default-social-card.jpg"}`],
      card: "summary_large_image",
    },
  };
}
