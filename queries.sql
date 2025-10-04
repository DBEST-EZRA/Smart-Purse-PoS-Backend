create table products (
  id bigint generated always as identity primary key,
  name text not null,
  price numeric(10,2) not null,
  created_at timestamp with time zone default now()
);

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
    storeId uuid references public.stores(id) on delete cascade, -- assuming you have a stores table
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

drop table if exists public.products cascade;

drop table if exists public.users cascade;

create table public.users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique not null,
    phone text,
    role text not null check (role in ('admin', 'manager', 'cashier', 'staff')),
    storeid uuid references public.stores(id) on delete cascade, -- all lowercase
    created_at timestamptz default now()
);

drop table if exists public.users cascade;

create table public.users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique not null,
    phone text,
    role text not null check (role in ('admin', 'manager', 'cashier', 'staff')),
    storeid uuid references public.stores(id) on delete cascade,
    auth_user_id uuid unique, -- link to Supabase Auth
    created_at timestamptz default now()
);

-- Add a "link" column
ALTER TABLE public.stores 
ADD COLUMN link text unique;

-- Optionally, backfill existing stores
UPDATE public.stores
SET link = 'https://pos.smartpurse/' || id;



-- Hotel Links Start Here
-- Hotel Links Start Here
-- Hotel Links Start Here
-- Hotel Links Start Here

DROP TABLE IF EXISTS public.inventory;

CREATE TABLE public.inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
    item text NOT NULL,             
    description text,
    rate numeric(12,2) NOT NULL,    
    category text NOT NULL, 
    vat numeric(5,2) NOT NULL DEFAULT 0, 
    store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);


CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category text NOT NULL UNIQUE,
    storeid uuid REFERENCES public.stores(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.categories DROP CONSTRAINT categories_category_key;

INSERT INTO public.categories (category, storeid)
VALUES 
('Starters', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Main Course', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Desserts', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Drinks', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Specials', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Soups', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Salads', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Sandwiches', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Pizza', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Pasta', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Burgers', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Seafood', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Grill', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Steaks', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Chicken', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Vegetarian', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Vegan', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Breakfast', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Lunch', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Dinner', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Beer', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Whiskey', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Wines', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Cocktails', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Juices', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Soft Drinks', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Tea', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Coffee', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Smoothies', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Shakes', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Snacks', '2f3e3d93-aabc-4115-b7d7-0590f3faae82'),
('Sides', '2f3e3d93-aabc-4115-b7d7-0590f3faae82');


-- Drop old columns you don't need anymore
ALTER TABLE public.sales 
  DROP COLUMN item,
  DROP COLUMN description,
  DROP COLUMN sellingPrice,
  DROP COLUMN profit,
  DROP COLUMN quantity;

-- Add new columns
ALTER TABLE public.sales
  ADD COLUMN billno text UNIQUE NOT NULL,
  ADD COLUMN date timestamptz DEFAULT now(),
  ADD COLUMN servedby text,
  ADD COLUMN paymentstatus text DEFAULT 'unpaid',
  ADD COLUMN total numeric(12,2) NOT NULL,
  ADD COLUMN paymentmethod text,
  ADD COLUMN vat numeric(12,2) DEFAULT 0;


  CREATE TABLE public.sale_item (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- unique id for each item
    billno text NOT NULL REFERENCES public.sales(billno) ON DELETE CASCADE,
    name text NOT NULL,          -- item name
    rate numeric(12,2) NOT NULL, -- price per unit
    quantity integer NOT NULL DEFAULT 1,
    subtotal numeric(12,2) GENERATED ALWAYS AS (rate * quantity) STORED,
    storeid uuid REFERENCES public.stores(id) ON DELETE CASCADE,
    vat numeric(12,2) DEFAULT 0
);









