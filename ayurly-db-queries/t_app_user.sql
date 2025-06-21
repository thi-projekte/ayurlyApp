CREATE TABLE app_user (
    keycloak_id VARCHAR(255), -- UUID aus KeyCloak / primary Key
    dosha_type VARCHAR(255),
    show_morning_flow BOOLEAN DEFAULT TRUE,
    show_evening_flow BOOLEAN DEFAULT TRUE,
    show_zen_move BOOLEAN DEFAULT TRUE,
    show_nourish_cycle BOOLEAN DEFAULT TRUE,
    show_rest_cycle BOOLEAN DEFAULT TRUE;
    PRIMARY KEY (keycloak_id)
);

COMMENT ON COLUMN app_user.keycloak_id IS 'Eindeutige Benutzer-ID von Keycloak (sub claim). Primärschlüssel.';
COMMENT ON COLUMN app_user.dosha_type IS 'Der zum Benutzer ermittelte Dosha-Typ (z.B. Vata, Pitta, Kapha).';

