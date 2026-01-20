# Milestone: Freelance Project Management System

The all-in-one hub for independent developers and small teams to manage the entire project lifecycle.

---

## 🚀 Overview

**Milestone** is a comprehensive Full-Stack SaaS platform built to solve the fragmentation in freelance workflows. Instead of jumping between multiple tools, developers can now centralize their projects, tasks, and team communications in one professional dashboard.

### Why I built this?

Milestone was born out of a necessity to bridge the gap between freelance developers and their clients. Managing complex projects, tracking granular milestones, and maintaining transparent communication often require multiple disjointed tools.

I developed this platform to centralize the entire project lifecycle. It serves as a comprehensive demonstration of modern full-stack capabilities, focusing on:

- **Workflow Optimization**: Streamlining the journey from the first milestone to final delivery.
- **Architecture**: Implementing a scalable monorepo structure with high-performance tech stacks.
- **User Experience**: Solving real-world productivity friction with an intuitive, dashboard-driven interface.

## 🛠️ Technology Stack

| Area         | Technology                                    |
| :----------- | :-------------------------------------------- |
| **Frontend** | Next.js (App Router), TypeScript, CSS Modules |
| **Backend**  | Node.js, Express, JWT Authentication          |
| **Database** | PostgreSQL, Prisma ORM                        |
| **Tools**    | Axios, Context API, Lucide Icons              |

## ✨ Key Features

- **Project CRUD**: Complete project lifecycle management.
- **Team & Role Management**: Invite members, assign roles (Owner, Developer, Client).
- **Task System**: Personal focus boards and project-based checklists.
- **Activity Logging**: Track every milestone and update in real-time.
- **Notification System**: Integrated alerts for team invitations and project updates.

## 📂 Project Structure

```text
├── client/          # Next.js frontend application
├── server/          # Express.js backend & Prisma schema
└── README.md        # This documentation
```

## 🔧 Installation & Setup

### 1. Prerequisites

- Node.js (v18 or higher)
- PostgreSQL Database
- npm or yarn

### 2. General Setup

\`\`\`bash
git clone https://github.com/ozzencben/milestone-saas-management.git
cd milestone-management-system
\`\`\`

### 3. Backend Setup (Server)

\`\`\`bash
cd server
npm install

# Configure your .env file (DATABASE_URL, JWT_SECRET etc.)

npx prisma generate
npm run dev # For development
\`\`\`

### 4. Frontend Setup (Client)

\`\`\`bash
cd client
npm install
npm run dev # For development
\`\`\`

---

## 🏗️ Production & Deployment

### Build for Production

To prepare the project for a live environment, you need to generate optimized builds:

**Server:**
\`\`\`bash
cd server
npm run build # This will generate the /dist folder
npm start # Starts the compiled server
\`\`\`

**Client:**
\`\`\`bash
cd client
npm run build # Generates the /.next optimized production build
npm start # Starts the Next.js production server
\`\`\`

> **Note:** For the backend, Ensure your \`package.json\` has a build script (e.g., \`"build": "tsc"\`) to generate the \`dist\` folder from TypeScript files.

---

## 👨‍💻 Created by

**Özenç Dönmezer** - _Full Stack Developer_
Focused on building scalable SaaS products and efficient development workflows.

---

_Generated automatically via Node.js script._
