# AI Rules for TheHomeDesigners Application

This document outlines the core technologies used in this application and provides clear guidelines on which libraries and frameworks to use for specific functionalities.

## Tech Stack Description

*   **React**: The primary JavaScript library for building the user interface.
*   **TypeScript**: Used for type safety and improved code quality across the entire codebase.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly styling components with responsive designs.
*   **React Router**: Manages client-side routing, enabling navigation between different pages and views.
*   **Supabase**: Our backend-as-a-service solution, providing database, authentication, and storage capabilities.
*   **shadcn/ui**: A collection of reusable UI components built with Radix UI and styled with Tailwind CSS.
*   **Lucide React**: A library for beautiful and customizable SVG icons.
*   **Recharts**: A composable charting library built on React components for data visualization.
*   **Google Generative AI (Gemini)**: Integrated via Supabase Edge Functions for AI-powered chatbot functionalities.
*   **Web Speech API**: Utilized for speech-to-text and text-to-speech features in the chatbot.

## Library Usage Rules

To maintain consistency, performance, and ease of development, please adhere to the following guidelines:

*   **UI Components**: Always prioritize `shadcn/ui` components for common UI elements (buttons, forms, modals, etc.). If a specific component is not available or requires significant customization, create a new, small, and focused component.
*   **Styling**: Use Tailwind CSS classes exclusively for all styling. Avoid inline styles or custom CSS files unless absolutely necessary for complex animations or third-party library overrides.
*   **Icons**: Use `lucide-react` for all icons throughout the application.
*   **Routing**: All client-side navigation must be handled using `react-router-dom`. Keep route definitions centralized in `src/App.tsx`.
*   **State Management**: For local component state, use React's `useState` and `useReducer` hooks. For global or shared state, custom hooks (like `useAuth`, `useDesignerProfile`) are preferred, leveraging Supabase for data persistence.
*   **Backend Interactions (DB, Auth, Storage)**: All interactions with the backend (database queries, authentication, file storage) must be done using the `@supabase/supabase-js` client.
*   **Data Visualization**: For displaying charts and graphs, use the `recharts` library.
*   **AI/LLM Integration**: All AI-related logic and interactions with large language models (like Google Gemini) should be encapsulated within Supabase Edge Functions. The client-side should call these functions.
*   **Speech Functionality**: For voice input (speech-to-text) and voice output (text-to-speech), use the native Web Speech API.
*   **Modals**: For custom modal implementations, create dedicated React components (e.g., `AuthModal`, `VideoModal`).