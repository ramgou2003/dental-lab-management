# Password Reset - Quick Guide

## 🔐 For Users: Change Your Own Password

### Step 1: Navigate to Profile
1. Click on your profile avatar in the sidebar (bottom left)
2. Or navigate to the Profile page from the menu

### Step 2: Open Change Password Dialog
1. Scroll down to the "Action Buttons" section
2. Click the **"Change Password"** button (outlined button, next to "Edit Profile")

### Step 3: Fill in the Form
```
┌─────────────────────────────────────┐
│ 🔒 Change Password                  │
├─────────────────────────────────────┤
│ Current Password *                  │
│ [Enter your current password]  👁   │
│                                     │
│ New Password *                      │
│ [Enter new password]           👁   │
│ Minimum 6 characters                │
│                                     │
│ Confirm New Password *              │
│ [Re-enter new password]        👁   │
│                                     │
│         [Cancel] [Update Password]  │
└─────────────────────────────────────┘
```

### Step 4: Submit
1. Click **"Update Password"**
2. Wait for success message
3. You can now log in with your new password!

---

## 🔑 For Admins: Reset User Password

### Step 1: Navigate to User Management
1. Go to **User Management** page from the sidebar
2. Make sure you're on the **"Users"** tab

### Step 2: Find the User
1. Use the search bar to find the user
2. Or scroll through the user list

### Step 3: Open Reset Password Dialog
1. Click the **"..."** (three dots) button on the user's row
2. Select **"Reset Password"** from the dropdown menu

```
User Actions Menu:
├── Manage Roles
├── Edit User
├── Reset Password      ← Click here
├── Suspend User
├── Disable User
└── Delete User
```

### Step 4: Fill in the Form
```
┌─────────────────────────────────────┐
│ 🔑 Reset Password                   │
├─────────────────────────────────────┤
│ Reset password for John Doe         │
│ (john@example.com)                  │
│                                     │
│ ⚠️ This will immediately change     │
│    the user's password.             │
│                                     │
│ New Password *                      │
│ [Enter new password]           👁   │
│ Minimum 6 characters                │
│                                     │
│ Confirm New Password *              │
│ [Re-enter new password]        👁   │
│                                     │
│         [Cancel] [Reset Password]   │
└─────────────────────────────────────┘
```

### Step 5: Submit and Communicate
1. Click **"Reset Password"**
2. Wait for success message
3. **Important:** Securely communicate the new password to the user
   - Use encrypted email
   - Or tell them in person
   - Or use a secure messaging app

---

## ✅ Password Requirements

- **Minimum Length:** 6 characters
- **Must Match:** Password and confirmation must be identical
- **For Users:** New password must be different from current password

---

## 🚨 Common Issues

### "Current password is incorrect"
- **Solution:** Make sure you're entering your current password correctly
- Try typing it in a text editor first to verify

### "Passwords do not match"
- **Solution:** Make sure both password fields are identical
- Use the eye icon to show passwords and verify they match

### "Password must be at least 6 characters long"
- **Solution:** Choose a longer password (6+ characters)

### "Insufficient permissions to reset user passwords"
- **Solution:** You need the `users.update` permission
- Contact your administrator to grant this permission

### "Password reset function not configured"
- **Solution:** The database function needs to be created
- Contact your system administrator

---

## 🔒 Security Tips

### For Users:
1. Choose a strong, unique password
2. Don't reuse passwords from other sites
3. Consider using a password manager
4. Don't share your password with anyone
5. Change your password regularly

### For Admins:
1. Only reset passwords when necessary
2. Communicate new passwords securely
3. Encourage users to change the password immediately
4. Consider using temporary passwords
5. Keep a record of password resets (for audit purposes)

---

## 📞 Need Help?

If you encounter any issues:
1. Check this guide
2. Review the full documentation in `PASSWORD_RESET_FEATURE.md`
3. Contact your system administrator
4. Check the browser console for error messages

---

## 🎯 Quick Reference

| Feature | Location | Permission Required |
|---------|----------|-------------------|
| Change Own Password | Profile Page → Change Password | Authenticated User |
| Reset User Password | User Management → ... → Reset Password | `users.update` |

---

## 📱 Mobile/Tablet Users

The password reset dialogs are fully responsive and work on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile phones

The interface will automatically adjust to your screen size.

---

**Last Updated:** December 2024
**Version:** 1.0

