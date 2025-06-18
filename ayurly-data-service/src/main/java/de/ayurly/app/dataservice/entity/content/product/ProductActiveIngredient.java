package de.ayurly.app.dataservice.entity.content.product;

import java.util.UUID;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_active_ingredients")
public class ProductActiveIngredient extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_content_id", nullable = false)
    public ProductContent productContent;

    @Column(name = "ingredient_text", nullable = false, columnDefinition = "TEXT")
    public String ingredientText;

    @Column(name = "sort_order")
    public int sortOrder = 0;

    public ProductActiveIngredient() {}

    public ProductActiveIngredient(String ingredientText, int sortOrder) {
        this.ingredientText = ingredientText;
        this.sortOrder = sortOrder;
    }
}