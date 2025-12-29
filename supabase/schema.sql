-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE NOT NULL,
    project_description TEXT,
    labor_line1_desc TEXT,
    labor_line1_amount DECIMAL(10,2),
    labor_line2_desc TEXT,
    labor_line2_amount DECIMAL(10,2),
    materials_line1_desc TEXT,
    materials_line1_amount DECIMAL(10,2),
    materials_line2_desc TEXT,
    materials_line2_amount DECIMAL(10,2),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    company_name TEXT,
    company_phone TEXT,
    company_email TEXT,
    company_address TEXT,
    default_tax_rate DECIMAL(5,2) DEFAULT 0,
    next_invoice_number INTEGER DEFAULT 1,
    logo_url TEXT,
    brand_color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default settings row if it doesn't exist
INSERT INTO public.settings (id, company_name)
VALUES (1, 'My Remodeling Business')
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Simple policy: authenticated users can do everything (assuming single-owner app)
CREATE POLICY "Allow all actions for authenticated users" ON public.clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all actions for authenticated users" ON public.invoices
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all actions for authenticated users" ON public.settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Storage Bucket setup (Note: requires manual creation in Supabase Dashboard as well)
-- This SQL just helps if the user uses the Supabase API to manage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads to company-assets" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates to company-assets" ON storage.objects
    FOR UPDATE WITH CHECK (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to company-assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'company-assets');
