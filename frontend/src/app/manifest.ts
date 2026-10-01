import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "巴士来了",
    short_name: "巴士来了",
    description: "新加坡公交到站信息查询",
    start_url: "/",
    display: "standalone",
    background_color: "#e2e8f0",
    theme_color: "#10b981",
    icons: [
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
