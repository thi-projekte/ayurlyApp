-- Tabelle für allgemeine Content-Metadaten
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('RECIPE', 'YOGA_EXERCISE', 'ARTICLE')), -- Erweiterbar
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(255), -- URL zum Bild
    preview_description TEXT,
    like_count INT DEFAULT 0, -- NEU: Zähler für Likes
    -- Hier könnten weitere gemeinsame Felder hinzukommen:
    -- author_id UUID, -- Falls es Autoren gibt, die Content erstellen
    -- status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_items_content_type ON content_items(content_type);
CREATE INDEX idx_content_items_title ON content_items(title); -- Für Suche nach Titel
CREATE INDEX idx_content_items_like_count ON content_items(like_count DESC); -- NEU: Für beliebteste Inhalte

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
    sort_order INT DEFAULT 0 -- Für die Reihenfolge der Vorteile
);

CREATE INDEX idx_recipe_benefits_recipe_content_id ON recipe_benefits(recipe_content_id);

-- Tabelle für Zutaten (1:n Beziehung zu recipe_details)
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_content_id UUID NOT NULL REFERENCES recipe_details(content_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100), -- z.B. "100", "1", "nach Bedarf"
    unit VARCHAR(50), -- z.B. "g", "ml", "Stück", "TL"
    notes TEXT -- Optionale Anmerkungen zur Zutat
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

-- NEUE Tabelle für Likes
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

-- Kommentare (optional, aber empfohlen)
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

COMMENT ON TABLE content_likes IS 'Speichert, welcher Benutzer welchen Content-Eintrag geliked hat.';
COMMENT ON COLUMN content_likes.content_item_id IS 'Fremdschlüssel zum gelikten Content-Eintrag.';
COMMENT ON COLUMN content_likes.user_id IS 'Die ID des Benutzers (aus Keycloak), der geliked hat.';
COMMENT ON COLUMN content_likes.liked_at IS 'Zeitstempel, wann der Like gegeben wurde.';