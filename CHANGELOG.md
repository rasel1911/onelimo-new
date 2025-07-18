# Changelog

All notable changes to this project will be documented in this file.

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