# Meta Pixel Test Mode Configuration

This document explains how test mode is implemented in the Meta Pixel integration and provides step-by-step instructions for disabling it.

## What is Test Mode?

When test mode is enabled:
- Events are sent to Facebook's **Test Events** tab
- Events do **NOT** appear in production analytics
- Events are marked with the test event code `TEST20053`
- Useful for development, debugging, and testing without affecting production data

## Current Test Mode Status

**ENABLED** - Events are currently being sent to the Test Events tab.

Test Event Code: `TEST20053`

## Locations Where Test Code Is Used

Test mode configuration and usage is located in the following files:

### 1. Configuration File
**File:** `services/metaConfig.ts`
**Lines:** 19-28
```typescript
TEST_MODE_ENABLED: true,
TEST_EVENT_CODE: 'TEST20053',
```

### 2. Client-Side Tracking
**File:** `services/metaEventsService.ts`
- Imports `META_CONFIG` from `metaConfig.ts`
- Uses test code when firing browser-side events
- Sends test code to server-side API

### 3. HTML Initialization
**File:** `index.html`
- Checks test mode configuration
- Passes test code to initial PageView event

### 4. Server-Side API
**File:** `supabase/functions/meta-conversion/index.ts`
- Receives test code from client
- Includes test code in Meta Conversions API payload

## How to Disable Test Mode (Production Setup)

Follow these steps to disable test mode and send events to production:

### Step 1: Update Configuration
Edit `services/metaConfig.ts`:
```typescript
export const META_CONFIG = {
  TEST_MODE_ENABLED: false,  // Change from true to false
  TEST_EVENT_CODE: '',        // Clear the test code (optional)
  EVENT_ID_PREFIX: 'hc',
};
```

### Step 2: Verify Changes
1. Build the application: `npm run build`
2. Check browser console logs - should NOT see "TEST" in event logs
3. Verify events appear in **Overview** tab (not Test Events tab) in Facebook Events Manager

### Step 3: Deploy to Production
1. Commit changes: `git add services/metaConfig.ts`
2. Commit: `git commit -m "Disable Meta Pixel test mode for production"`
3. Push: `git push origin main`
4. Vercel will automatically deploy

### Step 4: Verify in Facebook Events Manager
1. Go to Facebook Events Manager
2. Select your Pixel
3. Click **Overview** tab
4. Visit your website
5. Events should appear in Overview (not Test events tab)
6. Event IDs should start with `hc_` prefix

## How to Re-Enable Test Mode

If you need to re-enable test mode for debugging:

1. Edit `services/metaConfig.ts`:
   ```typescript
   TEST_MODE_ENABLED: true,
   TEST_EVENT_CODE: 'TEST20053',
   ```

2. Commit and push changes

## Troubleshooting

### Events Still Appearing in Test Events Tab
- Clear browser cache
- Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Wait 5-10 minutes for Facebook to process the change
- Check that Vercel deployment completed successfully

### Events Not Appearing Anywhere
- Check browser console for errors
- Verify `VITE_META_PIXEL_ID` is set in Vercel environment variables
- Check `META_ACCESS_TOKEN` is set in Supabase edge function secrets
- Review edge function logs in Supabase dashboard

### Want to Completely Remove Test Code
If you want to remove all test code logic after disabling:

1. Remove test-related code from `services/metaEventsService.ts`
2. Remove test logic from `index.html`
3. Remove test logic from `supabase/functions/meta-conversion/index.ts`
4. Update this documentation to reflect removal

## Additional Resources

- [Facebook Test Events Documentation](https://developers.facebook.com/docs/meta-pixel/testing)
- [Conversions API Testing](https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api)
