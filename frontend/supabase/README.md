# Supabase Configuration

This document provides instructions for configuring Supabase for the AgriGuru application.

## Disabling Email Confirmation

By default, Supabase sends confirmation emails for new sign-ups. To disable this:

1. Log in to your Supabase project at https://app.supabase.com
2. Select your project
3. Navigate to "Authentication" in the left sidebar
4. Go to "Providers"
5. Under "Email" settings, toggle off "Confirm email" option
6. Click "Save" to apply the changes

This will allow users to sign up and log in without requiring email confirmation.

## Database Migrations

See the [migrations](./migrations/README.md) directory for information about required database migrations.

## Environment Variables

Make sure your `.env` file includes all required Supabase variables:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Authentication Configuration

### Email Auth

- Email sign-ins are enabled
- Email confirmation is disabled (see above)
- Secure password recovery is enabled

### OAuth Providers

If you want to enable social logins:

1. Navigate to "Authentication" > "Providers" 
2. Configure and enable the desired OAuth providers
3. Make sure to add the appropriate callback URLs

## Storage Settings

If you're using Supabase Storage for file uploads (e.g., for profile photos):

1. Create a public bucket named "profile-images"
2. Set up appropriate storage policies:

```sql
-- Example storage policy for public read access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-images');

-- Example storage policy for authenticated uploads
CREATE POLICY "Authenticated Users Can Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);
