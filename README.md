# Seedling Prime Trader

A modern, real-time stock market tracking and portfolio management application built with Next.js 15. Track stock prices, manage your watchlist, set personalized alerts, and gain insights into companies - all in a sleek, dark-themed interface.

## Features

- **Real-time Stock Tracking** - Monitor live stock prices and market data with TradingView integration
- **Portfolio Management** - Build and manage your personal watchlist
- **Stock Details** - Comprehensive company insights and financial data
- **User Authentication** - Secure sign-up and sign-in with Better Auth
- **Personalized Alerts** - Set custom alerts for price movements and market events
- **Economic Calendar** - Track important economic events and their market impact
- **Dark Mode Interface** - Beautiful, professionally designed dark theme optimized for extended use

## Tech Stack

### Core Framework
- **Next.js 15.5.2** with App Router and React Server Components (RSC)
- **React 19.1.0** with latest features
- **TypeScript 5** with strict mode enabled
- **Turbopack** for lightning-fast builds

### UI & Styling
- **Tailwind CSS v4** with extensive custom design system
- **shadcn/ui** (New York variant) - Accessible component primitives built on Radix UI
- **Lucide React** - Beautiful, consistent icon library
- **Geist Font Family** - Modern typography from Vercel

### Backend & Data
- **MongoDB** with Mongoose ODM
- **Better Auth** - Modern authentication solution
- **Inngest** - Reliable background jobs and workflows
- **Nodemailer** - Email functionality

### Developer Experience
- **ESLint** - Code quality and consistency
- **TypeScript** - Type safety across the entire stack
- **React Hook Form** - Performant form handling

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Seedling-Prime-trader
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# Email (if using email features)
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=

# Inngest (if using background jobs)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Test database connection
npm run test:db
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (root)/            # Main application pages
│   │   ├── page.tsx       # Home page
│   │   ├── watchlist/     # Watchlist management
│   │   └── stocks/        # Stock detail pages
│   ├── (auth)/            # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles and design system
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   └── utils.ts          # Helper functions (cn, etc.)
├── database/             # Database models and configuration
└── public/              # Static assets
    └── assets/
```

## Architecture

### Design System

The application features a comprehensive custom design system built on Tailwind CSS v4:

- **Color Palette**: Extended gray scale (gray-900 to gray-400) with vibrant accents (blue, yellow, teal, red, orange, purple)
- **OKLCH Color Space**: Advanced color management for consistent light/dark mode
- **70+ Custom Utilities**: Pre-built classes for buttons, forms, tables, alerts, and more
- **Yellow Brand**: Primary actions use a yellow-400 to yellow-500 gradient

### Key Technologies

- **React Server Components**: Default components are server-rendered for optimal performance
- **Path Aliases**: Clean imports with `@/` prefix (e.g., `@/components/ui/button`)
- **TradingView Integration**: Custom-styled widgets for real-time market data
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Contributing

When working on this project:

1. **Use existing utility classes** - Check `app/globals.css` before creating new styles
2. **Follow the color scheme** - Gray for backgrounds/text, yellow for primary actions, red for destructive actions
3. **Use the `cn()` helper** - Always use `cn()` from `@/lib/utils` for conditional class merging
4. **Server Components by default** - Only add `"use client"` when necessary
5. **Type safety** - Ensure all TypeScript types are properly defined

### Adding UI Components

To add new shadcn/ui components:
```bash
npx shadcn@latest add [component-name]
```

## License

This project is private and proprietary.

## Support

For issues and feature requests, please contact the development team.
