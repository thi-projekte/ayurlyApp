package de.ayurly.app.dataservice.entity.content.recipe;

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
@Table(name = "recipe_details")
@DiscriminatorValue("RECIPE")
@PrimaryKeyJoinColumn(name = "content_id")
public class RecipeContent extends ContentItem {

    @Column(columnDefinition = "TEXT")
    public String description;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "dosha_types", columnDefinition = "varchar(50)[]")
    public String[] doshaTypes;

    @Column(name = "preparation_time_minutes")
    public Integer preparationTimeMinutes;

    @Column(name = "number_of_portions")
    public Integer numberOfPortions;

    @OneToMany(mappedBy = "recipeContent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("name ASC")
    public List<RecipeIngredient> ingredients = new ArrayList<>();

    @OneToMany(mappedBy = "recipeContent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stepNumber ASC")
    public List<RecipePreparationStep> preparationSteps = new ArrayList<>();

    @OneToMany(mappedBy = "recipeContent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, benefitText ASC") // Sortierung nach sortOrder, dann Text
    public List<RecipeBenefit> benefits = new ArrayList<>();

    public void addIngredient(RecipeIngredient ingredient) {
        ingredients.add(ingredient);
        ingredient.recipeContent = this;
    }

    public void removeIngredient(RecipeIngredient ingredient) {
        ingredients.remove(ingredient);
        ingredient.recipeContent = null;
    }

    public void addPreparationStep(RecipePreparationStep step) {
        preparationSteps.add(step);
        step.recipeContent = this;
    }

    public void removePreparationStep(RecipePreparationStep step) {
        preparationSteps.remove(step);
        step.recipeContent = null;
    }

    public void addBenefit(RecipeBenefit benefit) {
        benefits.add(benefit);
        benefit.recipeContent = this;
    }

    public void removeBenefit(RecipeBenefit benefit) {
        benefits.remove(benefit);
        benefit.recipeContent = null;
    }
}