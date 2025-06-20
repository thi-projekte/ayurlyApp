package de.ayurly.app.dataservice.entity.content;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "microhabit_details")
@DiscriminatorValue("MICROHABIT")
@PrimaryKeyJoinColumn(name = "content_id")
public class MicrohabitContent extends ContentItem {

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "dosha_types", columnDefinition = "varchar(50)[]")
    public String[] doshaTypes;
}