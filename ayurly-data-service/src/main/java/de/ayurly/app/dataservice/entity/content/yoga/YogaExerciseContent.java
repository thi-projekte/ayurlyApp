package de.ayurly.app.dataservice.entity.content.yoga;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import de.ayurly.app.dataservice.entity.content.ContentItem;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "yoga_exercise_details")
@DiscriminatorValue("YOGA_EXERCISE")
@PrimaryKeyJoinColumn(name = "content_id")
public class YogaExerciseContent extends ContentItem {

    @Column(name = "video_url")
    public String videoUrl;

    @Column(columnDefinition = "TEXT")
    public String description;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "dosha_types", columnDefinition = "varchar(50)[]")
    public String[] doshaTypes;

    @OneToMany(mappedBy = "yogaExerciseContent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, effectText ASC")
    public List<YogaExerciseEffect> effects = new ArrayList<>();

    @OneToMany(mappedBy = "yogaExerciseContent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, tipText ASC")
    public List<YogaExerciseTip> tips = new ArrayList<>();

    @OneToMany(mappedBy = "yogaExerciseContent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stepNumber ASC")
    public List<YogaExerciseStep> steps = new ArrayList<>();
    
    // Add/Remove methods for effects
    public void addEffect(YogaExerciseEffect effect) {
        effects.add(effect);
        effect.yogaExerciseContent = this;
    }
    public void removeEffect(YogaExerciseEffect effect) {
        effects.remove(effect);
        effect.yogaExerciseContent = null;
    }
    
    // Add/Remove methods for tips
    public void addTip(YogaExerciseTip tip) {
        tips.add(tip);
        tip.yogaExerciseContent = this;
    }
    public void removeTip(YogaExerciseTip tip) {
        tips.remove(tip);
        tip.yogaExerciseContent = null;
    }

    // Add/Remove methods for steps
    public void addStep(YogaExerciseStep step) {
        steps.add(step);
        step.yogaExerciseContent = this;
    }
    public void removeStep(YogaExerciseStep step) {
        steps.remove(step);
        step.yogaExerciseContent = null;
    }
}