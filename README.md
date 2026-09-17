# Belman Church Management System

![Belman Church](https://raw.githubusercontent.com/ashtonmths/belmanchurch/refs/heads/main/public/screenshots/hero.png)

A modern, full-stack church management system built with Next.js 15, tRPC, and Drizzle ORM. This application helps manage parishioners, families, donations, events, galleries, and publications for Belman Church.

## ✨ Features

### 👥 Parishioner Management

- Register and manage parishioner details
- Family grouping and household management
- Ward-based organization
- Mobile verification and account linking

### 💰 Donation Management

- Online donation processing via Razorpay
- Support for Church, Chapel, and Thanksgiving donations
- Automated receipt generation
- Payment verification and tracking
- Donation history and reporting

### 📸 Gallery Management

- Event photo uploads to Cloudinary
- Gallery organization by events and dates
- Like and interaction features
- Role-based upload permissions (Admin, Developer, Photographer)

### 📅 Events & Publications

- Event creation and management
- Bethkati (church bulletin) PDF uploads
- Public event calendar
- Monthly publication archive

### 🔐 Role-Based Access Control

- **Developer**: Full system access
- **Admin**: Administrative operations
- **Photographer**: Gallery uploads
- **Parishoner**: Personal profile management
- **User**: Basic authenticated access

### 🛡️ Security Features

- NextAuth v5 authentication with Google OAuth
- Role-based authorization at API level
- Protected TRPC procedures
- Session management with the Auth.js Drizzle adapter
- Secure payment processing

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **API**: [tRPC](https://trpc.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js v5](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Payments**: [Razorpay](https://razorpay.com/)
- **File Storage**: [Cloudinary](https://cloudinary.com/)
- **Email**: [Nodemailer](https://nodemailer.com/)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials
- Razorpay account
- Cloudinary account

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ashtonmths/belmanchurch.git
   cd belmanchurch
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/belmanchurch"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"

   # Razorpay
   NEXT_PUBLIC_RAZORPAY_KEY_ID="your-razorpay-key-id"
   RAZORPAY_SECRET_KEY="your-razorpay-secret"

   # Cloudinary
   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

   # Email (Optional)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   ```

4. **Set up the database**

   ```bash
   npm run db:push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript type checking
- `npm run db:push` - Push the Drizzle schema to the database
- `npm run db:generate` - Generate a Drizzle migration
- `npm run db:migrate` - Apply pending Drizzle migrations
- `npm run db:seed` - Seed the ward list
- `npm run db:studio` - Open Drizzle Studio
- `npm run format:check` - Check code formatting
- `npm run format:write` - Format code with Prettier

## 🏗️ Project Structure

```
belmanchurch/
├── drizzle/                   # SQL migrations and seed script
├── drizzle.config.ts          # Drizzle Kit configuration
├── public/
│   ├── bg/                    # Background images
│   └── priests/               # Priest photos
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── admin/            # Admin pages
│   │   ├── api/              # API routes
│   │   ├── donate/           # Donation page
│   │   ├── events/           # Events page
│   │   ├── gallery/          # Gallery pages
│   │   └── profile/          # User profile
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/      # tRPC routers
│   │   │   └── trpc.ts       # tRPC setup
│   │   ├── auth/             # Authentication config
│   │   ├── db/               # Drizzle schema
│   │   └── utils/            # Server utilities
│   ├── styles/               # Global styles
│   ├── trpc/                 # tRPC client setup
│   └── types/                # TypeScript types
├── .env                      # Environment variables
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS config
└── tsconfig.json             # TypeScript config
```

## 🔒 Security

This project implements comprehensive security measures:

- ✅ Role-based access control on all API endpoints
- ✅ Session-based authentication with NextAuth
- ✅ Protected procedures using tRPC middleware
- ✅ Input validation with Zod schemas
- ✅ Secure payment processing
- ✅ Environment variable protection
- ✅ CSRF protection
- ✅ XSS protection via React

## 📧 Contact

For questions or support, please contact:

**Email**: [belmanchurch.in@gmail.com](mailto:belmanchurch.in@gmail.com)

## 🙏 Acknowledgments

Built with ❤️ for Belman Church community

---

Made with [T3 Stack](https://create.t3.gg/)
