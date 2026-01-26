-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
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
    user_id UUID REFERENCES auth.users,
    company_name TEXT,
    company_phone TEXT,
    company_email TEXT,
    company_address TEXT,
    default_tax_rate DECIMAL(5,2) DEFAULT 0,
    next_invoice_number INTEGER DEFAULT 1,
    logo_url TEXT,
    brand_color TEXT DEFAULT '#c5613b',
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

-- Clients: Users can only see and manage their own clients
CREATE POLICY "Users can manage their own clients" ON public.clients
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Invoices: Users can only see and manage their own invoices
CREATE POLICY "Users can manage their own invoices" ON public.invoices
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Settings:
-- 1. Allow public read access (for branding on login page)
CREATE POLICY "Allow public read access to settings" ON public.settings
    FOR SELECT USING (true);

-- 2. Allow authenticated users to update settings (assuming id=1 for now)
CREATE POLICY "Allow all actions for authenticated users" ON public.settings
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Storage Bucket setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads to company-assets" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates to company-assets" ON storage.objects
    FOR UPDATE WITH CHECK (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to company-assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'company-assets');
