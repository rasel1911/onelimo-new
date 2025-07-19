# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2025-07-20

### Added

- **Persistent Registration Links System**: Implemented a comprehensive system for creating permanent service provider registration links that never expire
  - Added database schema for persistent registration links with usage tracking
  - Created admin interface for managing persistent links (create, edit, delete, activate/deactivate)
  - Added server-side data fetching with Suspense for optimal loading performance
  - Implemented real-time updates using Next.js `revalidatePath()` for immediate UI updates
- **URL Parameter Optimization**: Changed registration link parameter from `persistent=` to `ref=` for cleaner, shorter URLs
- **Performance Optimizations**: Refactored components following Next.js best practices
  - Separated server and client components for better performance
  - Added Suspense boundaries for non-blocking data loading
  - Created dedicated loading and error components with skeleton UI
  - Implemented optimistic updates for better user experience

### Changed

- **Partner Registration Flow**: Updated to support both temporary tokens and persistent links
- **Database Migration**: Added `PersistentRegistrationLink` table with proper indexing and constraints
- **Component Architecture**: Refactored persistent links page to use server components with client-side interactions only where needed
- **State Management**: Removed client-side state management in favor of server-side revalidation for better consistency

### Fixed

- **URL Generation Bug**: Fixed issue where persistent link URLs showed "[object Promise]" instead of actual URLs
- **Real-time Updates**: Fixed table not updating immediately after create/edit/delete operations
- **Loading States**: Improved loading experience with proper skeleton components and Suspense boundaries

### Technical Improvements

- Updated drizzle-kit from 0.25.0 to 0.31.4 for latest features and bug fixes
- Added proper error boundaries and loading states for better user experience
- Implemented server actions with automatic cache revalidation
- Created utility functions for URL generation that work in both server and client contexts

## [0.1.0] - 2025-07-18

### Added

- Added comprehensive authentication and authorization logging for debugging protected routes and user flows.
- Implemented callback URL preservation for login redirects from protected routes (admin, booking form, concierge).
- Added admin route protection in middleware matcher to ensure authentication checks for all admin pages.
- Added admin role checking in the admin layout to ensure only admin users can access admin pages.

### Changed

- Refactored authentication flow to use callback URLs for all protected route redirects, improving user experience after login.
- Cleaned up and minimized logging, keeping only crucial error and access logs for production readiness.
- Improved session callback to always populate user role for downstream checks.
- Updated login page to handle callback URL redirection after successful authentication.
- Simplified and clarified logic in `auth.config.ts` for route protection and redirection.

### Fixed

- Fixed bug where admin users were redirected to unauthorized due to missing role in middleware.
- Fixed issue where users were redirected to home instead of their intended destination after login.
- Fixed admin layout to properly handle authentication and role checking, with clear error handling.
- Fixed middleware to ensure all protected routes (including admin) are covered.

### Removed

- Removed verbose and redundant logging from authentication, middleware, and page components.
