# Shareable Links Feature - Setup Guide

## Overview
The shareable links feature allows both authenticated and guest users to create public links with full editing access to their cashflow projections. Links expire after 30 days and track view counts. Guest users can create links but cannot manage or delete them later. Anyone with the link can view AND edit the shared cashflow data.

## Features
- ✅ Generate unique shareable links with one click
- ✅ Works for both authenticated users AND guest users
- ✅ Full editing access (no authentication required)
- ✅ All tabs available (Inputs, Projection, Insights)
- ✅ 30-day automatic expiration
- ✅ View count tracking
- ✅ Beautiful modal interface
- ✅ Mobile-responsive design
- ✅ Copy to clipboard functionality

## Database Setup

### 1. Run SQL Migration in Supabase

Open your Supabase project's SQL Editor and run the migration file:

```bash
# Location: supabase-migrations/01_create_shared_links_table.sql
```

This will create:
- `shared_cashflow_links` table with proper schema
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic expiration function (optional)

### 2. Verify Table Creation

After running the migration, verify in Supabase Dashboard:
1. Go to **Table Editor**
2. Look for `shared_cashflow_links` table
3. Verify these columns exist:
   - `id` (uuid, primary key)
   - `share_token` (text, unique)
   - `user_id` (uuid, foreign key to auth.users)
   - `data` (jsonb)
   - `created_at` (timestamp)
   - `expires_at` (timestamp)
   - `view_count` (integer)

### 3. RLS Policies
The migration automatically creates these policies:
- **Authenticated users can create their own shareable links** (authenticated users only)
- **Guest users can create shareable links** (anonymous users, stored with null user_id)
- **Users can view their own shareable links** (for management, authenticated only)
- **Users can delete their own shareable links** (authenticated only)
- **Anyone can view shared links by token** (public read-only access)
- **Anyone can update view count** (for tracking)

## How It Works

### User Flow
1. **User clicks "Share" button** in the app navigation
2. **Modal opens** with "Export to Link" button
3. **User clicks "Export to Link"**
4. **System creates a unique shareable URL** (e.g., `https://yourapp.com/shared/AbC123Xyz789`)
5. **User copies the link** and shares it with anyone
6. **Recipients can view AND edit** the cashflow projection without signing in
7. **Recipients have full access** to Inputs, Projection, and Insights tabs
8. **Link expires** automatically after 30 days

### Technical Flow
```
User Action → createShareableLink() → Supabase Insert → Generate URL → Display Modal
Public View → getSharedData() → Supabase Query → Render Full-Access Editable View
```

## File Structure

### New Files Created
```
src/
├── services/supabase/
│   └── shareableLinks.js          # API service for share links
├── components/
│   └── ShareableLinkModal.jsx     # Modal component
└── pages/
    └── SharedView.jsx              # Public read-only view

supabase-migrations/
└── 01_create_shared_links_table.sql  # Database schema
```

### Modified Files
```
src/
├── App.jsx                        # Added Share button + modal
├── App.css                        # Added modal & shared view styles
├── main.jsx                       # Added React Router
├── context/FinancialContext.jsx   # Added initialData & readOnly support
└── package.json                   # Added react-router-dom
```

## Usage

### For Authenticated Users
```javascript
// Share button is visible in the navigation bar
<button className="share-button" onClick={() => setShowShareModal(true)}>
  Share
</button>

// Modal opens on click
<ShareableLinkModal isOpen={showShareModal} onClose={handleClose} />
```

### For Public Viewers
```
URL: /shared/:token
Example: https://yourapp.com/shared/AbC123Xyz789

The SharedView component:
1. Fetches data using the token
2. Shows read-only banner
3. Renders Projection and Insights tabs
4. Disables all editing functionality
```

## API Reference

### `createShareableLink(userId, data, expiresInDays)`
Creates a new shareable link.

**Parameters:**
- `userId` (string) - Authenticated user's ID
- `data` (object) - Cashflow data snapshot
- `expiresInDays` (number) - Expiration time (default: 30)

**Returns:**
```javascript
{
  success: true,
  shareToken: "AbC123Xyz789",
  shareUrl: "https://yourapp.com/shared/AbC123Xyz789",
  expiresAt: "2025-11-08T17:20:00.000Z"
}
```

### `getSharedData(shareToken)`
Retrieves shared cashflow data by token.

**Parameters:**
- `shareToken` (string) - The share token from URL

**Returns:**
```javascript
{
  success: true,
  data: { /* cashflow data */ },
  sharedAt: "2025-10-09T17:20:00.000Z",
  viewCount: 5
}
```

### `getUserShareableLinks(userId)`
Gets all shareable links created by a user.

**Parameters:**
- `userId` (string) - User ID

**Returns:**
```javascript
{
  success: true,
  links: [
    {
      id: "uuid",
      share_token: "AbC123Xyz789",
      created_at: "2025-10-09T17:20:00.000Z",
      expires_at: "2025-11-08T17:20:00.000Z",
      view_count: 5
    }
  ]
}
```

### `deleteShareableLink(userId, shareToken)`
Deletes a shareable link.

**Parameters:**
- `userId` (string) - User ID (for authorization)
- `shareToken` (string) - Token to delete

**Returns:**
```javascript
{
  success: true
}
```

## Security Considerations

### Both Authenticated and Guest Users Can Create
- Both authenticated and guest users can create shareable links
- Guest users see an info message about link expiration
- Authenticated user links are tied to their account for management
- Guest user links have `user_id = null` and `created_by_guest = true`

### Public Full-Access
- Anyone with the link can view AND edit (no auth required)
- Full access to all tabs: Inputs, Projection, and Insights
- Can add/edit/delete income sources, expenses, and credit cards
- Changes are made to the shared snapshot, not synced back to original
- No sensitive user information is exposed

### Automatic Expiration
- Links expire after 30 days by default
- Expired links show a friendly error message
- Optional: Set up pg_cron for automatic cleanup

### RLS Protection
- Row Level Security ensures users can only manage their own links
- Public can only read by token (not list all links)
- Data is validated before insertion

## Customization

### Change Expiration Time
```javascript
// In shareableLinks.js, modify the default parameter
export const createShareableLink = async (userId, data, expiresInDays = 90) {
  // Now links expire after 90 days instead of 30
}
```

### Change Modal Colors
```css
/* In App.css, modify modal-title color */
.modal-title {
  color: #2A623C; /* Use your brand color */
}

.export-link-button {
  background: #2A623C; /* Use your brand color */
}
```

### Add Link Management UI
You can create a settings page to show user's existing links:

```javascript
import { getUserShareableLinks, deleteShareableLink } from '../services/supabase/shareableLinks'

// In your settings component
const links = await getUserShareableLinks(user.userId)
```

## Testing

### Local Testing
1. Start dev server: `npm run dev`
2. Sign in to your account
3. Click the "Share" button
4. Click "Export to Link"
5. Copy the generated URL
6. Open URL in an incognito window to test public access

### Production Testing
1. Deploy to Railway/Vercel/Netlify
2. Ensure environment variables are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Test the complete flow in production

## Troubleshooting

### "Supabase not configured" Error
**Problem:** Environment variables not set  
**Solution:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your `.env` file

### "Failed to create link" Error
**Problem:** Database table doesn't exist  
**Solution:** Run the SQL migration in Supabase SQL Editor

### "This shared link does not exist" Error
**Problem:** Link expired or deleted  
**Solution:** Create a new shareable link

### Token Not Found in URL
**Problem:** React Router not configured  
**Solution:** Verify `BrowserRouter` is set up in `main.jsx`

### Share Button Not Visible
**Problem:** Modal import missing  
**Solution:** Check that `ShareableLinkModal` is imported in `App.jsx`

## Future Enhancements

Potential features to add:
- [ ] Link management dashboard
- [ ] Custom expiration dates
- [ ] Password-protected links
- [ ] Link analytics (views over time)
- [ ] Social media sharing buttons
- [ ] QR code generation
- [ ] Email sharing
- [ ] Link preview/thumbnail generation

## Support

If you encounter issues:
1. Check Supabase table exists and has proper RLS policies
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Ensure you're on the latest version of dependencies

---

**Created:** October 9, 2025  
**Version:** 1.0.0  
**Compatibility:** React 19.1.0, Supabase 2.54.0, React Router 6.x
