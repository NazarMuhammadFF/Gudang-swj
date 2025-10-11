# BekasBerkah - E-commerce Template for Second-Hand Goods

**Version 1.0.0** | A modern, functional demo e-commerce platform for buying and selling curated second-hand goods.

## 🎯 Project Overview

BekasBerkah is a fully functional e-commerce template that demonstrates a complete workflow for a second-hand goods marketplace with centralized curation. This project serves as a showcase for developers and potential clients, featuring both admin and user-facing interfaces.

### Key Features

- **Admin Dashboard**: Comprehensive product, category, order, and submission management
- **User Storefront**: Product browsing, search/filter, shopping cart, and checkout
- **Seller Portal**: Simple item submission process with tracking
- **Local Storage**: Client-side data persistence using IndexedDB (Dexie.js)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Stack**: Built with Next.js 15, TypeScript, and Shadcn/ui

## 🚀 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Next.js 15 (App Router) | React framework with server components |
| Language | TypeScript | Type-safe development |
| Database | Dexie.js (IndexedDB) | Client-side local storage |
| Styling | Tailwind CSS | Utility-first CSS framework |
| UI Components | Shadcn/ui | Beautiful, accessible components |
| Icons | Lucide React | Icon library |
| Forms | React Hook Form + Zod | Form handling and validation |
| Package Manager | Bun | Fast JavaScript runtime and package manager |

## 📦 Installation

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/NazarMuhammadFF/Gudang-swj.git
   cd Gudang-swj
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run development server**
   ```bash
   bun run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
gudang-swj/
├── .github/
│   └── copilot-instructions.md  # AI coding assistant guidelines
├── doc/
│   ├── prd.md                   # Product Requirements Document
│   ├── plan.md                  # Development plan
│   └── todo.md                  # Detailed task breakdown
├── src/
│   ├── app/                     # Next.js app router pages
│   │   ├── admin/              # Admin panel pages
│   │   │   ├── page.tsx        # Admin dashboard
│   │   │   └── products/       # Product management
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   └── ui/                 # Shadcn/ui components
│   └── lib/
│       ├── database.ts         # Dexie database schema
│       └── utils.ts            # Utility functions
├── public/                      # Static assets
├── components.json              # Shadcn/ui configuration
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## 🛠️ Available Scripts

```bash
# Development
bun run dev          # Start development server with Turbopack
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint

# Shadcn/ui Components
bunx shadcn@latest add <component-name>  # Add new UI component
```

## 🎨 Adding Shadcn/ui Components

To add a new Shadcn/ui component:

```bash
bunx shadcn@latest add button
bunx shadcn@latest add card
bunx shadcn@latest add dialog
# etc.
```

Components are automatically added to `src/components/ui/`

## 📋 Development Workflow

This project follows a structured development workflow:

1. **Main Branch**: `main` - Production-ready code
2. **Development Branch**: `dev` - Main working branch
3. **Feature Branches**: `feature/<feature-name>` - Individual features

### Branch Workflow

```bash
# Start from dev branch
git checkout dev

# Create feature branch
git checkout -b feature/category-management

# After completion and approval, merge to dev
git checkout dev
git merge feature/category-management

# Deploy to main when ready
git checkout main
git merge dev
```

## 🗄️ Database Schema

The application uses Dexie.js for local IndexedDB storage:

### Tables

- **products**: Product catalog (id, name, description, price, category, image, status, timestamps)
- **categories**: Product categories (id, name, description, timestamp)
- **submissions**: Seller submissions (pending implementation)
- **orders**: Customer orders (pending implementation)

## 📱 Features Roadmap

### Phase 1: Admin Module (In Progress)
- [x] Admin Dashboard with overview widgets
- [x] Product Management (CRUD)
- [ ] Category Management (CRUD)
- [ ] Submission Review Interface
- [ ] Order Management

### Phase 2: User Storefront (Planned)
- [ ] Product Gallery & Listing
- [ ] Product Detail Pages
- [ ] Search & Filter
- [ ] Shopping Cart
- [ ] Checkout Process
- [ ] Seller Submission Form
- [ ] User Account Page

### Phase 3: Polish & Testing (Planned)
- [ ] Mock Data Population
- [ ] Responsive Design Testing
- [ ] End-to-End User Journey Testing
- [ ] Performance Optimization
- [ ] Deployment to Vercel

## 🤝 Contributing

This is a demo project. For development guidelines, see:
- [Product Requirements](./doc/prd.md)
- [Development Plan](./doc/plan.md)
- [Task Breakdown](./doc/todo.md)
- [Copilot Instructions](./.github/copilot-instructions.md)

## 📄 License

This project is for demonstration purposes.

## 🔗 Links

- **Repository**: [https://github.com/NazarMuhammadFF/Gudang-swj](https://github.com/NazarMuhammadFF/Gudang-swj)
- **Documentation**: See `doc/` folder for detailed documentation

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
