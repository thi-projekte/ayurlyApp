package de.ayurly.app.dataservice.entity.user;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.UpdateTimestamp;

import de.ayurly.app.dataservice.entity.AppUser;
import de.ayurly.app.dataservice.entity.content.ContentItem;
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
@Table(name = "myayurly_content")
public class MyAyurlyContent extends PanacheEntityBase {
    @Id @GeneratedValue public UUID id;
    
    @ManyToOne @JoinColumn(name = "user_id", nullable = false)
    public AppUser user;
    
    @Column(name = "calendar_date", nullable = false)
    public LocalDate calendarDate;

    @ManyToOne @JoinColumn(name = "routine_tile_id", nullable = false)
    public LookupRoutineTile routineTile;

    @ManyToOne @JoinColumn(name = "content_item_id", nullable = false)
    public ContentItem contentItem;

    @Column(name = "is_done")
    public boolean isDone = false;

    @UpdateTimestamp @Column(name = "updated_at")
    public OffsetDateTime updatedAt;
}