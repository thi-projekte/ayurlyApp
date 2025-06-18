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
@Table(name = "product_benefits")
public class ProductBenefit extends PanacheEntityBase {
    
    @Id
    @GeneratedValue
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_content_id", nullable = false)
    public ProductContent productContent;

    @Column(name = "benefit_text", nullable = false, columnDefinition = "TEXT")
    public String benefitText;

    @Column(name = "sort_order")
    public int sortOrder = 0;

    public ProductBenefit() {}

    public ProductBenefit(String benefitText, int sortOrder) {
        this.benefitText = benefitText;
        this.sortOrder = sortOrder;
    }
}