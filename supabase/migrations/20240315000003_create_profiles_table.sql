-- Drop everything first
drop publication if exists supabase_realtime;
drop trigger if exists handle_deleted_user on auth.users;
drop function if exists public.handle_user_deletion();
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles;

-- Create the profiles table
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Anyone can view profiles"
    on public.profiles for select
    using (true);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can insert own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

-- Create the trigger function for new users
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, created_at, updated_at)
    values (
        new.id,
        new.email,
        now(),
        now()
    );
    return new;
end;
$$;

-- Create the trigger for new users
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Create function to handle user deletion
create function public.handle_user_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
    -- Delete user's properties
    delete from public.properties where user_id = old.id;
    
    -- Delete user's profile (this will happen automatically due to ON DELETE CASCADE)
    -- delete from public.profiles where id = old.id;
    
    -- Add any other cleanup needed for user data
    
    return old;
end;
$$;

-- Create the trigger for user deletion
create trigger handle_deleted_user
    before delete on auth.users
    for each row execute function public.handle_user_deletion();

-- Create realtime publication
create publication supabase_realtime for table public.profiles; 