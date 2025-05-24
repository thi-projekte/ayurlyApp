CREATE TABLE app_user (
    keycloak_id VARCHAR(255), -- UUID aus KeyCloak / primary Key
    dosha_type VARCHAR(255),
    PRIMARY KEY (keycloak_id)
);

COMMENT ON COLUMN app_user.keycloak_id IS 'Eindeutige Benutzer-ID von Keycloak (sub claim). Primärschlüssel.';
COMMENT ON COLUMN app_user.dosha_type IS 'Der zum Benutzer ermittelte Dosha-Typ (z.B. Vata, Pitta, Kapha).';

