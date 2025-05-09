# Supabase Setup Guide for DishGenius Authentication

Since you've already created your Supabase project, here are the specific configuration steps needed for the authentication system:

## 1. Get Your API Credentials

1. Go to your Supabase project dashboard
2. Click on the "Settings" icon (gear) in the sidebar
3. Select "API" from the settings menu
4. You'll need two key pieces of information:
   - **Project URL**: Used to connect to your Supabase instance
   - **Project API Key**: The `anon` public key (not the secret key)

## 2. Configure Authentication Settings

1. In the Supabase dashboard, go to "Authentication" → "Providers"
2. Ensure "Email" provider is enabled
3. Configure email auth settings:
   - Enable "Confirm email" if you want email verification
   - Set minimum password strength
   - Customize "Redirect URLs" (for mobile, use your app's deep link URL)

## 3. Set Up Email Templates

1. Go to "Authentication" → "Email Templates"
2. Customize the following templates:
   - **Confirmation**: Sent when users sign up
   - **Invite**: For inviting users (if needed)
   - **Magic Link**: For passwordless login (if using)
   - **Reset Password**: For password recovery

## 4. Create User Profile Table

1. Go to "Table Editor" → "Create a new table"
2. Create a table named `profiles` with the following structure:
   ```sql
   create table profiles (
     id uuid references auth.users on delete cascade primary key,
     updated_at timestamp with time zone,
     username text unique,
     full_name text,
     avatar_url text,
     website text,
     
     constraint username_length check (char_length(username) >= 3)
   );
   
   -- Set up Row Level Security (RLS)
   alter table profiles enable row level security;
   
   -- Create policies for secure access
   create policy "Public profiles are viewable by everyone."
     on profiles for select
     using ( true );
   
   create policy "Users can insert their own profile."
     on profiles for insert
     with check ( auth.uid() = id );
   
   create policy "Users can update their own profile."
     on profiles for update
     using ( auth.uid() = id );
   
   -- Create a trigger to set up a profile when a user signs up
   create function public.handle_new_user()
   returns trigger as $$
   begin
     insert into public.profiles (id, full_name, avatar_url)
     values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
     return new;
   end;
   $$ language plpgsql security definer;
   
   create trigger on_auth_user_created
     after insert on auth.users
     for each row execute procedure public.handle_new_user();
   ```

3. You can run this SQL in the SQL Editor in Supabase

## 5. Set Up Storage (Optional, for Profile Images)

1. Go to "Storage" → "Create a new bucket"
2. Create a bucket named `avatars`
3. Set up RLS policies for the bucket:
   ```sql
   -- Allow users to upload their own avatar
   create policy "Avatar images are publicly accessible."
     on storage.objects for select
     using ( bucket_id = 'avatars' );
   
   create policy "Users can upload their own avatar."
     on storage.objects for insert
     with check ( bucket_id = 'avatars' AND auth.uid() = owner );
   
   create policy "Users can update their own avatar."
     on storage.objects for update
     using ( bucket_id = 'avatars' AND auth.uid() = owner );
   ```

## 6. API Keys and Environment Setup

1. Create a `.env` file in your project (add to `.gitignore`)
2. Add your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

3. For Expo, create an `app.config.js` file:
   ```javascript
   export default {
     expo: {
       // ... other config
       extra: {
         supabaseUrl: process.env.SUPABASE_URL,
         supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
       },
     },
   };
   ```

## 7. Test Auth Flow

1. In Supabase dashboard, go to "Authentication" → "Users"
2. Create a test user manually to verify your setup
3. Try password reset functionality
4. Verify email templates are being sent correctly

## Next Steps

Once you've completed these Supabase setup steps, you'll be ready to integrate the authentication flow into your React Native application using the template code.