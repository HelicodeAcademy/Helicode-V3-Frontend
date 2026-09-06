import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes = [
    "",
    "/about",
    "/payroll",
    "/privacy-policy",
    "/terms-of-use",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" || route === "/payroll" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/payroll" ? 0.9 : 0.7,
  }));
}
