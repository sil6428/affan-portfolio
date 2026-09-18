import type { MetadataRoute } from "next";

const baseUrl = "https://affan-shaikh.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/info`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/interests`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/interests/badminton`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/interests/3d-printing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/interests/reading`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/interests/photography`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/interests/home-lab`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/work/archtech`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/work/ssik`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/work/p2p-messaging`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/work/secure-file-transfer`, changeFrequency: "monthly", priority: 0.9 },
  ];
}
