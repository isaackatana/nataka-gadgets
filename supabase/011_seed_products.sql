-- Starter catalogue: repair tools and replacement parts.
-- PRICES ARE ESTIMATES. Products are added HIDDEN (active = false), so nothing shows on the site until you
-- check the price. In the staff area open Products, edit the price, then press Show.
-- To show every starter product at once after reviewing prices, run the one-line command at the bottom.
-- Safe to run twice: products whose name already exists are skipped.
insert into public.products (name, category, description, price_kes, in_stock, active)
select v.name, v.category, v.description, v.price_kes, true, false
from (values
  ('Precision screwdriver set, 24 bits', 'Tools and kits', 'Small bits for phone, laptop and console screws (Phillips, flat, Torx, pentalobe, tri-wing). Magnetic handle.', 1200),
  ('Phone opening kit (spudger, picks, suction cup)', 'Tools and kits', 'Plastic pry tools, metal spudger, guitar picks and a suction cup for lifting screens without damage.', 900),
  ('Anti-static tweezers set', 'Tools and kits', 'Curved, straight and pointed tweezers for small components, flex cables and SIM trays.', 800),
  ('Digital multimeter', 'Tools and kits', 'Tests voltage, continuity and resistance. Useful for tracing charging and power faults.', 2800),
  ('Soldering iron, adjustable temperature', 'Tools and kits', 'Temperature-controlled iron for charging ports, battery connectors and board repairs.', 3500),
  ('Hot air rework station', 'Tools and kits', 'Adjustable hot air gun for removing screens, back glass and chips. Includes nozzles.', 9500),
  ('Solder wire and flux kit', 'Tools and kits', 'Lead-free solder wire, flux paste and solder wick for clean joints.', 1100),
  ('Screen separator, LCD opening tool', 'Tools and kits', 'Heated plate and suction cup for separating glued screens from phone frames.', 6500),
  ('Repair adhesive, B-7000 (50 ml)', 'Tools and kits', 'Clear flexible glue for screen frames, back covers and small parts.', 450),
  ('Anti-static mat and wrist strap', 'Tools and kits', 'Protects boards from static while you work. Includes grounding cord.', 1500),
  ('LED magnifier lamp, desk', 'Tools and kits', 'Bright lamp with magnifying lens for small soldering and board inspection.', 3800),
  ('Isopropyl alcohol 99% (500 ml)', 'Tools and kits', 'Cleans boards, ports and screens. Dries fast and leaves no residue.', 950),
  ('Thermal paste (4 g syringe)', 'Tools and kits', 'For laptop CPU and GPU heat sinks. Fixes overheating after cleaning.', 600),
  ('Phone screen, Samsung Galaxy A-series', 'Phone screens', 'Replacement display with touch. Tell us your exact model on WhatsApp so we send the right one.', 4500),
  ('Phone screen, Tecno and Infinix', 'Phone screens', 'Replacement display with touch for common Tecno and Infinix models. Ask for your model.', 3200),
  ('Phone screen, iPhone', 'Phone screens', 'Replacement display for iPhone models. Ask for your model and preferred quality.', 5500),
  ('Phone screen protector, tempered glass', 'Accessories', 'Tempered glass protector. Ask for your phone model.', 300),
  ('Phone battery, Samsung', 'Batteries', 'Replacement battery for common Samsung models. Ask for your model.', 1800),
  ('Phone battery, Tecno and Infinix', 'Batteries', 'Replacement battery for common Tecno and Infinix models. Ask for your model.', 1500),
  ('Phone battery, iPhone', 'Batteries', 'Replacement battery for iPhone models. Ask for your model.', 2800),
  ('Charging port flex, Android', 'Other', 'Replacement charging port board for common Android phones. Ask for your model.', 900),
  ('Fast charger and USB-C cable', 'Chargers and cables', 'Wall charger with USB-C cable for most Android phones.', 1200),
  ('Lightning charging cable, 1 m', 'Chargers and cables', 'Charging and data cable for iPhone and iPad.', 900),
  ('Laptop charger, universal', 'Chargers and cables', 'Adjustable-voltage laptop charger with tips for common brands. Ask us to confirm it fits.', 2500),
  ('Laptop battery, replacement', 'Laptop parts', 'Replacement battery for common HP, Dell and Lenovo models. Ask for your model.', 4500),
  ('Laptop keyboard, replacement', 'Laptop parts', 'Replacement keyboard for common laptop models. Ask for your model.', 2500),
  ('Laptop screen, 15.6 inch', 'Laptop parts', 'Replacement 15.6 inch laptop display. Ask us to confirm connector type for your model.', 7500),
  ('Laptop cooling fan', 'Laptop parts', 'Replacement fan for noisy or overheating laptops. Ask for your model.', 1800),
  ('SSD, 256 GB SATA', 'Laptop parts', 'Solid state drive to speed up an older laptop. We can install it and move your data.', 3800),
  ('SSD, 512 GB SATA', 'Laptop parts', 'Solid state drive for more space and faster start-up. We can install it for you.', 6000),
  ('RAM, 8 GB DDR4 laptop', 'Laptop parts', 'Memory upgrade for laptops that run slowly with many programs open. Ask us to confirm compatibility.', 3800),
  ('USB external drive enclosure, 2.5 inch', 'Accessories', 'Turns an old laptop hard drive or SSD into a portable drive.', 1200)
) as v(name, category, description, price_kes)
where not exists (select 1 from public.products p where p.name = v.name);

-- After reviewing prices, uncomment and run to publish them all:
-- update public.products set active = true where active = false;
