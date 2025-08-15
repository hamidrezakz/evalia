# Comprehensive Project Guide: Organizational Analysis & Evaluation

## Project Overview

This project is designed to analyze human resources and organizational status. After purchasing a package, organizations participate in training sessions and their staff take personality tests. By combining test results and expert/supervisor feedback, a comprehensive organizational status report is provided to managers. In the future, managers will be able to interact with an AI model to discuss and analyze their organization’s data.

## Key Objectives

- Human resource analysis and management dashboard
- Collecting and normalizing personality test data
- Recording expert and supervisor feedback
- Providing analytical reports and charts
- Preparing data for AI models and management chat
- High scalability and extensibility for future needs

## Architecture & Project Structure (Monorepo)

```
/
├── apps/
│   ├── web/         # Next.js (Frontend)
│   └── api/         # NestJS (Backend)
├── packages/
│   ├── ui/          # Shared UI components (Shadcn/ui)
│   ├── database/    # Prisma schema and client
│   └── core/        # Shared models and logic (optional)
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── README.md
```

## Main Technologies

- **Next.js** (Frontend): Modern UI, SSR/SEO, rapid development
- **NestJS** (Backend): Modular, scalable, and secure API architecture
- **Prisma**: Type-safe ORM for Postgres, migration and data modeling
- **PostgreSQL**: Powerful, secure relational database
- **Shadcn/ui + Tailwind CSS**: Fast, standard UI development with full RTL support
- **Framer Motion**: Professional, smooth UI animations
- **pnpm + Turborepo**: Fast, efficient monorepo and dependency management

## Why Monorepo Architecture?

- Better coordination between teams and sections
- Easy code and data model sharing
- Independent development and deployment for each part
- Easier scalability and maintenance

## Folder Roles

- **apps/web**: Main website, admin panel, dashboard, and landing pages
- **apps/api**: User, organization, test, data analysis, and AI chat API management
- **packages/ui**: Reusable UI components (buttons, forms, tables, etc.)
- **packages/database**: Data models (Prisma), migrations, and database connection
- **packages/core**: Shared models and logic (if needed)

## Development Standards

- TypeScript everywhere
- Consistent naming conventions and folder structure
- Use of lint and prettier for clean code
- Writing tests and documenting code
- Secure management of secrets and environment variables
- Ready for CI/CD and team development

## Getting Started

1. Install pnpm:
   ```powershell
   npm install -g pnpm
   ```
2. Install dependencies:
   ```powershell
   pnpm install
   ```
3. Initialize each app (Next.js and NestJS) as per the guide
4. Run the project:
   ```powershell
   pnpm --filter apps/web dev
   pnpm --filter apps/api start:dev
   ```

## Key Notes for AI Model Development

- Each organization’s data is stored separately and securely (multi-tenant)
- Both raw and normalized data are kept for analysis and AI model training
- Data structure and API are designed to easily generate context and summaries for language models
- Adding new modules (advanced analytics, smart chat, etc.) is straightforward

## Important for Team Members

- Read this file and each folder’s documentation before developing any section
- If you have any questions or ambiguities, check the docs or ask the team lead
- Write clean, documented, and testable code
- Always consider scalability and extensibility

---

> This project is designed for professional, long-term development. Please follow the standards and suggest any improvements to the architecture or development process to the team.
