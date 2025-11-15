# Setup Guide - Talaqqi Academy

## Prerequisites
- Node.js 18+ 
- npm

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and update the values:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-unique-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

**Important:** Generate a secure `NEXTAUTH_SECRET` for production:
```bash
openssl rand -base64 32
```

### 3. Database Setup
Push the Prisma schema to create database:
```bash
npm run db:push
```

Optional: Seed the database with sample data:
```bash
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Create new migration
- `npm run db:reset` - Reset database

## Project Structure

```
talaqqi_academy/
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js app router pages
│   │   ├── admin/      # Admin dashboard pages
│   │   ├── api/        # API routes
│   │   └── page.tsx    # Landing page
│   ├── components/     # React components
│   │   ├── admin/      # Admin-specific components
│   │   └── ui/         # shadcn/ui components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities and configurations
└── [config files]
```

## Database Models

- **Admin** - Admin users for authentication
- **Event** - Events/courses management
- **Pendaftaran** - Event registrations
- **Referensi** - Institution reference info
- **Voucher** - Discount vouchers

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI)
- **Database:** SQLite (via Prisma ORM)
- **Authentication:** NextAuth.js (ready to use)
- **Forms:** React Hook Form + Zod
- **State Management:** Zustand
- **Data Fetching:** TanStack Query + Axios

## API Routes

### Events
- `GET /api/events` - Get all active events
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get event by ID
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Registrations
- `GET /api/pendaftaran` - Get all registrations
- `POST /api/pendaftaran` - Create new registration
- `GET /api/pendaftaran/[id]` - Get registration by ID
- `PUT /api/pendaftaran/[id]` - Update registration status

### Admin
- `POST /api/admin/login` - Admin login

### Reference
- `GET /api/referensi` - Get institution info
- `POST /api/referensi` - Update institution info

## Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

The production build creates a standalone server in `.next/standalone/` directory.

## Notes

- Database file (`dev.db`) is automatically created on first run
- Logs are saved to `dev.log` in development mode
- Make sure to change `NEXTAUTH_SECRET` in production
- Consider using PostgreSQL or MySQL for production instead of SQLite
