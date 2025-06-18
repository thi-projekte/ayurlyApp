package de.ayurly.app.dataservice.entity.content.product;

import java.math.BigDecimal;
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
@Table(name = "product_details")
@DiscriminatorValue("PRODUCT")
@PrimaryKeyJoinColumn(name = "content_id")
public class ProductContent extends ContentItem {

    @Column(columnDefinition = "TEXT")
    public String description;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "dosha_types", columnDefinition = "varchar(50)[]")
    public String[] doshaTypes;
    
    @Column(name = "price", precision = 10, scale = 2)
    public BigDecimal price;

    @Column(name = "weight", precision = 10, scale = 3)
    public BigDecimal weight;

    @Column(name = "unit")
    public String unit;

    @Column(name = "external_link")
    public String externalLink;

    @OneToMany(mappedBy = "productContent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, benefitText ASC")
    public List<ProductBenefit> benefits = new ArrayList<>();

    @OneToMany(mappedBy = "productContent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, ingredientText ASC")
    public List<ProductActiveIngredient> activeIngredients = new ArrayList<>();
    
    @OneToMany(mappedBy = "productContent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stepNumber ASC")
    public List<ProductApplicationStep> applicationSteps = new ArrayList<>();


    public void addBenefit(ProductBenefit benefit) {
        benefits.add(benefit);
        benefit.productContent = this;
    }

    public void removeBenefit(ProductBenefit benefit) {
        benefits.remove(benefit);
        benefit.productContent = null;
    }

    public void addActiveIngredient(ProductActiveIngredient ingredient) {
        activeIngredients.add(ingredient);
        ingredient.productContent = this;
    }

    public void removeActiveIngredient(ProductActiveIngredient ingredient) {
        activeIngredients.remove(ingredient);
        ingredient.productContent = null;
    }

    public void addApplicationStep(ProductApplicationStep step) {
        applicationSteps.add(step);
        step.productContent = this;
    }

    public void removeApplicationStep(ProductApplicationStep step) {
        applicationSteps.remove(step);
        step.productContent = null;
    }
}