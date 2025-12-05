# Dynamic Survey Form Builder

A comprehensive full-stack survey creation and management system built with React, TypeScript, Material UI, and Supabase.

## Features

### Survey Creation
- Intuitive drag-and-drop interface
- Multiple question types:
  - Text input
  - Multiple choice (radio buttons)
  - Checkboxes (multi-select)
  - Dropdown menus
  - Star ratings
  - Date picker
  - Time picker
- Question customization:
  - Required fields
  - Help text
  - Custom validation rules
- Survey settings and theming
- Real-time preview

### Response Collection
- Public shareable survey links
- Responsive form design
- Progress indicator
- Anonymous or email-based responses
- Real-time submission

### Analytics Dashboard
- Total response count
- Completion rate tracking
- Question-by-question analytics:
  - Bar charts for multiple choice
  - Pie charts for rating distribution
  - Text response listing
- Recent responses table
- Export to CSV or JSON

### User Management
- Email/password authentication
- Personal survey dashboard
- Survey management (create, edit, delete, publish)
- Access control

## Tech Stack

### Frontend
- React 18
- TypeScript
- Material UI (MUI)
- React Router
- Recharts (data visualization)
- React Hook Form
- Supabase Client

### Backend
- Supabase PostgreSQL (database)
- Supabase Auth (authentication)
- Supabase Edge Functions (serverless functions)
- Row Level Security (RLS) policies

## Project Structure

```
survey-builder/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer, Layout, ProtectedRoute
│   │   └── survey-builder/  # QuestionList, AddQuestionDialog
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/
│   │   ├── useSurveys.ts   # Survey CRUD operations
│   │   └── useQuestions.ts  # Question management
│   ├── lib/
│   │   └── supabase.ts      # Supabase client configuration
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SurveyBuilderPage.tsx
│   │   ├── SurveyTakePage.tsx
│   │   └── AnalyticsPage.tsx
│   └── App.tsx
├── supabase/
│   ├── functions/
│   │   ├── submit-response/
│   │   ├── get-analytics/
│   │   └── export-responses/
│   └── migrations/
└── docs/
```

## Database Schema

### Tables
1. **surveys** - Survey metadata and settings
2. **survey_questions** - Individual questions with types and options
3. **survey_responses** - Response sessions
4. **response_answers** - Individual answers (flexible JSON storage)

### Edge Functions
1. **submit-response** - Handles survey response submission
2. **get-analytics** - Aggregates analytics data
3. **export-responses** - Exports data as CSV/JSON

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd survey-builder
   pnpm install
   ```

3. Set up Supabase:
   - Create a new Supabase project
   - Run database migrations (see deployment guide)
   - Deploy edge functions
   - Enable email authentication

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials

5. Start development server:
   ```bash
   pnpm dev
   ```

## Deployment

See [Deployment Guide](../docs/deployment-guide.md) for detailed instructions.

Quick steps:
1. Set up Supabase database tables
2. Apply RLS policies
3. Deploy edge functions
4. Build frontend: `pnpm build`
5. Deploy `dist` folder to hosting provider

## Usage

### Creating a Survey
1. Sign up or log in
2. Click "Create Survey" from dashboard
3. Enter survey title and description
4. Add questions using different question types
5. Configure question settings (required, help text, options)
6. Save and publish

### Sharing a Survey
1. Go to dashboard
2. Click the link icon on your survey
3. Share the copied link with respondents

### Viewing Analytics
1. Go to dashboard
2. Click the analytics icon on your survey
3. View response statistics and charts
4. Export data as needed

## Security

- Row Level Security (RLS) enabled on all tables
- User authentication required for survey creation
- Public access only to published surveys
- Survey owners can only access their own data
- Edge functions validate user permissions

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

### Linting
```bash
pnpm lint
```

## License

MIT License

## Support

For issues and questions, please refer to the documentation in the `docs/` directory.
