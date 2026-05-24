# Frontend - Provider Detail Page Module

## Overview

Production-ready Next.js 14 frontend for displaying technician/provider detail pages. Built with TypeScript, React Query, Tailwind CSS, and Lucide Icons.

## Architecture

### Folder Structure

```
src/
├── app/
│   └── providers/
│       └── [id]/
│           ├── page.tsx           # Main page component
│           └── layout.tsx          # Layout wrapper with metadata
├── components/
│   └── provider/
│       ├── ProviderHeader.tsx      # Header with title and quick info
│       ├── ProviderOverview.tsx    # Bio and experience section
│       ├── TrustMetrics.tsx        # Trust metrics cards
│       ├── ServicesList.tsx        # Services listing
│       ├── ReviewsSection.tsx      # Customer reviews
│       ├── ContactActions.tsx      # Call/WhatsApp sticky footer
│       ├── ProviderMap.tsx         # Location map
│       ├── LoadingSkeletons.tsx    # Loading states
│       ├── ErrorStates.tsx         # Error states
│       ├── ProviderDetailPage.tsx  # Main composite component
│       └── index.ts                # Component exports
├── hooks/
│   ├── useProvider.ts              # React Query hooks
│   └── index.ts                    # Hook exports
├── lib/
│   └── utils.ts                    # Utility functions
└── types/
    ├── provider.ts                 # TypeScript interfaces
    ├── constants.ts                # API endpoints & constants
    └── index.ts                    # Type exports
```

### Component Architecture

**Component Hierarchy:**

```
ProviderDetailPage (Composite)
├── ProviderHeader
│   └── Handles: Title, Rating, Verification, Action buttons
├── ProviderOverview
│   └── Handles: Bio, Experience, Specialization, Brands
├── TrustMetrics
│   └── Handles: Trust score, Repeat rate, Response time, Jobs
├── ServicesList
│   └── Handles: Service cards with pricing & duration
├── ReviewsSection
│   └── Handles: Reviews list with pagination, Rating distribution
├── ProviderMap
│   └── Handles: Location, Navigation links
└── ContactActions
    └── Handles: Sticky mobile footer with action buttons
```

## TypeScript Interfaces

All API responses are fully typed. Key types:

```typescript
interface ProviderDetail {
  id: number;
  user: User;
  shop_name: string;
  bio: string;
  verified: boolean;
  avg_rating: number;
  review_count: number;
  jobs_completed: number;
  repeat_customer_percentage: number;
  trust_score: number;
  years_of_experience: number;
  specialization: string;
  supported_brands: string[];
  services: ProviderService[];
  // ... more fields
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  customer: User;
  is_verified_purchase: boolean;
  created_at: string;
}
```

See [src/types/provider.ts](src/types/provider.ts) for complete type definitions.

## React Query Hooks

All data fetching is managed by React Query with automatic caching and invalidation:

```typescript
// Fetch provider detail
const { data: provider, isLoading, error } = useProviderDetail(providerId);

// Fetch reviews with pagination
const { data: reviews } = useProviderReviews(providerId, page, 10);

// Fetch review summary
const { data: summary } = useReviewSummary(providerId);

// Fetch provider stats
const { data: stats } = useProviderStats(providerId);

// Create review (mutation)
const createReviewMutation = useCreateReview();
```

**Cache Configuration:**
- Provider detail: 5 minutes
- Reviews: 5 minutes
- Summary: 10 minutes
- Stats: 10 minutes

**Cache Invalidation:**
- Creating a review invalidates all related caches
- Automatic refetch on window focus
- Manual refetch available via query client

## Utility Functions

Located in [src/lib/utils.ts](src/lib/utils.ts):

```typescript
// Formatting
formatCurrency(1500)              // ₹1,500
formatRating(4.5)                 // "4.5"
formatDuration(120)               // "2h"
formatTimeAgo("2024-01-15T...")   // "2 days ago"

// Calculations
getTrustScoreInfo(78.5)            // { label, color, score }
getResponseTimeLabel(15)           // { label, icon }
getStarRating(4.5)                 // { fullStars, hasHalfStar, emptyStars }

// Links
generateCallLink("+919876543210")
generateWhatsAppLink("+919876543210", "message")
generateMapsLink("address")
```

## API Integration

### Base Configuration

```typescript
// Environment variable
REACT_APP_API_URL=http://localhost:8000/api

// Endpoints (auto-configured)
/api/providers/:id/
/api/providers/:id/reviews/
/api/providers/:id/stats/
/api/providers/:id/summary/
```

### Error Handling

- Network errors trigger error boundary
- Failed requests show user-friendly error messages
- Retry buttons available for failed requests
- Validation errors from API are displayed

## Components

### ProviderHeader
- Provider name and profile image
- Verification badge
- Rating and review count
- Address and open/closed status
- Trust score badge
- Action buttons (Call, WhatsApp, Create Request)

**Props:**
```typescript
interface ProviderHeaderProps {
  provider: ProviderDetail;
  onCall?: () => void;
  onWhatsApp?: () => void;
  onCreateRequest?: () => void;
  onNavigate?: () => void;
}
```

### ProviderOverview
- Bio/description
- Years of experience
- Specialization
- Supported brands (badges)

### TrustMetrics
- Four metric cards: Trust Score, Repeat Customers, Response Time, Jobs Completed
- Gradient backgrounds with icons
- Helpful info box explaining calculation

### ServicesList
- Service name, description, price, duration
- Available/unavailable status
- Click to select service

### ReviewsSection
- Review list with customer details
- Star ratings and timestamps
- Verified purchase badges
- Rating distribution chart (optional)
- Pagination controls
- Load more functionality

### ProviderMap
- Address display
- Google Maps embed (placeholder)
- "View on Maps" and "Directions" buttons
- Links to external maps

### ContactActions
- **Desktop:** Fixed buttons on right side
- **Mobile:** Sticky footer with three action buttons
- Call, WhatsApp, Create Request
- Loading states

## Loading States

Skeleton loaders for all major sections:

```typescript
ProviderHeaderSkeleton()
ProviderOverviewSkeleton()
TrustMetricsSkeleton()
ServicesListSkeleton()
ReviewsSectionSkeleton()
ProviderMapSkeleton()
```

## Error States

Error components for various scenarios:

```typescript
<ErrorPage error="..." onRetry={fn} />
<NotFoundPage />
<EmptyReviewsState />
<EmptyServicesState />
```

## Responsive Design

**Mobile-First Approach:**
- Full-width on mobile
- 2-3 column grids on tablet (md breakpoint)
- Sticky footer on mobile
- Hamburger-friendly layouts

**Breakpoints:**
- `sm`: 640px
- `md`: 768px (desktop layout starts)
- `lg`: 1024px
- `xl`: 1280px

## Styling

**Tailwind CSS Configuration:**
- Rounded corners: 8px
- Shadows: Subtle (`shadow-sm`) for cards
- Colors: Professional blue, green, orange accents
- Spacing: 4px base unit (Tailwind's default)

**Color Scheme:**
- Primary: Blue (#0066FF)
- Secondary: Green (#16A34A)
- Accent: Orange (#EA580C)
- Neutral: Gray scale (#6B7280 for text)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install react-query axios next next-image-optimization lucide-react
```

Or with the package.json from this module:

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
REACT_APP_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Setup React Query

Create `src/app/layout.tsx` or update existing:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 4. Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000/providers/1`

## Performance Optimizations

1. **Code Splitting:** Each component is lazy-loadable
2. **Image Optimization:** Use Next.js Image component
3. **Query Caching:** React Query handles intelligent caching
4. **Memoization:** Components use React.memo where appropriate
5. **Pagination:** Prevents loading all reviews at once
6. **Skeletons:** Show loading states immediately

## Accessibility (A11y)

- Semantic HTML (`<button>`, `<article>`, `<section>`)
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators for keyboard users
- Color contrast ratios meet WCAG AA standards

## Testing

### Component Testing (Vitest + React Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import { ProviderHeader } from '@/components/provider';

test('renders provider name', () => {
  const provider = {/* mock data */};
  render(<ProviderHeader provider={provider} />);
  expect(screen.getByText(provider.shop_name)).toBeInTheDocument();
});
```

### Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useProviderDetail } from '@/hooks/useProvider';

test('fetches provider details', async () => {
  const { result } = renderHook(() => useProviderDetail(1));
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

## Example Usage

### Basic Page Setup

```typescript
import { useState } from 'react';
import { ProviderDetailPage } from '@/components/provider';
import { useProviderDetail, useProviderReviews } from '@/hooks/useProvider';

export default function Page({ params }) {
  const [page, setPage] = useState(1);
  const { data: provider } = useProviderDetail(params.id);
  const { data: reviews } = useProviderReviews(params.id, page);

  return (
    <ProviderDetailPage
      provider={provider}
      reviews={reviews?.results || []}
      currentPage={page}
      onPageChange={setPage}
      // ... other props
    />
  );
}
```

### Integration with Repair Request Flow

```typescript
const handleCreateRequest = () => {
  // Could open a modal or navigate to repair request form
  router.push(`/repair-requests/new?provider=${provider.id}`);
};

<ProviderHeader 
  provider={provider}
  onCreateRequest={handleCreateRequest}
/>
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 12+, Chrome Mobile latest

## Future Enhancements

1. **Real Maps Integration**
   - Google Maps API for actual map display
   - Route calculation
   - Distance calculation

2. **Review Creation Modal**
   - Modal form to submit reviews
   - Star rating picker
   - Photo upload

3. **Real-time Updates**
   - WebSocket for live review updates
   - Real-time availability changes

4. **Advanced Filtering**
   - Filter by service type
   - Filter by rating range
   - Sort options

5. **Booking Integration**
   - Integrated booking calendar
   - Time slot selection
   - Payment processing

6. **Analytics**
   - Track page views
   - Track conversion (calls, chats)
   - A/B testing

## Troubleshooting

### API Connection Issues

**Problem:** "Failed to fetch provider"
- Check if backend is running on correct port
- Verify `REACT_APP_API_URL` environment variable
- Check CORS settings on backend

**Problem:** CORS errors
- Backend needs to allow frontend origin
- Add to Django CORS_ALLOWED_ORIGINS

### Loading State Stuck

**Problem:** Skeleton loading never completes
- Check browser network tab for failed requests
- Verify API returns valid JSON
- Check React Query DevTools for query state

### Styling Issues

**Problem:** Tailwind classes not applied
- Verify `tailwind.config.js` includes `./src/**/*.{ts,tsx}`
- Clear `.next` build cache
- Restart dev server

## Deployment

### Vercel (Recommended for Next.js)

```bash
vercel deploy
```

### Self-hosted

```bash
npm run build
npm run start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

- Follow TypeScript strict mode
- Add JSDoc comments to functions
- Write tests for new components
- Maintain responsive design
- Keep performance in mind

## License

MIT
