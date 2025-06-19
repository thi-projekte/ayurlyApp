package de.ayurly.app.dataservice.entity.content.yoga;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "yoga_exercise_effects")
public class YogaExerciseEffect extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "yoga_exercise_content_id", nullable = false)
    public YogaExerciseContent yogaExerciseContent;

    @Column(name = "effect_text", nullable = false, columnDefinition = "TEXT")
    public String effectText;

    @Column(name = "sort_order")
    public int sortOrder = 0;
}