# 🧭 iOS Safari Clone

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A pixel-perfect, fully functional frontend clone of iOS Safari built with React, TypeScript, Tailwind CSS, and Motion. It faithfully replicates the look, feel, fluid animations, and core mechanics of Apple's flagship mobile web browser.

**Repository:** [https://github.com/aryaxzell/iOS-Safari-Clone](https://github.com/aryaxzell/iOS-Safari-Clone)

---

## ✨ Key Features

- **Authentic UI/UX:** Accurately mimics iOS Safari's signature bottom navigation bar, floating toolbars, and iconic frosted glass (backdrop blur) styling.
- **Fluid iOS Animations:** Employs `motion/react` to recreate buttery-smooth native physics for bottom sheets, tab transitions, and popover menus.
- **Live Browsing Capabilities:** Features a real, functional address bar powered by an `<iframe>` engine. It intelligently differentiates between URLs and search queries (routing queries to Google Search).
- **Customizable Start Page:** Fully working Start Page configuration! Toggle visibility for:
  - Favorites
  - Frequently Visited
  - Privacy Report
  - Shared with You 
  - Siri Suggestions
  - Reading List
  - Recently Closed Tabs
- **Bookmark & History Management:** 
  - Add to Bookmarks and Reading List directly from the action menu.
  - Sort bookmarks by *Favorites* or *Title*.
  - Automatically fetches domain icons (favicons) for saved and frequently visited sites.
- **Dark Mode Optimization:** Adapts perfectly to system themes, utilizing authentic iOS dark variants like pure black backgrounds (`#000000`) and standard dark interface tokens (`#1C1C1E`).

## 🛠 Tech Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Utility-first styling with custom iOS color tokens and backdrop blurs)
- **Animations:** Motion (`motion/react`)
- **Accessible UI Components:** [Radix UI](https://www.radix-ui.com/) (Tabs, Dialogs, Popovers)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Installation & Local Development

To run this project locally on your machine, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/aryaxzell/iOS-Safari-Clone.git
   cd iOS-Safari-Clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Preview**
   Open `http://localhost:3000` in your web browser. *(Note: For the best visual experience, view it locally via Chrome DevTools in Mobile view or on an actual mobile device).*

## 🏗 Architecture & Technical Details

- **Responsive Viewport:** Uses `100dvh` extensively to ensure the UI behaves natively across varying mobile screen heights without jumping when the browser's native toolbars retract.
- **Iframe Sandboxing:** To mimic the page-loading experience, targeted websites are loaded inside sandboxed `<iframe>` tags. *Note: Certain websites employ `X-Frame-Options: DENY` which restricts them from loading inside an iframe. Searching is handled seamlessly by utilizing Google's iframe-compatible endpoint.*
- **State Management:** Manages transient navigation history, start page toggles, and bookmarks locally via robust React state handlers.

## 📝 Disclaimer

This project is created strictly for **educational and portfolio purposes**. I am not affiliated with Apple Inc. All design concepts, icons, and trademarks related to iOS and Safari belong to Apple Inc.

---

*Crafted by [aryaxzell](https://github.com/aryaxzell)*
