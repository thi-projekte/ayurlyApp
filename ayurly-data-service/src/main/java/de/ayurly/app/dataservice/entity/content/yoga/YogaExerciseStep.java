package de.ayurly.app.dataservice.entity.content.yoga;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "yoga_exercise_steps")
public class YogaExerciseStep extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "yoga_exercise_content_id", nullable = false)
    public YogaExerciseContent yogaExerciseContent;

    @Column(name = "step_number", nullable = false)
    public int stepNumber;

    public String title;
    
    @Column(columnDefinition = "TEXT")
    public String description;

    @OneToMany(mappedBy = "mainStep", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("subStepNumber ASC")
    public List<YogaExerciseSubStep> subSteps = new ArrayList<>();

    public void addSubStep(YogaExerciseSubStep subStep) {
        subSteps.add(subStep);
        subStep.mainStep = this;
    }

    public void removeSubStep(YogaExerciseSubStep subStep) {
        subSteps.remove(subStep);
        subStep.mainStep = null;
    }
}