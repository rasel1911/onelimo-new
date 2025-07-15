# Onelimo Concierge

Premium AI-powered platform for booking luxury transportation services.

---

## Overview

**Onelimo Concierge** is an intelligent, full-stack web application for booking luxury rides. It features a modern booking form, an AI-powered concierge chat for personalized journey planning, and a robust admin dashboard for managing bookings, service providers, and workflow analytics. The platform is designed for both end-users (passengers) and administrators, providing a seamless, secure, and scalable experience.

---

## Features

- **AI Concierge Chat**: Book rides and get recommendations via a conversational AI assistant.
- **Quick Booking Form**: Simple, guided form for submitting ride requests.
- **Admin Dashboard**: Monitor bookings, manage service providers, track workflow performance, and view analytics.
- **User Authentication**: Secure login and registration via email or phone.
- **Role-based Access**: Admin, user, and service provider roles with protected routes.
- **Booking Workflow**: Automated workflow for matching requests to providers, collecting quotes, and managing confirmations.
- **Notifications**: Email and SMS notifications for booking updates (Twilio integration).
- **Audit Logging**: Track admin actions and sensitive operations.
- **Responsive UI**: Modern, mobile-friendly design with dark mode support.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router, React 19), TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API routes, Drizzle ORM, PostgreSQL
- **AI/ML**: Google Gemini, OpenAI, custom prompt engineering
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Email**: Resend, React Email
- **SMS**: Twilio
- **Database**: PostgreSQL (managed via Drizzle ORM)
- **Other**: Upstash (Redis, QStash, Workflow), Vercel Analytics

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Clone the repository
$ git clone <repo-url>
$ cd onelimo-concierge

# Install dependencies
$ pnpm install
```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
POSTGRES_URL=postgresql://user:password@host:port/database

# (Optional) For Drizzle migration scripts
DATABASE_URL=postgresql://user:password@host:port/database

# Email/SMS/AI providers (add as needed)
# TWILIO_ACCOUNT_SID=...
# TWILIO_AUTH_TOKEN=...
# RESEND_API_KEY=...
# OPENAI_API_KEY=...
# GOOGLE_API_KEY=...
```

### Database Migration

```bash
# Run migrations
$ npm run db:push
# or
$ tsx db/migrate.ts
```

---

## Usage

### Development

```bash
$ pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the app.

### Production

```bash
$ pnpm run build
$ pnpm start
```

---

## Booking & Concierge

- **/booking-request-form**: Guided form for ride booking.
- **/concierge**: AI-powered chat for booking and recommendations.
- **Authentication**: Required for booking and concierge features.

---

## Admin Dashboard

- **/admin**: Main dashboard with stats and analytics.
- **/admin/booking-tracker**: Track and manage all booking requests.
- **/admin/service-providers**: Manage service providers.
- **/admin/locations**: Manage service areas.
- **/admin/settings**: System settings.

### Admin Management Script

See [`scripts/README.md`](scripts/README.md) for full documentation.

Quick start:

```bash
npm run admin:manage
```

Features:

- Create, promote, and manage admin users
- Reset admin passwords
- List all admins
- Secure password handling and validation

---

## Project Structure

- `app/` — Next.js app directory (routes, pages, API)
- `db/` — Database schema, migrations, and queries
- `lib/` — Business logic, AI services, workflow
- `components/` — UI components
- `scripts/` — Utility and admin scripts

---

## License

Copyright 2025 By Jade&Sterling and M Nobinur

---

## Contact

For support or inquiries, email: [contact@onelimo.com](mailto:contact@onelimo.com)
