package de.ayurly.app.dataservice.entity.content.yoga;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "yoga_exercise_sub_steps")
public class YogaExerciseSubStep extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_step_id", nullable = false)
    public YogaExerciseStep mainStep;

    @Column(name = "sub_step_number", nullable = false)
    public int subStepNumber;

    @Column(columnDefinition = "TEXT", nullable = false)
    public String description;
}