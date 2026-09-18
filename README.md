# St. Joseph Church, Belman

![St. Joseph Church website](public/screenshots/hero.png)

The parish website and administration system for St. Joseph Church, Belman. It provides Mass timings, parish history, events, Bethkati issues, gallery albums, contact enquiries and parish administration in one responsive website.

Live website: [belmanchurch.in](https://belmanchurch.in)

## Main features

- Dynamic Mass schedule with catechism and non-catechism Sunday timings
- Parish history, priest records and St. Anthony Chapel information
- Event cards and Bethkati PDF archive
- Gallery albums with likes, downloads, contributor details and native mobile sharing
- Contact form with an admin inbox and email notifications
- Family, member and ward management
- Role-based access for developers, admins, photographers, parishioners and users
- Cloudinary storage for photographs and documents
- Responsive layouts for phones, tablets and desktops

Photographers can only access gallery administration. Administrators can manage the other parish records and website settings.

## Online donations

The Razorpay donation flow has been developed, but online donations are currently paused. Razorpay requires additional parish documents, including a power of attorney, before the payment process can be activated.

## Technology

- Next.js 15 and TypeScript
- Tailwind CSS and Framer Motion
- tRPC and Zod
- PostgreSQL with Drizzle ORM
- Auth.js with Google sign-in
- Cloudinary
- Nodemailer
- Razorpay integration, currently disabled

## Local setup

Requirements: Node.js 18 or newer, PostgreSQL, Google OAuth credentials, Cloudinary credentials and SMTP credentials.

```bash
git clone https://github.com/ashtonmths/belmanchurch.git
cd belmanchurch
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"

NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

NEXT_PUBLIC_RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_SECRET_KEY="your-razorpay-secret"

CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

SMTP_HOST="smtp.example.com"
SMTP_PORT="465"
SMTP_USER="parish@example.com"
SMTP_PASS="your-app-password"
```

Apply migrations and start the development server:

```bash
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run typecheck    # TypeScript checks
npm run lint         # ESLint checks
npm run db:generate  # Generate a migration
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio
```

## Contact

[belmanchurch.in@gmail.com](mailto:belmanchurch.in@gmail.com)
