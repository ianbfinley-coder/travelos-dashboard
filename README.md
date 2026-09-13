# TravelOS Monitoring Dashboard

Real-time cost & alert monitoring dashboard for TravelOS backend. Built with Vue 3, Supabase, and Tailwind CSS.

## Features

### 1. Cost Dashboard
- Real-time daily cost tracking
- Monthly budget progress (vs $500 limit)
- Service breakdown (bar chart)
- 7-day spending trend
- Spending rate forecast

### 2. Alert Activity Feed
- Real-time alert notifications
- Severity filtering (Critical / Warning / Info)
- Status tracking (Open / Resolved)
- 24h alert counts

### 3. API Performance Metrics
- Latency percentiles (P50, P95, P99)
- Success rate tracking
- Failed request count
- Cache hit ratio

### 4. User Quotas
- Per-user quota tracking
- Tier-based limits (Free/Pro/Premium)
- Tier distribution breakdown
- Alert for users >75% quota

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase project with:
  - `api_logs` table
  - `alerts` table
  - `user_quotas` table

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd travelos-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Development

**Run development server:**
```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

**Real-time updates:**
- Automatic updates via Supabase real-time channels
- Manual refresh button in header
- Auto-format timestamp updates every second

### Build

**Build for production:**
```bash
npm run build
```

Output will be in the `dist/` directory.

**Preview production build:**
```bash
npm run preview
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "feat: TravelOS monitoring dashboard"
git push origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Vercel will auto-detect Vite settings

3. **Set environment variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Deploy**
   - Click "Deploy"
   - Dashboard will be live at `https://your-vercel-domain.vercel.app`

### Deploy to Netlify

1. **Push to GitHub** (same as above)

2. **Connect to Netlify**
   - Go to https://netlify.com
   - Click "New site from Git"
   - Select your GitHub repository

3. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set environment variables**
   - In Netlify, go to Site settings → Build & deploy → Environment
   - Add your Supabase credentials

5. **Deploy**
   - Netlify will auto-deploy on git push

## Database Schema

### api_logs
Required columns:
- `id` (UUID)
- `service` (TEXT) - e.g., "google-places", "flightaware"
- `cost` (NUMERIC)
- `response_time_ms` (INTEGER)
- `status_code` (INTEGER)
- `cached` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

### alerts
Required columns:
- `id` (UUID)
- `severity` (TEXT) - "CRITICAL", "WARNING", "INFO"
- `type` (TEXT) - e.g., "daily_service_threshold"
- `message` (TEXT)
- `sent` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

### user_quotas
Required columns:
- `id` (UUID)
- `user_id` (UUID)
- `tier` (TEXT) - "free", "pro", "premium"
- `calls_this_month` (INTEGER)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Components

### CostDashboard.vue
- Daily cost display
- Budget progress bar
- Service breakdown chart
- 7-day trend chart

### AlertFeed.vue
- Alert list with filtering
- Severity color coding
- Alert detail expansion
- Count badges

### PerformanceMetrics.vue
- Latency percentile cards
- Success rate circular progress
- Failed request count
- Cache hit ratio

### UserQuotas.vue
- Tier distribution cards
- Quota usage table
- Over-quota warning alert
- Sortable by usage %

## Pinia Stores

### costStore
- `dailyTotal`: Today's spending
- `monthlyTotal`: Month-to-date spending
- `serviceBreakdown`: Cost by service
- `trend`: 7-day cost trend
- `budgetPercentage`: % of $500 budget
- Methods: `fetchTodayLogs()`, `fetchMonthlyLogs()`, `fetchTrend()`, `subscribeToUpdates()`

### alertStore
- `alerts`: Array of recent alerts
- `filter`: Current filter ("all", "critical", "warning")
- `criticalCount`: # of critical alerts
- `warningCount`: # of warning alerts
- Methods: `fetchAlerts()`, `subscribeToUpdates()`, `setFilter()`

### metricsStore
- `p50`, `p95`, `p99`: Latency percentiles
- `successRate`: % successful requests
- `failedCount`: # failed requests
- `cacheHitRatio`: % of cached requests
- Methods: `fetchMetrics()`, `subscribeToUpdates()`

### quotasStore
- `quotas`: Array of user quotas
- `tierCounts`: Count by tier
- `usersNearLimit`: Users >75% quota
- Methods: `fetchQuotas()`, `subscribeToUpdates()`

## Customization

### Change budget limit
Edit `src/stores/cost.js`:
```javascript
const budgetLimit = 500 // Change this value
```

### Change budget colors
Edit `src/stores/cost.js`:
```javascript
const budgetColor = computed(() => {
  const pct = budgetPercentage.value
  if (pct < 50) return 'bg-green-500'
  // ... adjust thresholds
})
```

### Change refresh interval
Edit `src/App.vue`:
```javascript
// Change 1000 to different milliseconds
refreshInterval = setInterval(() => {
  lastUpdated.value = formatLastUpdated()
}, 1000) // 30s polling
```

### Add new services
Update `api_logs` queries to include new service types in the breakdown chart.

## Troubleshooting

### Dashboard shows "No data"
1. Check Supabase credentials in `.env.local`
2. Verify `api_logs`, `alerts`, `user_quotas` tables exist
3. Check RLS policies allow anonymous read access
4. Test Supabase connection: `supabase status`

### Real-time updates not working
1. Verify Supabase project has realtime enabled
2. Check browser console for connection errors
3. Ensure Supabase anon key has realtime permissions
4. Test with manual "Refresh Now" button

### Build fails
1. Ensure Node.js version >= 16: `node --version`
2. Clear cache: `rm -rf node_modules package-lock.json && npm install`
3. Check for TypeScript errors: `npm run build`

### Deployment fails
1. Verify `.env.local` variables are set in Vercel/Netlify
2. Ensure `dist/` directory is generated: `npm run build`
3. Check build logs for specific errors
4. Try: `npm ci` instead of `npm install` in deployment

## Performance Tips

### Large datasets
- Dashboard automatically limits alerts to 50 most recent
- Consider adding pagination for user quotas >1000 users
- Use Supabase materialized views for aggregated cost data

### Real-time scalability
- Real-time subscriptions limited by Supabase project tier
- Free tier: up to 200 concurrent connections
- Scale up to Pro tier if needed

### Reduce load
- Increase polling interval from 30s to 60s+
- Disable real-time for non-critical tables
- Add date range filter to cost queries

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
