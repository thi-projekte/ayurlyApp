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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "product_application_steps", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_content_id", "step_number"})
})
public class ProductApplicationStep extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_content_id", nullable = false)
    public ProductContent productContent;

    @Column(name = "step_number", nullable = false)
    public int stepNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String description;
}