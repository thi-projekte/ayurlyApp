package de.ayurly.app.dataservice.entity.lookup;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "lookup_units")
public class LookupUnit extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @Column(unique = true, nullable = false, length = 50)
    public String value;

    @Column(length = 100)
    public String label;

    @Column(name = "is_active")
    public boolean isActive = true;

    @Column(name = "sort_order")
    public int sortOrder = 0;
}