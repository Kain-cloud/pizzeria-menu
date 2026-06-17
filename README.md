# Pizzeria Ardi - Digital Menu & Admin Panel

A modern, offline-capable digital restaurant menu with a built-in admin panel, real-time updates, AI translations, and an AI-powered chatbot.

## Features

**For Customers:**
- 📱 Responsive, app-like mobile experience
- 🌐 Multi-language support (English, Italian, Spanish)
- 📶 Offline caching (works even with poor restaurant Wi-Fi)
- 💬 AI Chatbot (Gemini) to answer questions about dishes and allergens
- 🔍 Fast client-side search across languages

**For Admins:**
- 🔐 Secure admin panel (accessible at `/admin`)
- 🍕 Manage categories and menu items
- 🖼️ Image upload directly to Supabase Storage
- ✨ Auto-translate dishes into Italian and Spanish using Gemini AI
- 📊 Analytics dashboard tracking dish views and category popularity
- 🔄 Real-time live sync to connected customer menus

## Setup & Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root based on `.env.example`:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```
   *Note: For the Gemini API Key, it is recommended to restrict usage to your specific domain via Google Cloud Console since it is called from the client.*

3. **Supabase Setup:**
   Run the SQL commands found in `supabase/schema.sql` in your Supabase SQL Editor. This will set up:
   - `categories`, `menu_items`, and `menu_views` tables
   - Row Level Security (RLS) policies
   - Real-time subscriptions

4. **Storage Bucket:**
   In the Supabase Dashboard, go to **Storage** and create a new bucket named `menu-images`. Set it to **Public**.

5. **Initial Data (Optional):**
   To populate initial categories, run:
   ```bash
   node setup-data.js
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Database/Auth/Storage:** Supabase
- **AI/LLM:** Google Gemini API
- **i18n:** react-i18next
