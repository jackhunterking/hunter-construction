# Meta Tracking Implementation - Complete Setup Guide

## ✅ Implementation Status

All code has been implemented and deployed. Your dual Meta tracking (client-side Pixel + server-side CAPI) is now live!

### What Was Implemented:

#### Client-Side Tracking
- ✅ Meta Pixel installed in `index.html` with ID: `297775880021113`
- ✅ PageView tracking on all route changes
- ✅ ViewContent tracking on each funnel step (16 total steps across both funnels)
- ✅ Lead tracking when email is captured (Basement Step 7, Pod Step 5)
- ✅ CompleteRegistration tracking on form submission (Both Step 8)

#### Server-Side Tracking
- ✅ Edge Function `meta-capi` deployed to Supabase
- ✅ Conversions API integration with event deduplication
- ✅ Database logging for all Meta events
- ✅ Advanced matching with hashed user data (email, phone, name)

---

## 🔍 Event Flow

### Basement Funnel (8 Steps)
```
Step 1 (Project Types)     → PageView + ViewContent
Step 2 (Entrance)           → PageView + ViewContent
Step 3 (Plan/Design)        → PageView + ViewContent
Step 4 (Urgency)            → PageView + ViewContent
Step 5 (Details)            → PageView + ViewContent
Step 6 (Location)           → PageView + ViewContent
Step 7 (Email)              → PageView + ViewContent + Lead
Step 8 (Contact)            → PageView + ViewContent
[Submit Button]             → CompleteRegistration
Confirmation Page           → PageView
```

### Pod Funnel (8 Steps)
```
Step 1 (Intent)             → PageView + ViewContent
Step 2 (Color)              → PageView + ViewContent
Step 3 (Flooring)           → PageView + ViewContent
Step 4 (HVAC)               → PageView + ViewContent
Step 5 (Email)              → PageView + ViewContent + Lead
Step 6 (Result)             → PageView + ViewContent
Step 7 (Address)            → PageView + ViewContent
Step 8 (Contact)            → PageView + ViewContent
[Submit Button]             → CompleteRegistration
Confirmation Page           → PageView
```

---

## 🧪 Testing Guide

### 1. Install Meta Pixel Helper
- Install: [Meta Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- This will show you in real-time what events are firing

### 2. Test the Basement Funnel

1. Navigate to `/basement-suite/step-1`
2. **Check Pixel Helper:**
   - Should show: PageView + ViewContent
   - Event ID should be visible

3. Fill out Step 1 and click Next
4. **On Step 2:**
   - Should show: PageView + ViewContent (new event ID)
   
5. Continue through steps until Step 7 (Email)
6. **On Step 7 (after entering email and clicking Next):**
   - Should show: PageView + ViewContent + **Lead** 🎯
   - This is a key conversion event!

7. Complete Step 8 and click Submit
8. **After Submit:**
   - Should fire: **CompleteRegistration** 🎯
   - This is your most important conversion event!

9. **On Confirmation Page:**
   - Should show: PageView

### 3. Test the Pod Funnel

Same process, but Lead event fires at Step 5 (Email) instead of Step 7.

### 4. Verify in Facebook Events Manager

1. Go to: [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Select your Pixel (ID: 297775880021113)
3. Click on **"Test Events"** tab
4. You should see events appear in real-time with:
   - ✅ Event name (PageView, ViewContent, Lead, CompleteRegistration)
   - ✅ "Browser" badge (client-side pixel)
   - ✅ "Server" badge (server-side CAPI) 🎯
   - ✅ "Matched" status (means deduplication is working!)

### 5. Check Supabase Database

You can verify all events are being logged:

```sql
-- View all Meta events
SELECT 
  event_name,
  event_id,
  processing_status,
  created_at,
  event_source_url
FROM meta_events
ORDER BY created_at DESC
LIMIT 20;

-- View CAPI analytics
SELECT * FROM meta_capi_analytics;
```

---

## 🔐 Security Notes

All sensitive data is properly hashed before sending to Meta:
- ✅ Emails are SHA-256 hashed
- ✅ Phone numbers are SHA-256 hashed
- ✅ First/Last names are SHA-256 hashed
- ✅ IP addresses are truncated in database logs

---

## 📊 Expected Results

### Normal Operation:
- **Client events:** Show in Events Manager with "Browser" badge
- **Server events:** Show in Events Manager with "Server" badge
- **Deduplication:** Same event_id = single event counted
- **Database logs:** All events stored with processing_status = 'success'

### If Something's Wrong:

#### No "Server" badge in Events Manager:
- Check Supabase Edge Function secrets are set
- Check Edge Function logs: `supabase functions logs meta-capi`
- Verify META_ACCESS_TOKEN is correct

#### No "Browser" badge:
- Check console for JavaScript errors
- Verify Meta Pixel Helper shows the pixel
- Check browser console for blocked requests (adblockers)

#### Events not appearing at all:
- Check browser console for errors
- Verify VITE_META_PIXEL_ID environment variable is set in Vercel
- Check network tab for failed requests

---

## 🎯 Key Conversion Events

For Meta Ads optimization, these are your most important events:

1. **Lead** - When user provides email
   - Triggers: Basement Step 7, Pod Step 5
   - Use for: Lead generation campaigns

2. **CompleteRegistration** - When user submits full form
   - Triggers: Basement Step 8, Pod Step 8
   - Use for: Full form submission optimization

Both events include:
- User data (hashed)
- Funnel session ID for tracking
- Custom data (funnel type, step info)

---

## 🚀 Next Steps

1. **Test both funnels** using the guide above
2. **Verify in Events Manager** that you see both Browser and Server badges
3. **Let events accumulate** for 24-48 hours
4. **Create Custom Conversions** in Events Manager if needed
5. **Set up Ads** using these events as optimization goals

---

## 📞 Troubleshooting

If you encounter issues:

1. **Check Edge Function logs:**
   ```bash
   supabase functions logs meta-capi --project-ref vrgugnpzkdwjzvdnqspc
   ```

2. **Check database for failed events:**
   ```sql
   SELECT * FROM meta_events 
   WHERE processing_status = 'failed' 
   ORDER BY created_at DESC;
   ```

3. **Verify environment variables:**
   - Vercel: VITE_META_PIXEL_ID
   - Supabase: META_PIXEL_ID, META_ACCESS_TOKEN

---

## 📈 Monitoring

Access real-time analytics in Supabase:

```sql
-- Event success rate by type
SELECT * FROM meta_capi_analytics;

-- Recent events
SELECT 
  event_name,
  processing_status,
  COUNT(*) as count,
  MAX(created_at) as last_event
FROM meta_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_name, processing_status
ORDER BY event_name;
```

---

## ✅ Implementation Complete!

Your dual Meta tracking is now live and ready to capture all user interactions across both funnels. Start testing and watch your events appear in Facebook Events Manager!
