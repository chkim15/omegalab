# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build both client and server for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes using Drizzle

### Database Operations
- Database operations use Drizzle ORM with PostgreSQL
- Schema is defined in `shared/schema.ts` and shared across client/server
- Use `npm run db:push` to apply schema changes to the database
- Environment variable `DATABASE_URL` must be set for database connection

## Architecture Overview

### Monorepo Structure
This is a full-stack TypeScript monorepo with three main directories:
- `client/` - React frontend with Vite
- `server/` - Express.js backend with TypeScript
- `shared/` - Shared types, schemas, and utilities

### Key Architectural Patterns

#### Frontend (React + Vite)
- Uses Wouter for lightweight routing
- TanStack Query for server state management
- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with custom theme configuration
- Firebase for authentication and file storage

#### Backend (Express + TypeScript)
- ES modules with `type: "module"` in package.json
- Drizzle ORM for type-safe database operations
- OpenAI integration for AI math tutoring functionality
- Stripe integration for payment processing
- Multer for file upload handling

#### Shared Schema
- Database schema and Zod validation schemas in `shared/schema.ts`
- Type-safe API contracts between client and server
- Uses Drizzle Zod integration for runtime validation

### Multi-Modal Math Input System
The application supports multiple input methods for mathematical problems:
- Text input with mathematical notation
- Voice recognition using Web Speech API
- Image upload and analysis via OpenAI Vision
- Drawing pad using HTML5 Canvas (tldraw integration)
- Math symbol palette for quick insertion

### AI Integration
- OpenAI GPT-4o model integration in `server/services/openai.ts`
- Structured responses with solutions, step-by-step explanations, and confidence scores
- Image analysis for extracting mathematical problems from uploaded images
- Context-aware problem solving with multiple solving modes (answer/hint)

### Database Design
- Users table with plan-based access (free/pro)
- Conversations for chat session management
- Messages with role-based content (user/assistant) and metadata for input methods
- Stripe customer ID integration for payment tracking

### Authentication & Payment
- Simple email/password authentication with auto-user creation for demo purposes
- Stripe integration for Pro plan subscriptions
- Webhook handling for payment status updates
- Plan-based feature access throughout the application

## File Upload & Asset Management
- Uses multer for handling multipart form data
- Image assets stored in `attached_assets/` directory
- Base64 encoding for OpenAI API image analysis
- Metadata tracking for uploaded images in message system

## Development Environment
- Vite development server with custom Express integration
- Hot module replacement (HMR) for React components
- TypeScript path aliases configured for `@/` (client) and `@shared/` (shared)
- Replit-specific plugins for development environment integration

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API authentication
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook validation
- Firebase config variables for authentication and storage

## Testing & Type Safety
- TypeScript strict mode enabled across the entire codebase
- Drizzle ORM provides compile-time type safety for database operations
- Zod schemas ensure runtime type validation
- Use `npm run check` to verify TypeScript compilation before deployment