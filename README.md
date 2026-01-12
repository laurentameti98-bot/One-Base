# CRM Application - Sprint 0

Technical foundation for a CRM application. This is a minimal, functional implementation with no UI polish.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + TypeScript + Express
- **Database**: SQLite (local file)
- **ORM**: Prisma
- **Validation**: Zod

## Project Structure

```
/backend
  /src
    /api          # API routes and error handling
    /domain       # Business logic
    /data         # Database client
  /prisma
    /schema.prisma
    /data         # SQLite database file location
/frontend
  /src
    /pages        # Page components
    /components   # Reusable components (if any)
    /api          # API client
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

This will create the SQLite database file at `backend/prisma/data/crm.db` if it doesn't exist.

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Database

- **Location**: `backend/prisma/data/crm.db`
- **Type**: SQLite (local file)
- **Migrations**: Managed by Prisma
- **Primary Keys**: UUID (not auto-increment)
- **Soft Deletes**: All tables have `deleted_at` column
- **Timestamps**: All tables have `created_at` and `updated_at`

### Running Migrations

To create a new migration:
```bash
cd backend
npm run prisma:migrate
```

To view the database:
```bash
cd backend
npm run prisma:studio
```

## API Endpoints

### Accounts

- `GET /api/accounts` - List accounts (supports `?page=1&pageSize=20`)
- `GET /api/accounts/:id` - Get account by ID
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Soft delete account

### Contacts

- `GET /api/contacts` - List contacts (supports `?page=1&pageSize=20`)
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Soft delete contact

## Frontend Routes

- `/accounts` - List all accounts
- `/accounts/:id` - View/edit account details
- `/contacts` - List all contacts
- `/contacts/:id` - View/edit contact details

## Notes

- This is Sprint 0: functional but intentionally minimal UI
- No authentication implemented yet
- All deletes are soft deletes (sets `deleted_at` timestamp)
- Database is ready to migrate to Postgres/Supabase by changing the Prisma datasource URL
