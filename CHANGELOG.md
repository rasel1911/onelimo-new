# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### TODO:

* [ ] Investigate why only one quote is being displayed.
* [ ] Ensure quote selection logic doesn't automatically hide other valid options.
* [ ] Update UI to show all quotes when multiple are returned.
* [ ] Ensure consistency between SMS message and in-app display.


## [0.2.0] - 2025-08-05

### Added

- **Location Autocomplete System**: Integrated Geoapify API for real-time location suggestions
  - Added `LocationAutocomplete` component with address and city-only modes
  - Implemented `useLocationSearch` hook with React Query for optimized API calls
  - Added Geoapify service with client-side filtering for accurate city results
  - Supports UK-specific location search with proper address formatting
  - Features smooth animations, keyboard navigation, and full accessibility support
  - Added comprehensive test page for both booking and partner registration use cases

### Added

- **Enhanced Location Support**: Added comprehensive location data structure with full address details
  - Added support for complete address information including coordinates (lat/lng)
  - Added centralized `formatLocation` utility function for consistent address display
  - Added optional postcode field support throughout the system

### Enhanced

- **Location Data Structure**: Completely refactored location handling throughout the application
  - Updated `LocationType` schema to include `address`, `city`, `postcode` (optional), `lat` (optional), and `lng` (optional)
  - Migrated from simple city/postcode structure to comprehensive address-based system
  - Enhanced booking actions to support full location details with coordinates
  - Updated provider matching algorithm to handle optional postcode fields
  - Improved location formatting across email templates, SMS notifications, and admin interfaces
  - Updated all workflow steps, AI services, and communication templates to use new location structure
  - Maintained backward compatibility for existing location data

### Fixed

- **Location Display Issues**: Resolved inconsistent location formatting across the application
  - Fixed booking request creation to properly handle new location structure
  - Fixed provider matching algorithm to work with service locations instead of deprecated location schema
  - Fixed email and SMS templates to display complete address information
  - Fixed admin booking list to show full address details instead of just city/postcode
  - Fixed workflow steps to properly format location data for AI services and notifications

## [0.1.3] - 2025-01-16

### Added

- **Custom Service Types Support**: Implemented comprehensive custom service type functionality across partner registration and admin forms
  - Added custom service type input field with support for comma, tab, and enter key separation
  - Implemented real-time custom service type tags with individual remove functionality
  - Added smart deduplication to prevent duplicate service types and filter out standard types from custom input
  - Enhanced form validation to properly handle both standard and custom service types

### Enhanced

- **Partner Registration Form**: Improved service type selection with custom type support
  - When "Other Service" is selected, users can now specify multiple custom service types
  - Custom service types are displayed as removable tags for better user experience
  - "Other Service" button is automatically hidden when custom types are added for cleaner UI
  - Added proper handling of blur events to automatically add custom types when input loses focus

- **Admin Service Provider Form**: Extended custom service type functionality to admin interface
  - Admins can now add custom service types when creating or editing service providers
  - Existing service providers with custom types are properly loaded and displayed
  - Consistent UI/UX with partner registration form for familiar user experience
  - Added initialization logic to detect and display existing custom service types

### Changed

- **Service Type Data Handling**: Updated backend processing to properly support custom service types
  - Modified partner registration action to exclude "other" placeholder from submitted values
  - Updated admin service provider actions to preserve custom service types instead of converting to "not_specified"
  - Enhanced service type normalization to filter out placeholder values while keeping custom types
  - Improved form submission logic to include custom service types in database storage

- **Database Schema Compatibility**: Leveraged existing varchar array field to store custom service types
  - No database migrations required as schema already supports custom string values
  - Custom service types are stored alongside standard service types in the same array field
  - Maintained backward compatibility with existing service provider records

### Fixed

- **Service Type Selection Logic**: Resolved issues with "other" service type deselection
  - Fixed bug where "other" button couldn't be deselected when no custom types were added
  - Improved state management for custom service type input visibility
  - Enhanced button selection logic to properly handle "other" service type state

## [0.1.2] - 2025-01-15

### Enhanced

- **Service Provider Matching Algorithm**: Significantly improved the accuracy of provider selection
  - Refactored `findMatchingServiceProviders` to include location data in the matching process
  - Updated `calculateMatchScore` and `calculateLocationScore` functions to utilize a location map for better location matching
  - Introduced helper functions `checkLocationMatch` and `checkPostcodeMatch` to streamline location and postcode validation
  - Improved scoring logic for service type and provider quality, enhancing the overall matching algorithm
  - Updated `MultiSelectLocations` component to display "all postcodes" instead of a count, improving user clarity in location selection

### Changed

- **Service Provider Components Refactor**: Improved state management and error handling across service provider components
  - Updated `AdminDashboardError` and `ServiceProvidersError` components to use a consistent `reset` prop instead of `resetAction`
  - Enhanced `DeleteServiceProviderButton` and `DeleteServiceProvider` components to accept an optional `onServiceProviderDeleted` callback
  - Refactored `ServiceProviderForm` to change the status field from a boolean to an enum, improving validation and clarity
  - Introduced `ServiceProviderDetailsClient` component to encapsulate service provider details rendering
  - Updated API routes to reflect changes in service provider data structure

- **Service Provider Status Management**: Implemented toggle functionality for better status control
  - Added `ToggleServiceProviderStatus` component to allow toggling between active and inactive states
  - Integrated the new toggle component into the `ServiceProviderTable` for seamless user experience
  - Updated `service-providers/actions.ts` to include `toggleServiceProviderStatusAction` with proper revalidation
  - Enhanced `ServiceProviderTableProps` to support callback for status changes

- **Partner Registration Form Enhancement**: Improved location handling and user experience
  - Refactored `PartnerRegistrationForm` to utilize an array for `locationIds`, allowing multiple location selections
  - Introduced `MultiSelectLocations` component for better user experience in selecting service locations
  - Updated form validation to ensure at least one location is selected, enhancing data integrity
  - Added a loading skeleton component for improved user feedback during form loading states

- **Service Provider Form Improvements**: Enhanced location handling and user guidance
  - Updated `ServiceProviderForm` to utilize a multi-select component for service locations
  - Modified form validation to require at least one service location and updated schema from `locationId` to `locationIds`
  - Enhanced `createServiceProviderAction` and `updateServiceProviderAction` to handle multiple location IDs with backward compatibility
  - Adjusted the edit page to accommodate the new structure for location IDs
  - Added a help dialog to guide users in filling out the service provider form

- **Location Management**: Enhanced deletion functionality in admin dashboard
  - Updated `DeleteLocation` component to accept an `onLocationDeleted` callback
  - Modified `LocationsTable` to pass the `onLocationDeleted` callback to `DeleteLocation`
  - Adjusted `locations/page.tsx` to trigger a fetch for updated locations after deletion
  - Added revalidation paths for API calls in location actions to ensure data integrity

### Added

- **Package Dependencies**: Updated dependencies for improved functionality
  - Upgraded `@radix-ui/react-dialog` to version 1.1.14 for improved dialog functionality

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
