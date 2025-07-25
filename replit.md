# OmegaLab - AI Math Tutor

## Overview

OmegaLab is a full-stack web application that serves as an AI-powered math tutor. The application provides multiple input methods for mathematical problems including text input, voice recognition, image uploads, and drawing capabilities. It uses OpenAI's GPT-4o model to provide step-by-step solutions and explanations for mathematical problems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for development
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite with React plugin and custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Service**: Neon Database (serverless PostgreSQL)
- **File Handling**: Multer for multipart form data processing
- **Development**: Custom Vite integration for SSR-like development experience

## Key Components

### Database Schema
- **Users**: Authentication and user management with plan-based features (free/pro)
- **Conversations**: Chat session management tied to users
- **Messages**: Individual messages within conversations with role-based content and metadata storage

### AI Integration
- **Service**: OpenAI GPT-4o integration through dedicated service layer
- **Features**: Math problem solving with step-by-step solutions, confidence scoring, and image analysis
- **Response Format**: Structured JSON responses with solutions, steps, explanations, and confidence levels

### Multi-Modal Input System
- **Text Input**: Standard keyboard input with mathematical symbol shortcuts
- **Voice Input**: Speech-to-text using Web Speech API
- **Image Upload**: File upload with image processing capabilities
- **Drawing Interface**: HTML5 Canvas-based drawing pad for handwritten math

### User Interface Components
- **Chat Interface**: Real-time conversation with AI tutor
- **Drawing Pad**: Canvas-based drawing tool for mathematical notation
- **Math Symbols**: Quick-access mathematical symbol palette
- **Responsive Design**: Mobile-first design with full desktop support

## Data Flow

1. **User Input**: Multiple input methods (text, voice, image, drawing) collected through unified interface
2. **Message Processing**: Input converted to standardized message format with metadata tracking input method
3. **AI Processing**: Messages sent to OpenAI service with context-aware prompts for mathematical problem solving
4. **Response Generation**: Structured responses with solutions, step-by-step explanations, and confidence ratings
5. **Storage**: All conversations and messages persisted to PostgreSQL database
6. **Real-time Updates**: UI updates using optimistic updates and query invalidation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **openai**: Official OpenAI API client
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives

### Development Tools
- **tsx**: TypeScript execution for development
- **vite**: Build tool and development server
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

### Utility Libraries
- **clsx + tailwind-merge**: Conditional CSS class management
- **date-fns**: Date formatting and manipulation
- **wouter**: Lightweight routing library

## Deployment Strategy

### Build Process
- **Client Build**: Vite builds React application to `dist/public`
- **Server Build**: esbuild bundles Express server with external package handling
- **Production**: Single Node.js process serving both API and static assets

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **AI Service**: OpenAI API key configuration with fallback environment variables
- **Development**: Vite development server with HMR and custom middleware integration

### Storage Strategy
- **Development**: In-memory storage implementation for rapid prototyping
- **Production**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

The application follows a monorepo structure with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clear separation between client and server concerns.