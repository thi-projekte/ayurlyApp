package de.ayurly.app.dataservice.entity.content;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "content_items")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "content_type", discriminatorType = DiscriminatorType.STRING)
public abstract class ContentItem extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "title", nullable = false)
    public String title;

    @Column(name = "image_url")
    public String imageUrl;

    @Column(name = "preview_description", columnDefinition = "TEXT")
    public String previewDescription;

    @Column(name = "content_type", insertable = false, updatable = false, nullable = false)
    public String contentType;

    @Column(name = "like_count", nullable = false, columnDefinition = "INT DEFAULT 0") 
    public int likeCount = 0;

    @OneToMany(mappedBy = "contentItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY) 
    private List<ContentLike> likes = new ArrayList<>(); // Liste der Likes, nicht direkt exponiert, aber für ORM-Beziehung

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    public OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    public OffsetDateTime updatedAt;

    public List<ContentLike> getLikes() {
        return likes;
    }
}