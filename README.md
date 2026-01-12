# CRM Application - Sprint 0 + Sprint 1

Technical foundation for a CRM application. This is a minimal, functional implementation with no UI polish.

## Sprint 1 Updates

- **Search functionality**: Added search to accounts and contacts endpoints (`?q=searchterm`)
- **Error handling**: Centralized Zod validation error handling with detailed error messages
- **Data integrity**: Contacts are filtered out when their associated account is soft-deleted
- **Pagination hardening**: Page and pageSize parameters are now clamped to valid ranges (page >= 1, pageSize 1-100)

## Sprint 2 Updates

- **UX Structure (Sprint 2a/2a.1)**: Table-based lists, structured detail pages, dedicated create pages, semantic sections
- **Deals Entity (Sprint 2b)**: Full CRUD for Deals with table and pipeline views, Account integration

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

- `GET /api/accounts` - List accounts (supports `?page=1&pageSize=20&q=searchterm`)
  - Search matches account name
  - Pagination: page >= 1, pageSize between 1-100
- `GET /api/accounts/:id` - Get account by ID
- `POST /api/accounts` - Create account (returns validation errors with details)
- `PUT /api/accounts/:id` - Update account (returns validation errors with details)
- `DELETE /api/accounts/:id` - Soft delete account

### Contacts

- `GET /api/contacts` - List contacts (supports `?page=1&pageSize=20&q=searchterm`)
  - Search matches first name, last name, or email
  - Only returns contacts whose account is not deleted
  - Pagination: page >= 1, pageSize between 1-100
- `GET /api/contacts/:id` - Get contact by ID (returns 404 if account is deleted)
- `POST /api/contacts` - Create contact (returns validation errors with details)
- `PUT /api/contacts/:id` - Update contact (returns validation errors with details)
- `DELETE /api/contacts/:id` - Soft delete contact

### Deals

- `GET /api/deals` - List deals (supports `?page=1&pageSize=20&q=searchterm&accountId=uuid&stage=stage`)
  - Search matches deal name
  - Filter by accountId and stage
  - Only returns deals whose account is not deleted
  - Pagination: page >= 1, pageSize between 1-100
- `GET /api/deals/:id` - Get deal by ID (returns 404 if account is deleted)
- `POST /api/deals` - Create deal (returns validation errors with details)
- `PUT /api/deals/:id` - Update deal (returns validation errors with details)
- `DELETE /api/deals/:id` - Soft delete deal

Stage values: `lead`, `qualified`, `proposal`, `negotiation`, `closed_won`, `closed_lost`

## Frontend Routes

- `/accounts` - List all accounts
- `/accounts/new` - Create new account
- `/accounts/:id` - View/edit account details
- `/contacts` - List all contacts
- `/contacts/new` - Create new contact
- `/contacts/:id` - View/edit contact details
- `/deals` - List all deals (table view)
- `/deals/new` - Create new deal
- `/deals/pipeline` - Pipeline view (stage columns)
- `/deals/:id` - View/edit deal details

## Notes

- This is Sprint 0 + Sprint 1: functional but intentionally minimal UI
- No authentication implemented yet
- All deletes are soft deletes (sets `deleted_at` timestamp)
- Contacts are automatically filtered when their account is deleted (orphan prevention)
- Validation errors return structured format: `{ error: "Validation failed", details: [{ path, message }] }`
- Database is ready to migrate to Postgres/Supabase by changing the Prisma datasource URL
