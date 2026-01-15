# Fix RLS Policy - Critical!

## Problem
Forms are submitting but data isn't appearing in Supabase. This is because **Row Level Security (RLS)** policies are blocking anonymous inserts.

## Solution
You need to enable the RLS policy that allows anonymous users to insert data.

### Steps to Fix:

**STEP 1: Go to Supabase Dashboard**
1. Click **Tables** (left menu)
2. Click **quotes_and_inquiries** table
3. Click **Authentication** tab (top)

**STEP 2: Check RLS Status**
- You should see "RLS is ON for this table"
- If it shows "OFF", click the toggle to turn it ON

**STEP 3: Create/Update Policies**
1. Click the **Policies** tab
2. Click **New Policy** or look for existing policies
3. Create this policy:

```
Policy Name: "Allow anonymous inserts"
Target Roles: public (leave as default)
Permissions: INSERT
WITH CHECK: Click the checkbox or leave blank (means allow all)
```

**Or run this SQL in SQL Editor:**

```sql
-- Drop old policy if it exists
DROP POLICY IF EXISTS "Allow inserts from anyone" ON quotes_and_inquiries;

-- Create new policy that allows inserts from anonymous users
CREATE POLICY "Allow anonymous inserts"
ON quotes_and_inquiries
FOR INSERT
WITH CHECK (true);

-- Create policy to allow reads (if needed)
CREATE POLICY "Allow anyone to read"
ON quotes_and_inquiries
FOR SELECT
USING (true);
```

**STEP 4: Verify**
1. Go back to **Policies** tab
2. You should see 2 policies:
   - "Allow anonymous inserts" (INSERT permission)
   - "Allow anyone to read" (SELECT permission)

**STEP 5: Test Again**
1. Go to your website
2. Fill a quote form
3. Click Submit
4. Check Supabase → quotes_and_inquiries table
5. Data should appear!

---

## If Still Not Working:

Try this simpler approach - Disable RLS temporarily for testing:

**In Supabase SQL Editor:**
```sql
ALTER TABLE quotes_and_inquiries DISABLE ROW LEVEL SECURITY;
```

Then test the form again. If it works, the issue is definitely RLS policies.

Then re-enable it with:
```sql
ALTER TABLE quotes_and_inquiries ENABLE ROW LEVEL SECURITY;
```

And create proper policies.

---

## Debug: Check Browser Console

1. Open your website
2. Press **F12** (Developer Tools)
3. Click **Console** tab
4. Submit a quote form
5. Look for messages like:
   - "Form data collected: ..." (✅ Good)
   - "Submitting form data: ..." (✅ Good)
   - "Supabase Error: ..." (❌ Error - read the error message)

Share the error message if you see one!
