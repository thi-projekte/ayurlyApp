package de.ayurly.app.dataservice.entity.content;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "content_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"content_item_id", "user_id"})
})
public class ContentLike extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_item_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    public ContentItem contentItem;

    @Column(name = "user_id", nullable = false)
    public String userId; // Keycloak User ID

    @CreationTimestamp
    @Column(name = "liked_at", updatable = false)
    public OffsetDateTime likedAt;

    public ContentLike() {}

    public ContentLike(ContentItem contentItem, String userId) {
        this.contentItem = contentItem;
        this.userId = userId;
    }
}