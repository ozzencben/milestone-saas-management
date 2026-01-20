// generateReadme.js
import fs from "fs";

const projectData = {
  name: "Milestone: Freelance Project Management System",
  tagline:
    "The all-in-one hub for independent developers and small teams to manage the entire project lifecycle.",
  author: "Özenç Dönmezer",
  techStack: [
    { area: "Frontend", tech: "Next.js (App Router), TypeScript, CSS Modules" },
    { area: "Backend", tech: "Node.js, Express, JWT Authentication" },
    { area: "Database", tech: "PostgreSQL, Prisma ORM" },
    { area: "Tools", tech: "Axios, Context API, Lucide Icons" },
  ],
  features: [
    "**Project CRUD**: Complete project lifecycle management.",
    "**Team & Role Management**: Invite members, assign roles (Owner, Developer, Client).",
    "**Task System**: Personal focus boards and project-based checklists.",
    "**Activity Logging**: Track every milestone and update in real-time.",
    "**Notification System**: Integrated alerts for team invitations and project updates.",
  ],
};

const readmeContent = `
# ${projectData.name}

${projectData.tagline}

---

## 🚀 Overview
**Milestone** is a comprehensive Full-Stack SaaS platform built to solve the fragmentation in freelance workflows. Instead of jumping between multiple tools, developers can now centralize their projects, tasks, and team communications in one professional dashboard.

### Why I built this?
This project represents a year of intensive development, focusing on solving real-world productivity issues for freelancers. It demonstrates a deep understanding of modern web architectures, state management, and database design.

## 🛠️ Technology Stack
| Area | Technology |
| :--- | :--- |
${projectData.techStack.map((item) => `| **${item.area}** | ${item.tech} |`).join("\n")}

## ✨ Key Features
${projectData.features.map((feature) => `* ${feature}`).join("\n")}

## 📂 Project Structure
\`\`\`text
├── client/          # Next.js frontend application
├── server/          # Express.js backend & Prisma schema
└── README.md        # This documentation
\`\`\`

## 🔧 Installation & Setup

1. **Clone the repo:**
   \`\`\`bash
   git clone https://github.com/ozencdonmezer/milestone-management-system.git
   \`\`\`

2. **Setup Server:**
   \`\`\`bash
   cd server && npm install
   # Create .env with DATABASE_URL
   npx prisma generate
   npm run dev
   \`\`\`

3. **Setup Client:**
   \`\`\`bash
   cd client && npm install
   npm run dev
   \`\`\`

---

## 👨‍💻 Created by
**${projectData.author}** - *Full Stack Developer*
Focused on building scalable SaaS products and efficient development workflows.

---
*Generated automatically via Node.js script.*
`;

try {
  fs.writeFileSync("README.md", readmeContent.trim());
  console.log("✅ README.md successfully generated!");
} catch (err) {
  console.error("❌ Error generating README:", err);
}
