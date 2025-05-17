-- Erstelle die Tabelle app_user
CREATE TABLE app_user (
    keycloak_id VARCHAR(255), -- UUID aus KeyCloak / primary Key
    dosha_type VARCHAR(255),           
    -- Optionale Felder, falls doch in der Entität und DB aufgenommen wird (redundant zu KeyCloak):
    -- username VARCHAR(255) UNIQUE,    -- Eindeutiger Benutzername
    -- email VARCHAR(255) UNIQUE,       -- Eindeutige E-Mail
    PRIMARY KEY (keycloak_id)
);

-- Optional: Kommentare zu den Spalten hinzufügen (gut für die Dokumentation)
COMMENT ON COLUMN app_user.keycloak_id IS 'Eindeutige Benutzer-ID von Keycloak (sub claim). Primärschlüssel.';
COMMENT ON COLUMN app_user.dosha_type IS 'Der zum Benutzer ermittelte Dosha-Typ (z.B. Vata, Pitta, Kapha).';
-- COMMENT ON COLUMN app_user.username IS 'Der Benutzername des Users, synchronisiert von Keycloak (optional).';
-- COMMENT ON COLUMN app_user.email IS 'Die E-Mail-Adresse des Users, synchronisiert von Keycloak (optional).';

