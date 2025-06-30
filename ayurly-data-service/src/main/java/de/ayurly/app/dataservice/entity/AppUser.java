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

    @Column(name = "show_morning_flow")
    public boolean showMorningFlow = true;

    @Column(name = "show_evening_flow")
    public boolean showEveningFlow = true;

    @Column(name = "show_zen_move")
    public boolean showZenMove = true;

    @Column(name = "show_nourish_cycle")
    public boolean showNourishCycle = true;

    @Column(name = "show_rest_cycle")
    public boolean showRestCycle = true;

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

    public boolean isShowMorningFlow() {
        return showMorningFlow;
    }

    public boolean isShowEveningFlow() {
        return showEveningFlow;
    }

    public boolean isShowZenMove() {
        return showZenMove;
    }

    public boolean isShowNourishCycle() {
        return showNourishCycle;
    }

    public boolean isShowRestCycle() {
        return showRestCycle;
    }

    public void setShowMorningFlow(boolean showMorningFlow) {
        this.showMorningFlow = showMorningFlow;
    }

    public void setShowEveningFlow(boolean showEveningFlow) {
        this.showEveningFlow = showEveningFlow;
    }

    public void setShowZenMove(boolean showZenMove) {
        this.showZenMove = showZenMove;
    }

    public void setShowNourishCycle(boolean showNourishCycle) {
        this.showNourishCycle = showNourishCycle;
    }

    public void setShowRestCycle(boolean showRestCycle) {
        this.showRestCycle = showRestCycle;
    }

    
}