## Agent Instructions

When migrating pages from HTML to Next.js:
1. Read the original HTML file first
2. Extract the semantic structure
3. Create the Next.js component preserving all classes and content
4. Add metadata export at the top
5. Do not guess — ask if original intent is unclear

When creating blog infrastructure:
- Use gray-matter to parse frontmatter
- Use next/image for all images
- Generate static pages with generateStaticParams
