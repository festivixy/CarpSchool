# 🏫 School-Specific Admin Role System

## Overview
CarpSchool now uses a **hierarchical role system** with **school-specific admin roles** for better multi-tenant management.

## 🎯 Role Hierarchy

### **System Administrator (`system`)**
- **Global access** to all schools and users
- Can create/modify any school
- Can promote users to **system admin** or **school admin**
- Can manage all content across the platform
- **Super user** with unrestricted access

### **School Administrator (`admin.{schoolId}`)**
- **School-specific access** only
- Can only manage users from their assigned school
- Can promote/demote users within their school
- Cannot access other schools' data
- Cannot create system admins

### **Regular User (no admin roles)**
- **School-specific access** to their assigned school
- Can create rides, join rides, manage their profile
- Cannot access admin features

## 🔧 Role Management Methods

### **Making Users Admin**

```javascript
// System admin making someone a school admin
await Meteor.callAsync('admin.makeSchoolAdmin', targetUserId);

// System admin making someone a system admin
await Meteor.callAsync('admin.makeSystemAdmin', targetUserId);
```

### **Removing Admin Roles**

```javascript
// Remove school admin role
await Meteor.callAsync('admin.removeSchoolAdmin', targetUserId);

// Remove system admin role (system admin only)
await Meteor.callAsync('admin.removeSystemAdmin', targetUserId);
```

### **Role Checking Utilities**

```javascript
import { isSystemAdmin, isSchoolAdmin, canManageUser } from '../api/accounts/RoleUtils';

// Check if user is system admin
const isSystem = await isSystemAdmin(userId);

// Check if user is admin of specific school
const isSchoolAdminForSchool = await isSchoolAdmin(userId, schoolId);

// Check if manager can manage target user
const canManage = await canManageUser(managerId, targetUserId);
```

## 🏗️ Implementation Changes

### **Updated Collections**

#### Users Collection
```javascript
{
  _id: "userId123",
  emails: [...],
  profile: {...},
  schoolId: "schoolId123",
  roles: [
    "admin.schoolId123", // School admin role
    // OR
    "system"             // System admin role
  ]
}
```

### **Permission Matrix**

| Action | System Admin | School Admin | Regular User |
|--------|-------------|--------------|--------------|
| View all schools | ✅ | ❌ | ❌ |
| Manage own school | ✅ | ✅ | ❌ |
| Create schools | ✅ | ❌ | ❌ |
| Make system admin | ✅ | ❌ | ❌ |
| Make school admin | ✅ | ✅* | ❌ |
| View all users | ✅ | ❌ | ❌ |
| Manage school users | ✅ | ✅* | ❌ |

*Only for users from their own school

## 🔄 Migration Process

### **From Global Admin to School-Specific**

```javascript
// 1. Run the admin role migration
import './server/migrations/migrateToSchoolAdminRoles.js'
await migrateAdminRolesToSchoolSpecific()

// 2. Verify migration results
await verifyRoleMigration()

// 3. Create your first system admin
await createSystemAdmin('your-email@example.com')
```

### **Migration Logic**
- **Users with school assigned** → Converted to `admin.{schoolId}`
- **Users without school** → Assigned to first available school or made system admin
- **Global `admin` role** → Completely removed

## 🎨 UI Changes

### **Onboarding Flow**
- **Step 2**: Changed from city selection to **school selection**
- **Auto-detection** from email domain (@sfu.ca → Simon Fraser University)
- **Beautiful school selector** with search functionality

### **NavBar Updates**
- **Admin dropdown** → Shows for any admin role (system or school)
- **System dropdown** → Shows only for system admins
- **Role-aware** menu visibility

### **Admin Panel**
- **School admins** → See only their school's users
- **System admins** → See all users across all schools
- **Permission-based** action buttons

## 🛠️ Developer Usage

### **In Your Methods**
```javascript
import { validateAdminAction, getSchoolFilter } from '../api/accounts/AccountsSchoolUtils';

Meteor.methods({
  async 'myMethod'() {
    // Validate user has admin access
    await validateAdminAction(Meteor.userId());
    
    // Get school filter for data queries
    const schoolFilter = await getSchoolFilter();
    
    // Query with school isolation
    const data = await MyCollection.find(schoolFilter).fetchAsync();
    return data;
  }
});
```

### **In Your Components**
```javascript
import { isAdminRole, isSystemRole } from '../desktop/components/NavBarRoleUtils';

// In your React component
const currentUser = Meteor.user();
const showAdminFeatures = isAdminRole(currentUser);
const showSystemFeatures = isSystemRole(currentUser);
```

## 🔒 Security Benefits

### **Data Isolation**
- **School boundaries** enforced at database level
- **Users cannot access** other schools' data
- **Admins restricted** to their assigned schools

### **Principle of Least Privilege**
- **School admins** have minimal necessary permissions
- **System admins** clearly identified and auditable
- **Role escalation** requires explicit system admin action

### **Audit Trail**
- **Clear role hierarchy** for compliance
- **School-specific** admin actions
- **System-level** changes logged separately

## 🎯 Business Benefits

### **Multi-Tenant Ready**
- **Schools operate independently** with their own admins
- **Scalable** to thousands of schools
- **No data leakage** between institutions

### **Delegation of Authority**
- **Universities can manage** their own users
- **Reduces support burden** on CarpSchool team
- **Local control** with global oversight

### **B2B Sales Ready**
- **School-specific admin accounts** for enterprise sales
- **Clean permission boundaries** for compliance
- **Professional multi-tenant** architecture

## 🚀 Next Steps

1. **Run migrations** on existing installations
2. **Create system admins** for platform management
3. **Train school admins** on their new capabilities
4. **Update documentation** for end users
5. **Test role boundaries** thoroughly

---

**Powered by Kangshifu beef ramen 🍜 and hierarchical thinking ⚡**

Your CarpSchool platform now has **enterprise-grade role management** with perfect **school isolation** and **scalable admin delegation**!
