-- Create drinks table
CREATE TABLE public.drinks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'whiskey',
  difficulty TEXT NOT NULL DEFAULT 'easy',
  alcohol_content INTEGER DEFAULT 40,
  flavor_profile TEXT,
  price INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some drink options
INSERT INTO public.drinks (name, description, category, difficulty, alcohol_content, flavor_profile, price) VALUES
('Yamazaki 18', 'Premium Japanese single malt whiskey with deep, complex flavors', 'whiskey', 'hard', 43, 'Rich & Smoky', 500),
('Hibiki Harmony', 'Smooth blended Japanese whiskey with delicate balance', 'whiskey', 'medium', 43, 'Floral & Honey', 300),
('Toki Highball', 'Light and refreshing Japanese whiskey with soda', 'whiskey', 'easy', 43, 'Light & Crisp', 150),
('Sake Junmai', 'Premium Japanese rice wine, clean and pure', 'sake', 'medium', 15, 'Clean & Mineral', 200),
('Shochu Kokuto', 'Distilled Japanese spirit made from brown sugar', 'shochu', 'medium', 25, 'Sweet & Earthy', 180),
('Plum Wine', 'Sweet Japanese umeshu with rich fruit flavors', 'wine', 'easy', 12, 'Sweet & Fruity', 120);

-- Add drink_order_id and drink_status to lounge_members
ALTER TABLE public.lounge_members 
ADD COLUMN drink_order_id INTEGER REFERENCES public.drinks(id),
ADD COLUMN drink_status TEXT DEFAULT 'none',
ADD COLUMN drink_progress INTEGER DEFAULT 0;

-- Enable RLS on drinks table
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;

-- Create policy for drinks (public read access)
CREATE POLICY "Drinks are viewable by authenticated users" 
ON public.drinks 
FOR SELECT 
USING (true);