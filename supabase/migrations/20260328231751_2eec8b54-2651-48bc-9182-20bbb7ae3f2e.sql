
-- Seed admin role for the owner account
INSERT INTO public.user_roles (user_id, role)
VALUES ('4ab898dc-d738-4e01-ab2d-48e7554af43d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
