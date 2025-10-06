# ERD Diagram Generator - AI-Powered Database Designer

> 🏆 Built for the Supabase Hackathon

Transform natural language descriptions into production-ready database schemas in seconds. Describe your app, get an interactive ERD, and deploy tables to Supabase with one click.
🔗 Check it out at: [erddiagram.chat](https://erddiagram.chat)

<img width="947" height="448" alt="1 1" src="https://github.com/user-attachments/assets/095a732d-04ea-45d4-a530-155a63cdb8d5" />
<img width="944" height="439" alt="1 2" src="https://github.com/user-attachments/assets/72e9aeb2-b36c-4dbd-86c2-0ada7cb1a966" />



![ERD Generator](https://img.shields.io/badge/Supabase-Hackathon-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

---

## 🎯 What It Does

**Problem**: Designing database schemas is time-consuming, error-prone, and requires deep PostgreSQL knowledge.

**Solution**: ERD Diagram Generator uses AI to convert plain English descriptions into:
- ✅ Complete database schemas with tables, columns, and relationships
- ✅ Interactive ERD visualizations (Mermaid.js)
- ✅ Production-ready PostgreSQL DDL with constraints, indexes, and foreign keys
- ✅ One-click deployment to Supabase

### Example

**You type**: "A todo app with users, tasks, and comments"

**You get**: A complete schema with:
- `users` table (email, password_hash, email_verified, timestamps)
- `todos` table (title, description, status, user_id, soft delete)
- `todo_comments` table (comment, todo_id, user_id)
- All foreign keys, indexes, and constraints configured
- Audit trails (created_at, updated_at, deleted_at)
- Ready-to-deploy SQL

---

## ✨ Features

### 🤖 AI-Powered Schema Generation
- Converts natural language to comprehensive database schemas
- Follows PostgreSQL and Supabase best practices
- Includes audit trails, soft deletes, and proper relationships
- Generates primary keys, foreign keys, unique constraints, and check constraints

### 📊 Interactive ERD Visualization
- Real-time Mermaid.js diagrams
- Shows tables, columns, relationships, and constraints
- Visual representation of your entire database structure

### 🚀 One-Click Supabase Deployment
- Connect directly to your Supabase project
- Auto-apply schemas with one click
- Or copy SQL for manual execution
- Comprehensive setup instructions included

### 💾 Export Options
- Copy SQL to clipboard
- Download .sql migration files
- Full schema JSON export

---

## 🛠️ Tech Stack

### Frontend
- **React** + **TypeScript** + **Vite**
- **Zustand** for state management
- **Mermaid.js** for ERD visualization
- Dark theme with Supabase branding

### Backend
- **Node.js** + **Express** + **TypeScript**
- **OpenAI GPT-4** for schema generation
- **Zod** for validation
- **@supabase/supabase-js** for database integration

### Deployment
- **Render** for hosting (frontend + backend)
- Custom domain with SSL
- Environment-based configuration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key
- Supabase account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/erd-generator.git
   cd erd-generator
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env-template .env
   # Add your OPENAI_API_KEY to .env
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open** http://localhost:5173

---

## 🔧 Configuration

### Backend Environment Variables
Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables
The frontend automatically uses `http://localhost:3001` for development.

For production, set `VITE_API_URL` to your backend URL.
---

## 🎮 Usage Guide

### 1. Generate Schema
- Type a description in the chat: "e-commerce app with products, orders, and customers"
- AI generates a complete schema with all necessary tables

### 2. Review ERD
- View the interactive diagram
- See all tables, columns, and relationships
- Check constraints and indexes

### 3. Export SQL
- Click "View SQL" to see the full DDL
- Copy or download the SQL file

### 4. Deploy to Supabase
- Click "Connect to Supabase"
- Enter your project URL and service role key
- Choose auto-apply or manual copy/paste

### 5. One-Time Setup (for auto-apply)
Run this in your Supabase SQL Editor:
```sql
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
AS $$ BEGIN EXECUTE query; END; $$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
```

---

## 🏗️ Architecture

```
┌─────────────────┐
│   React App     │  User describes app in plain English
│  (Zustand)      │
└────────┬────────┘
         │ API Request
         ▼
┌─────────────────┐
│  Express API    │  Routes, validation, orchestration
│   (TypeScript)  │
└────────┬────────┘
         │
    ┌────┴─────┐
    ▼          ▼
┌────────┐  ┌─────────────┐
│OpenAI  │  │  Supabase   │
│GPT-4   │  │  Client     │
└────────┘  └─────────────┘
Schema       Direct SQL
Generation   Execution
```

---


Built with ❤️ for the Supabase Hackathon



**⭐ If you find this useful, please star the repo!**

