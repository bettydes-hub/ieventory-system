# Inventory System Frontend

A modern React-based inventory management system built with Ant Design (AntD) following clean, professional design principles.

## Design Principles

### Layout Structure
- **Ant Design Layout**: Uses AntD's Layout component with Sidebar + Header + Content structure
- **Dark Sidebar**: Professional dark theme (#001529) with gradient header
- **White Content**: Clean white content area with subtle shadows
- **Responsive Design**: Sidebar collapses to hamburger menu on mobile devices

### Color Scheme
- **Primary Brand Color**: Blue (#1890ff) - used consistently throughout the application
- **Success**: Green (#52c41a)
- **Warning**: Orange (#faad14) 
- **Error**: Red (#ff4d4f)
- **Info**: Blue (#1890ff)

### Navigation
- **Primary Navigation**: Home, Inventory, Requests, Deliveries, Reports
- **Secondary Navigation**: Categories, Stores, Suppliers, Damage Reports, Search
- **Icons**: Uses AntD icons for consistent visual language
- **Active States**: Clear visual feedback for current page

### Notifications
- **Badge System**: Shows unread notification count
- **Dropdown Menu**: Detailed notification list with categorization
- **Alert Types**: Success, Warning, Error, Info with appropriate colors and icons

### Responsive Behavior
- **Desktop**: Fixed sidebar with collapse/expand functionality
- **Tablet**: Sidebar auto-collapses at lg breakpoint (992px)
- **Mobile**: Hamburger menu with drawer overlay
- **Breakpoints**: Follows AntD's responsive grid system

## Technology Stack

- **React 18** with TypeScript
- **Ant Design 5.x** for UI components
- **React Router** for navigation
- **Redux Toolkit** for state management
- **React Query** for data fetching
- **Vite** for build tooling

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx              # Main layout with sidebar and header
│   └── NotificationDropdown.tsx # Notification system component
├── pages/                      # Page components
├── hooks/                      # Custom React hooks
├── services/                   # API service functions
├── store/                      # Redux store and slices
├── theme/                      # Theme configuration
│   └── index.ts               # Brand colors and AntD theme overrides
└── types/                      # TypeScript type definitions
```

## Theme Configuration

The application uses a centralized theme configuration in `src/theme/index.ts` that includes:
- Brand color definitions
- AntD theme token overrides
- Component-specific styling
- Responsive breakpoints
- Common style utilities

## Features

- ✅ Modern Ant Design UI components
- ✅ Dark sidebar with white content theme
- ✅ Responsive design with mobile support
- ✅ Notification system with badges and dropdowns
- ✅ Consistent brand colors throughout
- ✅ Professional navigation with icons
- ✅ TypeScript support
- ✅ Redux state management
- ✅ React Query for data fetching

## Development Guidelines

1. **Components**: Use AntD components as the foundation
2. **Styling**: Leverage the centralized theme configuration
3. **Colors**: Use brand colors from the theme file
4. **Icons**: Use AntD icons for consistency
5. **Responsive**: Test on mobile, tablet, and desktop
6. **Accessibility**: Follow AntD's accessibility guidelines