-- Tabelle für allgemeine Content-Metadaten
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('RECIPE', 'YOGA_EXERCISE', 'PRODUCT')), -- TODO: mit FK ersetzen
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    preview_description TEXT,
    like_count INT DEFAULT 0, 
    -- Ideen für später
    -- author_id UUID, 
    -- status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_items_content_type ON content_items(content_type);
CREATE INDEX idx_content_items_title ON content_items(title); 
CREATE INDEX idx_content_items_like_count ON content_items(like_count DESC); 

-- Tabelle für rezeptspezifische Details
CREATE TABLE recipe_details (
    content_id UUID PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE, -- 1:1 Beziehung und Primärschlüssel ist auch Fremdschlüssel
    description TEXT,
    dosha_types VARCHAR(50)[], -- Array von Strings, z.B. {'Vata', 'Pitta'} oder {'Tridoshic'}
    preparation_time_minutes INT,
    number_of_portions INT
);

CREATE INDEX idx_recipe_details_dosha_types ON recipe_details USING GIN (dosha_types);

-- Tabelle für Rezept-Vorteile (1:n Beziehung zu recipe_details)
CREATE TABLE recipe_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_content_id UUID NOT NULL REFERENCES recipe_details(content_id) ON DELETE CASCADE,
    benefit_text TEXT NOT NULL,
    sort_order INT DEFAULT 0 
);

CREATE INDEX idx_recipe_benefits_recipe_content_id ON recipe_benefits(recipe_content_id);

-- Tabelle für Zutaten (1:n Beziehung zu recipe_details)
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_content_id UUID NOT NULL REFERENCES recipe_details(content_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100), -- z.B. "100", "1", "nach Bedarf"
    unit VARCHAR(50), -- z.B. "g", "ml", "Stück", "TL"
    notes TEXT
);

CREATE INDEX idx_recipe_ingredients_recipe_content_id ON recipe_ingredients(recipe_content_id);

-- Tabelle für Zubereitungsschritte (1:n Beziehung zu recipe_details)
CREATE TABLE recipe_preparation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_content_id UUID NOT NULL REFERENCES recipe_details(content_id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    description TEXT NOT NULL,
    CONSTRAINT unique_step_per_recipe_content UNIQUE (recipe_content_id, step_number)
);

CREATE INDEX idx_recipe_preparation_steps_recipe_content_id ON recipe_preparation_steps(recipe_content_id);

-- Tabelle für Yoga-Übung-spezifische Details
CREATE TABLE yoga_exercise_details (
    content_id UUID PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
    description TEXT,
    video_url VARCHAR(255),
    dosha_types VARCHAR(50)[] -- Array für Vata, Pitta, Kapha
);

-- Tabelle für die Wirkungen der Yoga-Übung
CREATE TABLE yoga_exercise_effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yoga_exercise_content_id UUID NOT NULL REFERENCES yoga_exercise_details(content_id) ON DELETE CASCADE,
    effect_text TEXT NOT NULL,
    sort_order INT DEFAULT 0
);
CREATE INDEX idx_yoga_exercise_effects_yoga_id ON yoga_exercise_effects(yoga_exercise_content_id);

-- Tabelle für zusätzliche Tipps
CREATE TABLE yoga_exercise_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yoga_exercise_content_id UUID NOT NULL REFERENCES yoga_exercise_details(content_id) ON DELETE CASCADE,
    tip_text TEXT NOT NULL,
    sort_order INT DEFAULT 0
);
CREATE INDEX idx_yoga_exercise_tips_yoga_id ON yoga_exercise_tips(yoga_exercise_content_id);

-- Tabelle für die Haupt-Schritte der Anleitung
CREATE TABLE yoga_exercise_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yoga_exercise_content_id UUID NOT NULL REFERENCES yoga_exercise_details(content_id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    CONSTRAINT unique_step_per_yoga_exercise UNIQUE (yoga_exercise_content_id, step_number)
);
CREATE INDEX idx_yoga_exercise_steps_yoga_id ON yoga_exercise_steps(yoga_exercise_content_id);


-- Tabelle für die untergeordneten Schritte (Teilschritte)
CREATE TABLE yoga_exercise_sub_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    main_step_id UUID NOT NULL REFERENCES yoga_exercise_steps(id) ON DELETE CASCADE,
    sub_step_number INT NOT NULL,
    description TEXT NOT NULL,
    CONSTRAINT unique_sub_step_per_main_step UNIQUE (main_step_id, sub_step_number)
);
CREATE INDEX idx_yoga_exercise_sub_steps_main_step_id ON yoga_exercise_sub_steps(main_step_id);


-- Tabelle für produktspezifische Details
CREATE TABLE product_details (
    content_id UUID PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
    description TEXT,
    price NUMERIC(10, 2), 
    weight NUMERIC(10, 3),
    unit VARCHAR(10) CHECK (unit IN ('g', 'kg', 'ml', 'l', 'Stück')),
    external_link VARCHAR(255), -- Link zum "Entdecken"-Button
    dosha_types VARCHAR(50)[] -- Array für Vata, Pitta, Kapha
);

CREATE INDEX idx_product_details_dosha_types ON product_details USING GIN (dosha_types);

-- Tabelle für Produkt-Vorteile (analog zu Rezept-Vorteilen)
CREATE TABLE product_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_content_id UUID NOT NULL REFERENCES product_details(content_id) ON DELETE CASCADE,
    benefit_text TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE INDEX idx_product_benefits_product_content_id ON product_benefits(product_content_id);

-- Tabelle für Produkt-Wirkstoffe
CREATE TABLE product_active_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_content_id UUID NOT NULL REFERENCES product_details(content_id) ON DELETE CASCADE,
    ingredient_text TEXT NOT NULL, -- z.B. "150 mg Kurkuma-Extrakt (stark entzündungshemmend)"
    sort_order INT DEFAULT 0
);

CREATE INDEX idx_product_active_ingredients_product_content_id ON product_active_ingredients(product_content_id);

-- Tabelle für Produkt-Anwendungsschritte
CREATE TABLE product_application_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_content_id UUID NOT NULL REFERENCES product_details(content_id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    description TEXT NOT NULL,
    CONSTRAINT unique_step_per_product_content UNIQUE (product_content_id, step_number)
);

CREATE INDEX idx_product_application_steps_product_content_id ON product_application_steps(product_content_id);


-- Tabelle für Likes
CREATE TABLE content_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Keycloak User ID
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_like_per_content UNIQUE (content_item_id, user_id) -- Jeder User kann einen Content nur einmal liken
);

CREATE INDEX idx_content_likes_content_item_id ON content_likes(content_item_id);
CREATE INDEX idx_content_likes_user_id ON content_likes(user_id);


-- Trigger-Funktion, um updated_at automatisch zu aktualisieren 
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für die content_items Tabelle
CREATE TRIGGER set_timestamp_content_items
BEFORE UPDATE ON content_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Kommentare 
COMMENT ON TABLE content_items IS 'Basis-Tabelle für alle Arten von Content (Rezepte, Yoga, Artikel etc.). Enthält gemeinsame Metadaten.';
COMMENT ON COLUMN content_items.id IS 'Eindeutige UUID für jeden Content-Eintrag, dient als übergreifende ID.';
COMMENT ON COLUMN content_items.content_type IS 'Typ des Contents, z.B. RECIPE, YOGA_EXERCISE.';
COMMENT ON COLUMN content_items.title IS 'Titel des Content-Eintrags.';
COMMENT ON COLUMN content_items.image_url IS 'URL zu einem repräsentativen Bild.';
COMMENT ON COLUMN content_items.preview_description IS 'Kurze Vorschau-Beschreibung.';
COMMENT ON COLUMN content_items.like_count IS 'Anzahl der Likes für diesen Content-Eintrag.';


COMMENT ON TABLE recipe_details IS 'Speichert die spezifischen Details für Content-Einträge vom Typ RECIPE.';
COMMENT ON COLUMN recipe_details.content_id IS 'Fremdschlüssel zur content_items Tabelle, identifiziert das zugehörige Rezept.';
COMMENT ON COLUMN recipe_details.dosha_types IS 'Array der Dosha-Typen, für die das Rezept geeignet ist.';

COMMENT ON TABLE recipe_benefits IS 'Speichert die einzelnen Vorteile/Benefits für Rezepte.';
COMMENT ON COLUMN recipe_benefits.benefit_text IS 'Der Text des Vorteils.';
COMMENT ON COLUMN recipe_benefits.sort_order IS 'Definiert die Anzeigereihenfolge der Vorteile.';

COMMENT ON TABLE recipe_ingredients IS 'Speichert die Zutaten für Rezepte. Verweist auf recipe_details.';
COMMENT ON TABLE recipe_preparation_steps IS 'Speichert die Zubereitungsschritte für Rezepte. Verweist auf recipe_details.';

COMMENT ON TABLE yoga_exercise_details IS 'Speichert die spezifischen Details für Content-Einträge vom Typ YOGA_EXERCISE.';
COMMENT ON COLUMN yoga_exercise_details.video_url IS 'URL zum Video der Übung (z.B. YouTube, Vimeo).';
COMMENT ON TABLE yoga_exercise_effects IS 'Speichert die Wirkungen/Vorteile einer Yoga-Übung.';
COMMENT ON TABLE yoga_exercise_tips IS 'Speichert zusätzliche Tipps zu einer Yoga-Übung.';
COMMENT ON TABLE yoga_exercise_steps IS 'Speichert die Hauptschritte der Anleitung für eine Yoga-Übung.';
COMMENT ON TABLE yoga_exercise_sub_steps IS 'Speichert die Teilschritte eines Hauptschritts der Anleitung.';

COMMENT ON TABLE product_details IS 'Speichert die spezifischen Details für Content-Einträge vom Typ PRODUCT.';
COMMENT ON COLUMN product_details.content_id IS 'Fremdschlüssel zur content_items Tabelle, identifiziert das zugehörige Produkt.';
COMMENT ON COLUMN product_details.price IS 'Der reine Produktpreis in Euro.';
COMMENT ON COLUMN product_details.weight IS 'Das Gewicht oder die Inhaltsmenge des Produkts.';
COMMENT ON COLUMN product_details.unit IS 'Die Einheit für das Gewicht/den Inhalt (g, kg, ml, l, Stück).';
COMMENT ON COLUMN product_details.external_link IS 'URL zum Kaufen oder für weitere Informationen.';
COMMENT ON COLUMN product_details.dosha_types IS 'Array der Dosha-Typen, für die das Produkt geeignet ist.';


COMMENT ON TABLE content_likes IS 'Speichert, welcher Benutzer welchen Content-Eintrag geliked hat.';
COMMENT ON COLUMN content_likes.content_item_id IS 'Fremdschlüssel zum gelikten Content-Eintrag.';
COMMENT ON COLUMN content_likes.user_id IS 'Die ID des Benutzers (aus Keycloak), der geliked hat.';
COMMENT ON COLUMN content_likes.liked_at IS 'Zeitstempel, wann der Like gegeben wurde.';