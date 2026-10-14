-- Seed departments
INSERT INTO public.departments (id, name, code, description, sla_days_normal, sla_days_high, sla_days_emergency, icon_name)
VALUES
('00000000-0000-0000-0000-000000000001', 'Water Supply', 'WS', 'Municipal drinking water supply, pipeline maintenance, and leakage repairs.', 7, 3, 1, 'Droplets'),
('00000000-0000-0000-0000-000000000002', 'Sanitation and Waste Management', 'SWM', 'Solid waste management, garbage clearance, open dumping resolution, and drain cleaning.', 5, 2, 1, 'Trash2'),
('00000000-0000-0000-0000-000000000003', 'Electricity', 'ELEC', 'Power distribution, transformer maintenance, voltage fluctuations, and street lighting.', 5, 2, 1, 'Zap'),
('00000000-0000-0000-0000-000000000004', 'Public Works Department', 'PWD', 'Civic infrastructure, government buildings, bridges, and stormwater drains.', 14, 7, 2, 'Building2'),
('00000000-0000-0000-0000-000000000005', 'Roads and Transport', 'RT', 'Pothole repairs, asphalt resurfacing, traffic signs, road dividers.', 10, 4, 2, 'Compass')
ON CONFLICT (code) DO NOTHING;
