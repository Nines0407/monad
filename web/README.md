# Agentic Payment System - Web Frontend

A modern React dashboard for monitoring and managing the Agentic Payment System audit data.

## Features

- **Dashboard Overview**: Real-time statistics and key metrics
- **Payment Monitoring**: View and filter all payment transactions
- **Audit Trail**: Complete audit event timeline
- **Visual Analytics**: Interactive charts for payment trends and categories
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Query** - Data fetching and state management
- **Recharts** - Interactive charting library
- **Lucide React** - Icon library
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see main README)

### Installation

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API endpoint (if different from default):
   ```bash
   # The frontend defaults to http://localhost:3001/api/v1
   # To change, edit src/api/index.ts
   ```

### Development

Start the development server:
```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
web/
├── src/
│   ├── components/     # React components
│   │   ├── Dashboard.tsx
│   │   ├── RecentPayments.tsx
│   │   ├── AuditEvents.tsx
│   │   └── StatisticsChart.tsx
│   ├── api/           # API service layer
│   ├── types/         # TypeScript definitions
│   ├── App.tsx        # Root component
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## API Integration

The frontend communicates with the following backend endpoints:

- `GET /api/v1/payments` - Retrieve payment records
- `GET /api/v1/audit-events` - Retrieve audit events
- `GET /api/v1/health` - Health check

### CORS Configuration

Ensure the backend CORS middleware is properly configured to allow requests from the frontend origin (typically `http://localhost:5173`).

## Customization

### Styling

The project uses Tailwind CSS. Modify `tailwind.config.js` for custom themes and design tokens.

### Adding New Features

1. Create new components in `src/components/`
2. Add API methods in `src/api/index.ts`
3. Update types in `src/types/models.ts`
4. Integrate into the dashboard

## Troubleshooting

### "Failed to load payments"

1. Ensure the backend API is running:
   ```bash
   cd ..
   docker-compose up -d postgres redis
   npm run dev
   ```

2. Check CORS configuration in the backend.

3. Verify the API endpoint in `src/api/index.ts`.

### TypeScript Errors

Run type checking:
```bash
npm run typecheck
```

### Build Errors

Clear the build cache:
```bash
rm -rf node_modules/.vite
rm -rf dist
npm install
npm run build
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Part of the Agentic Payment System - MIT License