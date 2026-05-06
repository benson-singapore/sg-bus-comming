import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SG 公交出行",
    short_name: "SG 公交",
    description: "新加坡公交到站信息查询",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
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
