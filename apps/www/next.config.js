import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const markdownAccepted = {
  type: "header",
  key: "accept",
  value: "(.*)text/markdown(.*)",
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  rewrites() {
    return {
      // before files, or the docs catch-all route would match `/docs/*.md`
      beforeFiles: [
        // the homepage's Markdown is llms.txt
        { source: "/index.md", destination: "/llms.txt" },
        { source: "/", destination: "/llms.txt", has: [markdownAccepted] },
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
      // a Markdown 404 for any other missing page
      fallback: [
        {
          source: "/:path*",
          destination: "/llms.mdx/not-found",
          has: [markdownAccepted],
        },
      ],
    };
  },
  // Next.js replaces a `Vary` header set here, so the Markdown routes set
  // `Vary: Accept` themselves
  headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: '</llms.txt>; rel="alternate"; type="text/markdown"',
          },
        ],
      },
      {
        source: "/docs",
        headers: [
          {
            key: "Link",
            value: '</docs.md>; rel="alternate"; type="text/markdown"',
          },
        ],
      },
      {
        // pages, not their `.md` URLs: slugs have no dots
        source: "/docs/:path([^.]+)",
        headers: [
          {
            key: "Link",
            value: '</docs/:path.md>; rel="alternate"; type="text/markdown"',
          },
        ],
      },
    ];
  },
};

export default withMDX(nextConfig);
