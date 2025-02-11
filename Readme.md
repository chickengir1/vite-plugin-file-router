# vite-plugin-pages-router

**vite-plugin-pages-router** is a plugin that enables Next.js-style file-based routing for Vite and React projects.  
It automatically scans `.tsx` page files in the `src/pages` directory and generates routing configurations via virtual modules.  
The plugin also automatically imports and applies user-provided **404 page** and **loading component** from the specified options.

> **Note:**  
> This plugin does not physically create a `RouterConfig.tsx` file on disk.  
> Instead, it leverages Vite's virtual module system to provide the `<RouterConfig />` React component internally,  
> allowing file-based routing without requiring separate router configuration files.

---

## Installation

```bash
# npm install
npm install vite-plugin-pages-router
```

---

## Usage

### 1. Configure Vite Config File

Import and register the plugin in your `vite.config.ts` file with desired options.  
The plugin serves two roles:

- **Vite Plugin:**
  - Import the plugin function from `vite-plugin-pages-router/plugin`.
- **React Router Configuration Component:**
  - Import the virtual module from the main package (`vite-plugin-pages-router`) to use `<RouterConfig />` in your app.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import createFileRouterPlugin from "vite-plugin-pages-router/plugin";

export default defineConfig({
  plugins: [
    react(),
    createFileRouterPlugin({
      pagesDir: "src/pages", // Directory containing page components
      notFoundPage: "src/pages/404.tsx", // 404 error page component path
      loadingComponent: "src/components/Loading.tsx", // Loading component path
    }),
  ],
  // Optional alias configuration (e.g., "src" path mapping)
  resolve: {
    alias: {
      src: "/src",
    },
  },
});
```

---

### 2. Create Page Components

Create page components inside the `src/pages` directory.  
Examples for a home page and an about page:

#### Home Page Example (`src/pages/index.tsx`)

```tsx
// src/pages/index.tsx
import React from "react";

function HomePage(): JSX.Element {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">Home Page</h1>
      <p>Welcome!</p>
    </div>
  );
}

export default HomePage;
```

#### About Page Example (`src/pages/about.tsx`)

```tsx
// src/pages/about.tsx
import React from "react";

function AboutPage(): JSX.Element {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">About Page</h1>
      <p>This is an example of file-based routing using the plugin.</p>
    </div>
  );
}

export default AboutPage;
```

---

### 3. Create 404 Page and Loading Component

#### 404 Page Example (`src/pages/404.tsx`)

```tsx
// src/pages/404.tsx
import React from "react";

function NotFoundPage(): JSX.Element {
  return (
    <div className="p-4 text-center text-red-500">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      <p>Sorry, the requested page does not exist.</p>
    </div>
  );
}

export default NotFoundPage;
```

#### Loading Component Example (`src/components/Loading.tsx`)

```tsx
// src/components/Loading.tsx
import React from "react";

function Loading(): JSX.Element {
  return (
    <div className="p-4 text-center">
      <p className="text-lg">Loading...</p>
    </div>
  );
}

export default Loading;
```

---

### 4. Use in App Component

Import the `<RouterConfig />` component from the virtual module provided by the plugin in your app.

```tsx
// src/App.tsx
import React from "react";
import RouterConfig from "vite-plugin-pages-router"; // Provided via virtual module

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <RouterConfig />
    </div>
  );
}

export default App;
```

---

### 5. Run the Project

Start the Vite dev server to verify functionality:

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.  
The file-based routing will render `/` (Home), `/about` (About), and other pages automatically.  
Accessing an invalid route will display the 404 page, and page transitions will show the loading component.

---

## How It Works

- **Automatic File Scanning:**
  The plugin scans all `.tsx` files in `src/pages` to generate route paths:

  - `index.tsx` → `/`
  - `about.tsx` → `/about`
  - `[id].tsx` → `/:id`

- **Loading & 404 Handling:**

  - If `loadingComponent` is provided, it is used as the `<Suspense fallback={...}>`.  
    Default: `<div>Loading...</div>`.
  - If `notFoundPage` is provided, it is used for 404 routes.  
    Default: `<div>404 Not Found</div>`.

- **Virtual Module:**
  The plugin provides the `<RouterConfig />` component via Vite's virtual module system.  
  This component includes `<BrowserRouter>`, `<Suspense>`, `<Routes>`, and 404 handling.  
  Routes automatically update when page files are added/removed.

---

By installing and configuring this plugin, you can implement file-based routing without manual router setup.

For questions or issues, visit [GitHub Issues](https://github.com/chickengir1/vite-plugin-pages-router/issues).

---

> **Tip:** File-based routing mirrors your directory structure, automatically updating routes as you add/remove pages.  
> This significantly improves development efficiency.
