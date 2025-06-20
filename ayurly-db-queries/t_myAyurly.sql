-- Tabelle, die den Inhalt für einen User an einem bestimmten Tag speichert
CREATE TABLE myayurly_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES app_user(keycloak_id) ON DELETE CASCADE,
    calendar_date DATE NOT NULL,
    routine_tile_id INT NOT NULL REFERENCES lookup_routine_tiles(id),
    content_item_id UUID NOT NULL REFERENCES content_items(id),
    is_done BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_day_content UNIQUE (user_id, calendar_date, content_item_id)
);

CREATE INDEX idx_myayurly_content_user_date ON myayurly_content(user_id, calendar_date);

-- Tabelle für die aggregierte Fortschritts-Historie
CREATE TABLE myayurly_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES app_user(keycloak_id) ON DELETE CASCADE,
    calendar_date DATE NOT NULL,
    routine_tile_id INT NOT NULL REFERENCES lookup_routine_tiles(id),
    dosha_type VARCHAR(50) NOT NULL,
    total_tasks INT NOT NULL,
    completed_tasks INT NOT NULL,
    progress_percentage NUMERIC(5, 2) NOT NULL,
    CONSTRAINT unique_history_entry UNIQUE (user_id, calendar_date, routine_tile_id, dosha_type)
);

CREATE INDEX idx_myayurly_history_user_date ON myayurly_history(user_id, calendar_date);
