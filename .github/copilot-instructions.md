# Spicker - Chrome Extension Development Guide

## Project Overview
Spicker is a Chrome MV3 extension that enhances TopTracker statistics with custom reporting and hour tracking. It uses React 19, Vite, TailwindCSS 4, and queries the TopTracker API to display worked hours vs. required hours with off-day management.

## Project Structure

### Core Directories
- **`src/`**: Source code with dual React applications
- **`public/`**: Static assets and development manifest
- **`build/`**: Production build output (generated)
- **`chrome-webstore/`**: Complete Chrome Web Store submission package

### Chrome Web Store Assets (`chrome-webstore/`)
- **`docs/`**: All submission documentation
  - `SUBMISSION_GUIDE.md`: Complete store listing guide
  - `PRIVACY.md`: Chrome Web Store compliant privacy policy
  - `CHANGELOG.md`: Version history and release notes
  - `SCREENSHOTS.md`: Screenshot requirements and guidelines
- **`assets/`**: Build artifacts and store assets
  - `manifest.production.json`: Store-optimized manifest
  - `*.zip`: Generated submission packages
- **`screenshots/`**: Store listing images (to be added)
- **`build-and-package.sh`**: Automated submission preparation

## Architecture

### Dual Entry Points
The extension has **two separate React applications** built from a single codebase:
- **`popup.html`** → `src/popup/App.tsx` - Quick overview in browser action popup (480px min-height)
- **`index.html`** → `src/pages/App.tsx` - Full-page detailed statistics (opens in new tab)

Both entry points are configured in `vite.config.ts` using `rollupOptions.input`. Each has its own `main.tsx` that renders to `#root`.

### Navigation Pattern
Use `chrome.tabs.create()` wrapper in `src/utils/navigate.ts` to open full-page views from popup:
```typescript
navigate("index.html") // Opens index.html in new tab
```

## State Management Patterns

### Context Providers Must Wrap Both Apps
`WeeklyRequiredHoursProvider` wraps both `src/popup/App.tsx` and `src/pages/App.tsx` because they're separate React roots. If adding new shared state, wrap both entry points.

### LocalStorage Keys
- `weekly_required_hours` - Array of 7 numbers (Sunday=0 to Saturday=6) for daily required hours
- `off-days` - JSON array of ISO date strings for marked off days

### React Query
Uses `@tanstack/react-query` for API data fetching (see `useWorkedHours.tsx`). Query keys include date ranges for proper cache invalidation.

## Date Handling

### Date Arrays vs. Objects
The codebase uses **Date objects** internally but stores dates as **ISO strings** in localStorage. Key pattern in `src/utils/dates.ts`:
- `getDatesInMonth()` - Returns Date[] for calendar logic
- `dateString(date)` - Converts Date to "YYYY-MM-DD" for API calls
- `getDatesBetween(start, end)` - Inclusive range of Date objects

### Day-of-Week Indexing
Sunday = 0, Monday = 1, ..., Saturday = 6. Used in `weeklyRequiredHours` array to map required hours per day.

## TopTracker API Integration

### Authentication Flow
If API returns 401/403, redirect to `https://tracker.toptal.com/signin/`. See `getProjects()` in `src/utils/api.ts`.

### Data Fetching
1. Fetch all projects (including archived) via `/web/projects`
2. Extract project IDs
3. Query `/activities/my` with date range and project IDs
4. API returns `dates` array with `{date: string, total: number}` where `total` is in seconds

Convert seconds to hours: `total / 3600`

## Build & Development

### Commands
- `npm run start` - Vite build with watch mode for development
- `npm run build` - Production build to `build/` directory

### Build Output
Vite outputs to `build/` with manifest, HTML files, and hashed assets. Load the `build/` folder in Chrome as unpacked extension during development.

### CI/CD Workflow (`.github/workflows/build-and-package.yml`)
Automated build and packaging for Chrome Web Store submission:
- **Triggers**: Push to main branch, version tags (`v*`)
- **Process**: `npm ci` → `npm run build` → ZIP build folder → Upload artifacts/releases
- **Artifacts**: Available for 30 days on commits
- **Releases**: Version tags automatically create GitHub releases with ZIP assets

### Chrome Web Store Submission
- `cd chrome-webstore && ./build-and-package.sh` - Build and package for store submission
- Submission package generated in `chrome-webstore/assets/`
- Follow `chrome-webstore/docs/SUBMISSION_GUIDE.md` for complete process

### Tailwind CSS v4
Uses `@tailwindcss/vite` plugin. Custom colors defined as CSS variables (e.g., `bg-brand`, `text-brand-light`). Check existing components for color patterns before adding new ones.

## Component Patterns

### Stats Component Structure
`src/components/Stats/index.tsx` is the main detailed view showing:
- Date range picker (react-multi-date-picker)
- Month navigation buttons
- Table of daily required/worked/difference hours
- Off-day toggle switches per row

### Off-Day Logic
Off days set required hours to 0 for that date. Implemented via `useOffDays` hook with localStorage persistence. Uses `date-fns` `isSameDay()` for date comparisons to avoid timezone issues.

## Common Pitfalls

1. **Don't duplicate date logic** - Use `src/utils/dates.ts` utilities instead of inline date arithmetic
2. **Context provider placement** - Remember to update both App.tsx files when adding global state
3. **API date format** - Always use `dateString()` helper for consistency
4. **Hours conversion** - API returns seconds, UI displays hours (divide by 3600)
5. **Chrome APIs** - Use `chrome.*` APIs only in extension context, not in content scripts without proper setup
6. **Store submission** - Always use `chrome-webstore/build-and-package.sh` for production builds, not `npm run build` directly
