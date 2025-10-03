create table public.stores (
    id uuid primary key default gen_random_uuid(), -- unique store id
    name text not null,
    typeBusiness text not null,
    subscriptionPlan text not null,
    expiryDate date not null,
    phone text,
    email text unique,
    created_at timestamptz default now()
);

create table public.inventory (
    id uuid primary key default gen_random_uuid(), -- unique id
    item text not null,
    description text,
    buyingPrice numeric(12,2) not null,
    sellingPrice numeric(12,2) not null,
    profit numeric(12,2) generated always as (sellingPrice - buyingPrice) stored,
    barcode text unique,
    storeId uuid references public.stores(id) on delete cascade, 
    quantity integer not null default 0,
    created_at timestamptz default now()
);

create table public.sales (
    id uuid primary key default gen_random_uuid(), -- unique sale id
    item text not null,
    description text,
    sellingPrice numeric(12,2) not null,
    profit numeric(12,2) not null,
    quantity integer not null default 1,
    storeId uuid references public.stores(id) on delete cascade,
    created_at timestamptz default now()
);

create table public.users (
    id uuid primary key default gen_random_uuid(), -- unique user id
    name text not null,
    email text unique not null,
    phone text,
    role text not null check (role in ('admin', 'manager', 'cashier', 'staff')), -- predefined roles
    storeId uuid references public.stores(id) on delete cascade,
    created_at timestamptz default now()
);

create table public.errors (
    id uuid primary key default gen_random_uuid(), -- unique error id
    storeId uuid references public.stores(id) on delete cascade, -- which store had the error
    error_message text not null, -- human-readable error message
    created_at timestamptz default now()
);

create table public.settings (
    id uuid primary key default gen_random_uuid(), -- unique setting id
    storeId uuid references public.stores(id) on delete cascade, -- each store’s settings
    currency text default 'KES', -- currency used in the store
    timezone text default 'Africa/Nairobi', -- store timezone
    tax_rate numeric(5,2) default 0.00, -- default tax percentage (e.g. 16.00)
    theme text default 'light', -- UI theme preference
    notifications_enabled boolean default true, -- whether store gets alerts
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.users
add column auth_user_id uuid references auth.users(id) on delete cascade unique;
