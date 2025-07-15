# Scripts Documentation

This directory contains utility scripts for managing your application.

## 🔐 Admin Management Script

The admin management script (`admin-management.ts`) provides a console interface for creating and managing admin users.

### Quick Start

```bash
# Run the admin management console
npm run admin:manage

# Or run directly with tsx
tsx scripts/admin-management.ts
```

### Features

- **Create Admin Users**: Create new admin accounts with secure password hashing
- **Promote Users**: Convert existing users to admin role
- **Reset Passwords**: Reset passwords for existing admin users
- **Update Admin Details**: Modify admin user information
- **List Admins**: View all current admin users
- **Input Validation**: Email, phone, and password validation
- **Secure Password Input**: Hidden password input with masking

### Menu Options

1. **Create new admin user**
   - Enter full name, email, and phone number
   - Set secure password (minimum 8 characters)
   - Automatically sets role to 'admin' and status to 'active'

2. **Promote existing user to admin**
   - Search by email or phone number
   - Confirms current user details before promotion
   - Updates role to 'admin' and status to 'active'

3. **Reset admin password**
   - Find admin by email or phone
   - Set new password with confirmation
   - Password is securely hashed before storage

4. **Update admin details**
   - Modify name, email, phone, or status
   - Only updates fields that are changed
   - Validates email and phone format

5. **List all admin users**
   - Shows all users with 'admin' role
   - Displays name, email, phone, status, and creation date

### Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt
- **Input Validation**: Email and phone number format validation
- **Hidden Password Input**: Passwords are masked during input
- **Role Verification**: Ensures only admin users can have passwords reset
- **Secure Updates**: Only updates provided fields, maintains data integrity

### Examples

#### Creating an Admin User

```bash
npm run admin:manage
# Select option 1
# Enter details:
# - Name: John Doe
# - Email: john@example.com
# - Phone: +1234567890
# - Password: ********
```

#### Promoting a User

```bash
npm run admin:manage
# Select option 2
# Enter email or phone: user@example.com
# Confirm promotion: y
```

#### Resetting Admin Password

```bash
npm run admin:manage
# Select option 3
# Enter admin email: admin@example.com
# Enter new password: ********
# Confirm password: ********
```

### Error Handling

The script includes comprehensive error handling for:

- Database connection issues
- Invalid email/phone formats
- Password requirements
- User not found scenarios
- Duplicate email addresses
- Non-admin user operations

### Database Schema

The script works with the following user schema:

```typescript
interface User {
	id: string; // UUID primary key
	name: string; // Full name (max 100 chars)
	email: string; // Email address (max 64 chars)
	phone: string; // Phone number (max 20 chars)
	password?: string; // Hashed password (max 64 chars)
	role: "user" | "admin" | "service_provider" | "support";
	status: "active" | "inactive" | "deleted";
	created_at: Date;
	updated_at: Date;
}
```

### Environment Requirements

Ensure your environment variables are configured:

```bash
# Database connection
DATABASE_URL="postgresql://user:password@host:port/database"

# Or individual variables
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="your_database"
DB_USER="your_user"
DB_PASSWORD="your_password"
```

### Deployment

For production deployment on Vercel, see the [Vercel deployment guide](../TODO/admin-management-vercel-guide.md).

### Troubleshooting

#### Common Issues

1. **Database Connection Error**

   ```bash
   ❌ Failed to connect to database
   ```

   - Check your DATABASE_URL or individual DB variables
   - Ensure database server is running
   - Verify network connectivity

2. **Module Not Found Error**

   ```bash
   ❌ Cannot find module
   ```

   - Run `npm install` to install dependencies
   - Ensure tsx is installed: `npm install -g tsx`

3. **Permission Denied**

   ```bash
   ❌ Permission denied
   ```

   - Check database user permissions
   - Ensure user can create/update User table

4. **Invalid Input Format**

   ```bash
   ❌ Invalid email format
   ❌ Invalid phone number format
   ```

   - Email must be in format: user@domain.com
   - Phone must be numeric, can include country code

### Security Best Practices

1. **Strong Passwords**: Use passwords with at least 8 characters
2. **Secure Environment**: Run only in secure environments
3. **Audit Logging**: Monitor admin user creation and modifications
4. **Regular Rotation**: Change admin passwords regularly
5. **Limited Access**: Restrict script access to authorized personnel only

### Contributing

When modifying the admin management script:

1. Test thoroughly in development environment
2. Ensure backward compatibility with existing user data
3. Update documentation for any new features
4. Follow existing code style and error handling patterns
5. Validate all user inputs properly

---

**⚠️ Security Warning**: This script has powerful administrative capabilities. Use only in secure environments and follow your organization's security policies.
