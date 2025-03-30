# 🏡MyDream

A modern real estate platform built with React, Supabase, and Google Maps, allowing users to search, list, and manage properties for sale or rent.

## 🌟 Features

- **User Authentication**
  - Email-based signup and signin
  - Profile management
  - Automatic welcome emails

- **Property Listings**
  - Advanced property search and filtering
  - Interactive map integration
  - Detailed property views
  - Support for both sale and rental properties

- **Search Capabilities**
  - Filter by property type, price range, bedrooms, bathrooms
  - Location-based search with map integration
  - City and state filtering
  - Real-time search results

- **Responsive Design**
  - Mobile-first approach
  - Optimized for all screen sizes
  - Touch-friendly interface

## 🚀 Tech Stack

- **Frontend**
  - React (Vite)
  - TypeScript
  - Tailwind CSS
  - React Router DOM
  - React Hot Toast

- **Backend**
  - Supabase (Database & Authentication)
  - PostgreSQL
  - Row Level Security (RLS)

- **External Services**
  - Google Maps API
  - EmailJS for email notifications

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher)
- npm or yarn
- A Supabase account
- A Google Maps API key
- An EmailJS account

## ⚙️ Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
```

## 🛠️ Installation

1. Create a new Vite project with React and TypeScript:
   ```bash
   npm create vite@latest r-estate-market -- --template react-ts
   cd r-estate-market
   ```

2. Install core dependencies:
   ```bash
   npm install @supabase/supabase-js       # Supabase client
   npm install @react-google-maps/api       # Google Maps React components
   npm install react-router-dom             # Routing
   npm install react-hot-toast             # Toast notifications
   npm install @emailjs/browser            # EmailJS for emails
   npm install lucide-react                # Icons
   ```

3. Install Tailwind CSS and its dependencies:
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. Set up Tailwind CSS configuration in `tailwind.config.js`:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

5. Add Tailwind directives to `./src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

6. Set up environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   ```

7. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - Run the migration files in the `supabase/migrations` folder in order:
     ```sql
     -- Run these in Supabase SQL editor in order:
     1. 20240315000000_create_properties_table.sql
     2. 20240315000003_create_profiles_table.sql
     3. 20240320000001_storage_policies.sql
     4. 20240315000002_add_email_notifications.sql
     5. 20240320000003_add_sample_properties.sql (optional)
     ```

8. Start the development server:
   ```bash
   npm run dev
   ```

9. Build for production:
   ```bash
   npm run build
   ```

## 📦 Package Versions

Here are the specific versions of major dependencies:

```json
{
  "dependencies": {
    "@emailjs/browser": "^4.3.3",
    "@react-google-maps/api": "^2.19.3",
    "@supabase/supabase-js": "^2.39.8",
    "lucide-react": "^0.358.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.22.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.6"
  }
}
```

## 📁 Project Structure

```
r-estate-market/
├── src/
│   ├── components/      # Reusable components
│   ├── context/        # React context providers
│   ├── lib/            # Utility libraries
│   ├── pages/          # Page components
│   └── utils/          # Helper functions
├── supabase/
│   └── migrations/     # Database migrations
├── public/             # Static assets
└── .env               # Environment variables
```

## 🔐 Database Structure

### Properties Table
- Stores property listings with details like:
  - Basic info (title, description)
  - Pricing (sale price or rental details)
  - Location data
  - Property features
  - Owner information

### Profiles Table
- Manages user profiles with:
  - User authentication links
  - Personal information
  - Email preferences

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Flexible grid layouts
- Mobile-optimized filters
- Touch-friendly interface
- Adaptive map display
- Responsive property cards
- Mobile-friendly modals

## 🔄 API Integration

### Google Maps
- Interactive property location display
- Location search functionality
- Custom markers for properties
- Map centering based on search

### EmailJS
- Welcome email notifications
- Property inquiry emails
- Contact owner functionality

## 🛡️ Security Features

- Row Level Security (RLS) policies
- Secure authentication flow
- Protected API endpoints
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

-Ruturaj Deshmukh
