package de.ayurly.app.dataservice.entity.user;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import de.ayurly.app.dataservice.entity.AppUser;
import de.ayurly.app.dataservice.entity.lookup.LookupRoutineTile;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "myayurly_history")
public class MyAyurlyHistory extends PanacheEntityBase {
    @Id @GeneratedValue public UUID id;
    
    @ManyToOne @JoinColumn(name = "user_id", nullable = false)
    public AppUser user;
    
    @Column(name = "calendar_date", nullable = false)
    public LocalDate calendarDate;

    @ManyToOne @JoinColumn(name = "routine_tile_id", nullable = false)
    public LookupRoutineTile routineTile;
    
    @Column(name = "dosha_type", nullable = false)
    public String doshaType;

    @Column(name = "total_tasks")
    public int totalTasks;

    @Column(name = "completed_tasks")
    public int completedTasks;
    
    @Column(name = "progress_percentage", precision = 5, scale = 2)
    public BigDecimal progressPercentage;
}