# Project: FOG Technologies Pvt Ltd — Next.js Migration

## Old Project Location
All original files are inside `_old/` folder in the project root.

## Stack
- Next.js 15, App Router
- Tailwind CSS
- Resend (contact form emails)
- gray-matter (blog/testimonials via Markdown)

## Folder Targets
- app/ → all pages
- components/ → shared UI (Navbar, Footer, etc.)
- content/blog/ → .md files
- content/testimonials/ → .md files
- public/ → images and static assets

## CSS Strategy
Each page has its own CSS file in _old/. When migrating:
- Global styles (reset, fonts, variables) → app/globals.css
- Page-specific styles → keep as page.module.css per page
- Do NOT rewrite design, preserve it exactly

## JS Strategy
Each page has its own JS file in _old/. When migrating:
- Convert to React hooks/events inside the component
- Do not use document.getElementById patterns — use useRef or useState

## Rules
- Always App Router, never Pages Router
- Every page must have a metadata export (title, description, openGraph, canonical)
- Use next/image for every image
- Use next/link for every internal link
- JSON-LD structured data on every page
- Do not install packages not listed above

## Business Context
Family entertainment company. Goal: 10X organic traffic via SEO, AEO, GEO.
Admin email for contact form: [PUT YOUR EMAIL HERE]

## Progress Log

### Session 1 — Shared Layout Foundation
- Copied custom fonts (`ClashDisplay-Semibold.otf`, `GoogleSans` variable font) to `public/fonts/` and rewrote `app/globals.css` with all global tokens: `@font-face` declarations (including Expansiva base64), CSS custom properties, reset, body defaults, Lenis smooth-scroll hooks, scrollbar hiding, and the `[data-reveal]` scroll-animation system.
- Created `components/Navbar.tsx` as a `'use client'` component with scroll-hide behaviour (hides on scroll down, reappears on scroll up), mobile menu open/close state with body scroll lock, and smooth-scroll to `#get-in-touch` for the CTA — all internal links use `next/link`, logo uses `next/image`.
- Created `components/Footer.tsx` as a server component preserving the exact two-column layout (brand + contact info left, nav + social links right) with `next/link` and `next/image`.
- Replaced the scaffolded `app/layout.tsx` with a clean root layout that imports Navbar and Footer, drops the Geist font wiring, and sets site-wide `Metadata` (title template, description, openGraph).
- Identified pre-existing issue: `app/nav/[slug]/` is an empty directory with no `page.tsx`, causing the Next.js type validator to fail at build time; unrelated to migration work and to be resolved when that route is implemented.