package de.ayurly.app.dataservice.resource;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import de.ayurly.app.dataservice.entity.lookup.LookupContentType;
import de.ayurly.app.dataservice.entity.lookup.LookupDoshaType;
import de.ayurly.app.dataservice.entity.lookup.LookupUnit;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import io.quarkus.panache.common.Sort;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/lookups")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON) // Wichtig für POST/PUT
@Tag(name = "Lookups", description = "Provides and manages values for dropdowns and selections.")
public class LookupResource {

    // --- DTOs für die öffentliche Anzeige ---
    public static class LookupValueDto {
        public String value;
        public String label;

        public LookupValueDto(String value, String label) {
            this.value = value;
            this.label = (label != null && !label.isEmpty()) ? label : value;
        }
    }

    // --- DTOs für CRUD-Operationen (Admin) ---
    // Ein generisches DTO könnte verwendet werden, aber spezifische sind oft klarer.
    public static class LookupCreateUpdateDto {
        @NotBlank(message = "Value cannot be blank")
        @Size(max = 50, message = "Value can have a maximum of 50 characters")
        public String value;

        @Size(max = 100, message = "Label can have a maximum of 100 characters")
        public String label;
        public String description;
        public Boolean isActive = true;
        public Integer sortOrder = 0;
    }

    // === Öffentliche GET-Endpunkte (PermitAll) ===

    @GET
    @Path("/dosha-types")
    @PermitAll
    @Operation(summary = "Get all active Dosha Types (public)")
    @APIResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = LookupValueDto.class, type = org.eclipse.microprofile.openapi.annotations.enums.SchemaType.ARRAY)))
    public List<LookupValueDto> getPublicDoshaTypes() {
        List<LookupDoshaType> doshaTypesList = LookupDoshaType
            .list("isActive", Sort.by("sortOrder").and("label"), true); // Hier sollte der Typ klar sein

        // Expliziter Stream mit dem korrekten Typ -> IDE inferiert sonst Typ nicht korrekt.
        Stream<LookupDoshaType> doshaTypeStream = doshaTypesList.stream(); 

        return doshaTypeStream
            .map(dt -> new LookupValueDto(dt.value, dt.label)) 
            .collect(Collectors.toList());
    }

    @GET
    @Path("/content-types")
    @PermitAll
    @Operation(summary = "Get all active Content Types (public)")
    @APIResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = LookupValueDto.class, type = org.eclipse.microprofile.openapi.annotations.enums.SchemaType.ARRAY)))
    public List<LookupValueDto> getPublicContentTypes() {
        List<LookupContentType> contentTypeList = LookupContentType
                .list("isActive", Sort.by("sortOrder").and("label"), true);
        Stream<LookupContentType> contentTypeStream = contentTypeList.stream(); // Explizite Typisierung
        return contentTypeStream
                .map(ct -> new LookupValueDto(ct.value, ct.label))
                .collect(Collectors.toList());
    }

    @GET
    @Path("/units")
    @PermitAll
    @Operation(summary = "Get all active Units (public)")
    @APIResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = LookupValueDto.class, type = org.eclipse.microprofile.openapi.annotations.enums.SchemaType.ARRAY)))
    public List<LookupValueDto> getPublicUnits() {
        List<LookupUnit> unitList = LookupUnit
                .list("isActive", Sort.by("sortOrder").and("label"), true);
        Stream<LookupUnit> unitStream = unitList.stream(); // Explizite Typisierung
        return unitStream
                .map(u -> new LookupValueDto(u.value, u.label))
                .collect(Collectors.toList());
    }

    // === Admin-Endpunkte für CRUD ===

    // --- Dosha Types (Admin) ---
    @GET
    @Path("/admin/dosha-types")
    @RolesAllowed("admin")
    @Operation(summary = "Get all Dosha Types (Admin)", description = "Retrieves all Dosha types, including inactive ones.")
    @APIResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = LookupDoshaType.class, type = org.eclipse.microprofile.openapi.annotations.enums.SchemaType.ARRAY)))
    @SecurityRequirement(name = "jwtAuth")
    public List<LookupDoshaType> getAllDoshaTypesAdmin() {
        return LookupDoshaType.listAll(Sort.by("sortOrder").and("value"));
    }

    @GET
    @Path("/admin/dosha-types/{id}")
    @RolesAllowed("admin")
    @Operation(summary = "Get a single Dosha Type by ID (Admin)")
    @APIResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = LookupDoshaType.class)))
    @APIResponse(responseCode = "404", description = "Dosha Type not found")
    @SecurityRequirement(name = "jwtAuth")
    public Response getDoshaTypeByIdAdmin(@PathParam("id") Integer id) {
        return handleGetById(LookupDoshaType::findById, id);
    }

    @POST
    @Path("/admin/dosha-types")
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Create a new Dosha Type (Admin)")
    @APIResponse(responseCode = "201", description = "Dosha Type created", content = @Content(schema = @Schema(implementation = LookupDoshaType.class)))
    @SecurityRequirement(name = "jwtAuth")
    public Response createDoshaType(@Valid LookupCreateUpdateDto dto) {
        if (LookupDoshaType.find("value", dto.value).firstResultOptional().isPresent()) {
            return Response.status(Response.Status.CONFLICT).entity("Dosha Type with value '" + dto.value + "' already exists.").build();
        }
        LookupDoshaType entity = new LookupDoshaType();
        updateEntityFromDto(entity, dto);
        entity.persist();
        return Response.created(URI.create("/api/lookups/admin/dosha-types/" + entity.id)).entity(entity).build();
    }

    @PUT
    @Path("/admin/dosha-types/{id}")
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Update an existing Dosha Type (Admin)")
    @APIResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = LookupDoshaType.class)))
    @APIResponse(responseCode = "404", description = "Dosha Type not found")
    @SecurityRequirement(name = "jwtAuth")
    public Response updateDoshaType(@PathParam("id") Integer id, @Valid LookupCreateUpdateDto dto) {
        Optional<LookupDoshaType> entityOpt = LookupDoshaType.findByIdOptional(id);
        if (entityOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        // Check for value conflict if value is changed
        if (!entityOpt.get().value.equals(dto.value) && LookupDoshaType.find("value", dto.value).firstResultOptional().isPresent()) {
             return Response.status(Response.Status.CONFLICT).entity("Another Dosha Type with value '" + dto.value + "' already exists.").build();
        }
        LookupDoshaType entity = entityOpt.get();
        updateEntityFromDto(entity, dto);
        entity.persist(); // Panache handles update
        return Response.ok(entity).build();
    }

    @DELETE
    @Path("/admin/dosha-types/{id}")
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Delete a Dosha Type (Admin)")
    @APIResponse(responseCode = "204", description = "Dosha Type deleted")
    @APIResponse(responseCode = "404", description = "Dosha Type not found")
    @SecurityRequirement(name = "jwtAuth")
    public Response deleteDoshaType(@PathParam("id") Integer id) {
        return handleDelete(LookupDoshaType::deleteById, id);
    }


    // --- Content Types (Admin) ---
    @GET
    @Path("/admin/content-types")
    @RolesAllowed("admin")
    @Operation(summary = "Get all Content Types (Admin)")
    @SecurityRequirement(name = "jwtAuth")
    public List<LookupContentType> getAllContentTypesAdmin() {
        return LookupContentType.listAll(Sort.by("sortOrder").and("value"));
    }

    @GET
    @Path("/admin/content-types/{id}")
    @RolesAllowed("admin")
    @SecurityRequirement(name = "jwtAuth")
    public Response getContentTypeByIdAdmin(@PathParam("id") Integer id) {
        return handleGetById(LookupContentType::findById, id);
    }

    @POST
    @Path("/admin/content-types")
    @RolesAllowed("admin")
    @Transactional
    @SecurityRequirement(name = "jwtAuth")
    public Response createContentType(@Valid LookupCreateUpdateDto dto) {
         if (LookupContentType.find("value", dto.value).firstResultOptional().isPresent()) {
            return Response.status(Response.Status.CONFLICT).entity("Content Type with value '" + dto.value + "' already exists.").build();
        }
        LookupContentType entity = new LookupContentType();
        updateEntityFromDto(entity, dto);
        entity.persist();
        return Response.created(URI.create("/api/lookups/admin/content-types/" + entity.id)).entity(entity).build();
    }

    @PUT
    @Path("/admin/content-types/{id}")
    @RolesAllowed("admin")
    @Transactional
    @SecurityRequirement(name = "jwtAuth")
    public Response updateContentType(@PathParam("id") Integer id, @Valid LookupCreateUpdateDto dto) {
        Optional<LookupContentType> entityOpt = LookupContentType.findByIdOptional(id);
        if (entityOpt.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        if (!entityOpt.get().value.equals(dto.value) && LookupContentType.find("value", dto.value).firstResultOptional().isPresent()) {
             return Response.status(Response.Status.CONFLICT).entity("Another Content Type with value '" + dto.value + "' already exists.").build();
        }
        LookupContentType entity = entityOpt.get();
        updateEntityFromDto(entity, dto);
        return Response.ok(entity).build();
    }

    @DELETE
    @Path("/admin/content-types/{id}")
    @RolesAllowed("admin")
    @Transactional
    @SecurityRequirement(name = "jwtAuth")
    public Response deleteContentType(@PathParam("id") Integer id) {
        // ACHTUNG: Überlege dir, was passiert, wenn ein Content-Typ gelöscht wird, der in content_items verwendet wird.
        // Der CHECK Constraint in der DB würde neue Einträge verhindern, aber alte bleiben.
        // Besser ist es, `isActive = false` zu setzen, anstatt physisch zu löschen.
        // Für diese Demo implementiere ich den harten Delete.
        return handleDelete(LookupContentType::deleteById, id);
    }

    // --- Units (Admin) ---
    @GET
    @Path("/admin/units")
    @RolesAllowed("admin")
    @Operation(summary = "Get all Units (Admin)")
    @SecurityRequirement(name = "jwtAuth")
    public List<LookupUnit> getAllUnitsAdmin() {
        return LookupUnit.listAll(Sort.by("sortOrder").and("value"));
    }
    
    @GET
    @Path("/admin/units/{id}")
    @RolesAllowed("admin")
    @SecurityRequirement(name = "jwtAuth")
    public Response getUnitByIdAdmin(@PathParam("id") Integer id) {
        return handleGetById(LookupUnit::findById, id);
    }

    @POST
    @Path("/admin/units")
    @RolesAllowed("admin")
    @Transactional
    @SecurityRequirement(name = "jwtAuth")
    public Response createUnit(@Valid LookupCreateUpdateDto dto) {
        if (LookupUnit.find("value", dto.value).firstResultOptional().isPresent()) {
            return Response.status(Response.Status.CONFLICT).entity("Unit with value '" + dto.value + "' already exists.").build();
        }
        LookupUnit entity = new LookupUnit();
        updateEntityFromDto(entity, dto);
        entity.persist();
        return Response.created(URI.create("/api/lookups/admin/units/" + entity.id)).entity(entity).build();
    }

    @PUT
    @Path("/admin/units/{id}")
    @RolesAllowed("admin")
    @Transactional
    @SecurityRequirement(name = "jwtAuth")
    public Response updateUnit(@PathParam("id") Integer id, @Valid LookupCreateUpdateDto dto) {
        Optional<LookupUnit> entityOpt = LookupUnit.findByIdOptional(id);
        if (entityOpt.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
         if (!entityOpt.get().value.equals(dto.value) && LookupUnit.find("value", dto.value).firstResultOptional().isPresent()) {
             return Response.status(Response.Status.CONFLICT).entity("Another Unit with value '" + dto.value + "' already exists.").build();
        }
        LookupUnit entity = entityOpt.get();
        updateEntityFromDto(entity, dto);
        return Response.ok(entity).build();
    }

    @DELETE
    @Path("/admin/units/{id}")
    @RolesAllowed("admin")
    @Transactional
    @SecurityRequirement(name = "jwtAuth")
    public Response deleteUnit(@PathParam("id") Integer id) {
        return handleDelete(LookupUnit::deleteById, id);
    }


    // --- Private Hilfsmethoden für CRUD ---
    private <T extends PanacheEntityBase> void updateEntityFromDto(T entity, LookupCreateUpdateDto dto) {
        if (entity instanceof LookupDoshaType) {
            ((LookupDoshaType) entity).value = dto.value;
            ((LookupDoshaType) entity).label = dto.label;
            ((LookupDoshaType) entity).description = dto.description;
            ((LookupDoshaType) entity).isActive = dto.isActive;
            ((LookupDoshaType) entity).sortOrder = dto.sortOrder;
        } else if (entity instanceof LookupContentType) {
            ((LookupContentType) entity).value = dto.value;
            ((LookupContentType) entity).label = dto.label;
            ((LookupContentType) entity).description = dto.description;
            ((LookupContentType) entity).isActive = dto.isActive;
            ((LookupContentType) entity).sortOrder = dto.sortOrder;
        } else if (entity instanceof LookupUnit) {
            ((LookupUnit) entity).value = dto.value;
            ((LookupUnit) entity).label = dto.label;
            // Units haben aktuell kein Description-Feld in der Entität, ggf. hinzufügen
            ((LookupUnit) entity).isActive = dto.isActive;
            ((LookupUnit) entity).sortOrder = dto.sortOrder;
        }
    }

    private <T extends PanacheEntityBase> Response handleGetById(Function<Integer, T> findByIdFunction, Integer id) {
        T entity = findByIdFunction.apply(id);
        if (entity != null) {
            return Response.ok(entity).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
    
    private Response handleDelete(Function<Integer, Boolean> deleteByIdFunction, Integer id) {
        if (deleteByIdFunction.apply(id)) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
}