-- Lookup-Tabelle für Dosha-Typen (verwendbar für User und Rezepte)
CREATE TABLE lookup_dosha_types (
    id SERIAL PRIMARY KEY, -- Einfacher auto-increment Integer als PK
    value VARCHAR(50) UNIQUE NOT NULL, -- z.B. 'Vata', 'Pitta', 'Kapha', 'Tridoshic'
    label VARCHAR(100), -- Angezeigter Name, falls abweichend vom Wert, z.B. "🌀 Vata"
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE, -- Um Typen ggf. deaktivieren zu können
    sort_order INT DEFAULT 0 -- Für die Reihenfolge im Dropdown
);

-- Lookup-Tabelle für Content-Typen
CREATE TABLE lookup_content_types (
    id SERIAL PRIMARY KEY,
    value VARCHAR(50) UNIQUE NOT NULL, -- z.B. 'RECIPE', 'YOGA_EXERCISE', 'PRODUCT'
    label VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

-- Lookup-Tabelle für Einheiten (z.B. für Zutaten)
CREATE TABLE lookup_units (
    id SERIAL PRIMARY KEY,
    value VARCHAR(50) UNIQUE NOT NULL, -- z.B. 'g', 'ml', 'Stück', 'TL', 'EL'
    label VARCHAR(100), -- z.B. 'Gramm', 'Milliliter', 'Stück', 'Teelöffel'
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

CREATE TABLE lookup_routine_tiles (
    id SERIAL PRIMARY KEY,
    tile_key VARCHAR(50) UNIQUE NOT NULL, -- z.B. 'MORNING_FLOW', 'ZEN_MOVE'
    title VARCHAR(100) NOT NULL,          -- z.B. '🌞 MorningFlow'
    sort_order INT DEFAULT 0
);


-- Startdaten für die Lookup-Tabellen (können später über Admin-UI verwaltet werden)
INSERT INTO lookup_dosha_types (value, label, sort_order) VALUES
('Vata', '🌀 Vata', 10),
('Pitta', '🔥 Pitta', 20),
('Kapha', '🌱 Kapha', 30),
('Tridoshic', '✨ Tridoshic (für alle)', 40);

INSERT INTO lookup_content_types (value, label, sort_order) VALUES
('RECIPE', 'Rezept', 10),
('YOGA_EXERCISE', 'Yoga-Übung', 20),
('PRODUCT', 'Produkt', 30);

INSERT INTO lookup_units (value, label, sort_order) VALUES
('g', 'Gramm (g)', 10),
('kg', 'Kilogramm (kg)', 20),
('ml', 'Milliliter (ml)', 30),
('l', 'Liter (l)', 40),
('Stück', 'Stück', 50),
('Prise', 'Prise', 60),
('TL', 'Teelöffel (TL)', 70),
('EL', 'Esslöffel (EL)', 80),
('Tasse', 'Tasse', 90),
('Bund', 'Bund', 100),
('optional', 'optional', 900),
('nach Bedarf', 'nach Bedarf', 910);

INSERT INTO lookup_routine_tiles (tile_key, title, sort_order) VALUES
('MORNING_FLOW', '🌞 MorningFlow', 10),
('EVENING_FLOW', '🌙 EveningFlow', 20),
('ZEN_MOVE', '🧘‍♀️ ZenMove', 30),
('NOURISH_CYCLE', '🍽️ NourishCycle', 40),
('REST_CYCLE', '💤 RestCycle', 50);