# TaxMate - Financial Services Marketplace

TaxMate is an enterprise-grade financial services marketplace that connects individuals and businesses with chartered accountants for professional financial services, tax planning, and compliance solutions.

## Features

- **User Roles**: Customers, Chartered Accountants (CAs), and Businesses
- **Service Listings**: CAs can create service listings with pricing details
- **Booking System**: Schedule consultations and services
- **Payment Integration**: Secure payment processing with Stripe
- **Review System**: Rating and review system for services
- **Authentication**: Secure user authentication with Supabase Auth
- **Profile Management**: Customizable profiles for all user types

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Supabase (PostgreSQL database + Auth)
- **Payment Processing**: Stripe
- **Authentication**: Supabase Auth
- **Styling**: TailwindCSS with custom UI components
- **Form Handling**: React Hook Form with Zod validation
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20)
- npm or yarn
- Supabase account
- Stripe account (for payment processing)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in `lib/supabase/schema.sql` to create the database schema
3. Run the SQL scripts in `lib/supabase/policies.sql` to set up Row Level Security policies

## Project Structure

```
├── app/                # Next.js app directory (App Router)
│   ├── api/            # API routes
│   ├── (auth)/         # Authentication pages
│   ├── (dashboard)/    # Dashboard pages
│   ├── services/       # Service listing pages
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/             # UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   └── services/       # Service-related components
├── context/            # React context providers
├── lib/                # Utility functions and configurations
│   ├── supabase/       # Supabase clients and helpers
│   └── utils.ts        # General utility functions
├── public/             # Static assets
└── next.config.ts      # Next.js configuration
```

## Deployment

The application can be deployed on Vercel with the following steps:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Set the environment variables in the Vercel project settings
4. Deploy the application

## License

This project is proprietary and not open for redistribution or public use without explicit permission.
