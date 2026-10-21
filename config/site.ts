export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "RoadmapXpress",
  description:
    "guide to with structured learning paths and free resources.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Backend",
      href: "/roadmap/backend",
    },
    {
      title: "Frontend",
      href: "/roadmap/frontend",
    },
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/piyushmani/RoadmapXpress",
    docs: "https://ui.shadcn.com",
  },
}
