# Copilot Instructions for BekasBerkah Project

## Core Rules

- **Always read prd.md**: Before any development work, review the Product Requirements Document to understand the project scope and goals.

- **Always read plan.md and check pending tasks**: Review the project plan and current todo list to identify incomplete tasks and prioritize work accordingly.

- **Always use bun**: Use `bun` for all package management operations (install, add, run, etc.).

- **Shadcn component addition**: When adding Shadcn/ui components, always use the command: `bunx shadcn@latest add <component-name>`

- **Task completion**: Only mark tasks as completed when the author explicitly approves and confirms the task. Do not self-check tasks.

- **SOLID principles**: Always adhere to SOLID principles for folder structure and code organization in all files.

- **Shadcn initialization**: Remember that Shadcn/ui has already been initialized in the project. Do not re-initialize it.

## Branch Management Rules

- **Main working branch**: The `dev` branch is the primary working branch. All development work starts from `dev`.
- **Feature branches**: When working on a new feature, create a feature branch from `dev`. After completing the feature and getting author approval, merge the feature branch back into `dev`.
- **Merge process**: Only merge feature branches into `dev` when the feature is fully approved and confirmed by the author. Do not merge incomplete or unapproved work.

## Development Guidelines

- Maintain clean, maintainable code following TypeScript best practices
- Use Dexie.js for local data storage as specified in the tech stack
- Ensure all features are demo-functional and work in browser environment
- Follow the phased development approach outlined in plan.md
- Test user journeys thoroughly before considering features complete