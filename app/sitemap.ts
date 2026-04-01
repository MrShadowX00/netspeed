import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://net.toollo.org";
  const tools = [
    { path: "/", priority: 1.0 },
    { path: "/my-ip", priority: 0.9 },
    { path: "/ping", priority: 0.8 },
    { path: "/dns-lookup", priority: 0.8 },
    { path: "/ip-lookup", priority: 0.8 },
    { path: "/port-checker", priority: 0.7 },
    { path: "/bandwidth-calculator", priority: 0.7 },
    { path: "/subnet-calculator", priority: 0.7 },
  ];
  return tools.map((t) => ({
    url: `${baseUrl}${t.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: t.priority,
  }));
}
