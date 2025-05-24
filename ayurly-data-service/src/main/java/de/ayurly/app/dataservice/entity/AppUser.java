package de.ayurly.app.dataservice.entity; 

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_user") 
public class AppUser extends PanacheEntityBase {

    @Id
    @Column(name = "keycloak_id", unique = true, nullable = false) // Eindeutige ID von Keycloak (sub Claim)
    public String id;

    // Fachliche Daten
    @Column(name = "dosha_type")
    public String doshaType;

    // Standardkonstruktor (wird von JPA benötigt)
    public AppUser() {
    }

    public AppUser(String id) {
        this.id = id;
    }

    // Getter und Setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDoshaType() {
        return doshaType;
    }

    public void setDoshaType(String doshaType) {
        this.doshaType = doshaType;
    }
}