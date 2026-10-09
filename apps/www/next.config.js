import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  rewrites() {
    return {
      // before files, or the docs catch-all route would match `/docs/*.md`
      beforeFiles: [
        // each page's Markdown at its URL plus `.md`
        { source: "/docs.md", destination: "/llms.mdx/docs/content.md" },
        {
          source: "/docs/:path+\\.md",
          destination: "/llms.mdx/docs/:path+/content.md",
        },
        // and at its URL for agents that ask for Markdown
        {
          source: "/docs",
          destination: "/llms.mdx/docs/content.md",
          has: [markdownAccepted],
        },
        {
          source: "/docs/:path+",
          destination: "/llms.mdx/docs/:path+/content.md",
          has: [markdownAccepted],
        },
      ],
    };
  },
};

const markdownAccepted = {
  type: "header",
  key: "accept",
  value: "(.*)text/markdown(.*)",
};

export default withMDX(nextConfig);
