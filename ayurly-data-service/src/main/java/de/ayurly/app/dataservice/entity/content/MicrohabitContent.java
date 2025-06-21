package de.ayurly.app.dataservice.entity.content;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import de.ayurly.app.dataservice.entity.lookup.LookupRoutineTile;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "microhabit_details")
@DiscriminatorValue("MICROHABIT")
@PrimaryKeyJoinColumn(name = "content_id")
public class MicrohabitContent extends ContentItem {

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "dosha_types", columnDefinition = "varchar(50)[]")
    public String[] doshaTypes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_tile_id")
    public LookupRoutineTile routineTile;
}