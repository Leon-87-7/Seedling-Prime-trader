# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Seedling Prime trader" - a Next.js 15 application for tracking real-time stock prices, portfolio management, personalized alerts, and company insights. The project uses the Next.js App Router architecture with React Server Components (RSC).

## Tech Stack

- **Framework**: Next.js 15.5.2 with Turbopack
- **React**: 19.1.0 (with RSC support)
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 (using @tailwindcss/postcss) with extensive custom design system
- **UI Components**: shadcn/ui (New York style variant with Radix UI primitives)
- **Fonts**: Geist Sans and Geist Mono (via next/font/google)
- **Icon Library**: lucide-react
- **Animations**: tw-animate-css

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with font configuration and metadata
  - `page.tsx` - Home page
  - `globals.css` - Global styles including Tailwind directives
- `components/` - React components
  - `ui/` - shadcn/ui components (e.g., Button)
- `lib/` - Utility functions
  - `utils.ts` - Contains `cn()` helper for merging Tailwind classes
- `public/assets/` - Static assets

### Key Configuration

- **Path Alias**: `@/*` maps to `./src/*` in tsconfig.json, but note that actual source files are at the root (not in src/), so imports use `@/` for components, lib, etc.
- **TypeScript**: Target ES2017, strict mode enabled
- **Turbopack**: Explicitly configured with project root to avoid workspace warnings
- **Theme**: Dark mode enabled by default (via className="dark" on html element)

### Design System

The project has an extensive custom design system built on top of Tailwind CSS v4 and shadcn/ui:

**Color Palette:**
- Extended gray scale: gray-900 (#050505) through gray-400 (#CCDADC)
- Vibrant accents: blue-600, yellow-400/500, teal-400, red-500, orange-500, purple-500
- Uses OKLCH color space for light/dark mode variants
- Primary brand color: Yellow gradient (yellow-400 to yellow-500)

**Custom Utility Classes:**
The [app/globals.css](app/globals.css) file defines 70+ custom utility classes for common patterns:
- Layout: `.container`, `.home-wrapper`, `.home-section`
- Buttons: `.yellow-btn`, `.search-btn`, `.watchlist-btn`, `.add-alert`
- Forms: `.form-input`, `.form-label`, `.select-trigger`, `.country-select-*`
- Auth pages: `.auth-layout`, `.auth-left-section`, `.auth-right-section`
- Tables: `.watchlist-table`, `.table-row`, `.table-header-row`
- Alerts: `.alert-dialog`, `.alert-list`, `.alert-item`
- News: `.news-item`, `.news-title`, `.news-tag`
- TradingView widget styling customizations

**shadcn/ui Integration:**
- Style: "new-york"
- Base color: slate
- CSS variables enabled for theming
- Components installed via shadcn CLI
- Aliases configured: @/components, @/lib/utils, @/components/ui, @/hooks

## Working with UI Components

When adding new shadcn/ui components, use:
```bash
npx shadcn@latest add [component-name]
```

All UI components use the `cn()` utility from `@/lib/utils` for conditional class merging.

## Styling Guidelines

When building new features:
1. **Prefer existing utility classes** - Check [app/globals.css](app/globals.css) before creating new custom styles
2. **Follow the color scheme** - Use gray-* for backgrounds/text, yellow-* for primary actions, red-500 for destructive actions
3. **Consistent patterns** - Auth pages, forms, tables, and dialogs have established utility classes
4. **Use `cn()` helper** - Always use `cn()` from `@/lib/utils` for conditional class merging in components
5. **TradingView integration** - Custom styles override TradingView widget defaults to match dark theme (#141414 background)

## Important Notes

- The project uses **Turbopack** for both dev and build (not webpack)
- React 19 with Server Components - default components are server components unless marked with "use client"
- Path imports use `@/` prefix (e.g., `@/components/ui/button`)
- Dark mode is the default and primary theme - all design is optimized for dark backgrounds
- The app appears to integrate TradingView widgets for charts and market data visualization