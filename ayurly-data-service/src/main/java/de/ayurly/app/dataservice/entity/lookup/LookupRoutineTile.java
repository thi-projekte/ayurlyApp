package de.ayurly.app.dataservice.entity.lookup;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "lookup_routine_tiles")
public class LookupRoutineTile extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @Column(name = "tile_key", unique = true, nullable = false)
    public String tileKey;

    @Column(nullable = false)
    public String title;
    
    @Column(name = "sort_order")
    public int sortOrder;
}