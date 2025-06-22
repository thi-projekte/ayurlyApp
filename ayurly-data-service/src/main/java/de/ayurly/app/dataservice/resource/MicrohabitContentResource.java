package de.ayurly.app.dataservice.resource;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.ContentLike;
import de.ayurly.app.dataservice.entity.content.MicrohabitContent;
import de.ayurly.app.dataservice.entity.lookup.LookupRoutineTile;
import io.quarkus.panache.common.Sort;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
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

@Path("/api/microhabits")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Microhabits (Content Model)", description = "Operations related to microhabits")
public class MicrohabitContentResource {

    private static final Logger LOG = Logger.getLogger(MicrohabitContentResource.class);

    @Inject
    JsonWebToken jwt;

    private String getCurrentUserIdOptional() {
        if (jwt != null && jwt.getSubject() != null) {
            return jwt.getSubject();
        }
        return null;
    }

    // --- DTOs ---

    public static class RoutineTileDto {
        public int id;
        public String name;

        public static RoutineTileDto fromEntity(LookupRoutineTile entity) {
            if (entity == null) return null;
            RoutineTileDto dto = new RoutineTileDto();
            dto.id = entity.id;
            dto.name = entity.tileKey;
            return dto;
        }
    }

    public static class MicrohabitDto {
        public UUID id;
        public String title;
        public String previewDescription;
        public String[] doshaTypes;
        public RoutineTileDto routineTile;
        public String contentType;
        public int likeCount;
        public Boolean likedByCurrentUser;

        public static MicrohabitDto fromEntity(MicrohabitContent entity, String currentUserId) {
            if (entity == null) return null;
            MicrohabitDto dto = new MicrohabitDto();
            dto.id = entity.id;
            dto.title = entity.title;
            dto.previewDescription = entity.previewDescription;
            dto.contentType = entity.contentType;
            dto.doshaTypes = entity.doshaTypes;
            dto.routineTile = RoutineTileDto.fromEntity(entity.routineTile);
            dto.likeCount = entity.likeCount;

            if (currentUserId != null) {
                dto.likedByCurrentUser = ContentLike.count("contentItem.id = ?1 AND userId = ?2", entity.id, currentUserId) > 0;
            } else {
                dto.likedByCurrentUser = null;
            }
            return dto;
        }
    }


    public static class MicrohabitCreateUpdateDto {
        public String title;
        public String previewDescription;
        public String[] doshaTypes;
        public UUID routineTileId; 
    }

    public static class LikeResponseDto { 
        public UUID contentId;
        public int likeCount;
        public boolean likedByCurrentUser;

        public LikeResponseDto(UUID contentId, int likeCount, boolean likedByCurrentUser) {
            this.contentId = contentId;
            this.likeCount = likeCount;
            this.likedByCurrentUser = likedByCurrentUser;
        }
    }

    // --- Endpunkte ---

    @GET
    @PermitAll
    @Operation(summary = "Get all microhabits", description = "Retrieves a list of all microhabits.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MicrohabitDto.class, type = org.eclipse.microprofile.openapi.annotations.enums.SchemaType.ARRAY)))
    public List<MicrohabitDto> getAllMicrohabits() {
        String currentUserId = getCurrentUserIdOptional();
        return MicrohabitContent.<MicrohabitContent>listAll(Sort.by("title"))
                .stream()
                .map(habit -> MicrohabitDto.fromEntity(habit, currentUserId))
                .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "Get a microhabit by ID", description = "Retrieves a single microhabit by its UUID.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MicrohabitDto.class)))
    @APIResponse(responseCode = "404", description = "Microhabit not found")
    public Response getMicrohabitById(@PathParam("id") UUID id) {
        String currentUserId = getCurrentUserIdOptional();
        return MicrohabitContent.<MicrohabitContent>findByIdOptional(id)
                .map(habit -> Response.ok(MicrohabitDto.fromEntity(habit, currentUserId)).build())
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Create a new microhabit", description = "Creates a new microhabit. Requires 'admin' role.")
    @APIResponse(responseCode = "201", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MicrohabitDto.class)))
    @SecurityRequirement(name = "jwtAuth")
    public Response createMicrohabit(@Valid MicrohabitCreateUpdateDto habitDto) {
        Optional<LookupRoutineTile> routineTileOpt = LookupRoutineTile.findByIdOptional(habitDto.routineTileId);
        if (routineTileOpt.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("RoutineTile with id " + habitDto.routineTileId + " not found.").build();
        }

        MicrohabitContent habit = new MicrohabitContent();
        habit.title = habitDto.title;
        habit.previewDescription = habitDto.previewDescription;
        habit.doshaTypes = habitDto.doshaTypes;
        habit.routineTile = routineTileOpt.get();

        habit.persist();
        
        LOG.infof("Admin user %s created new microhabit with id %s", jwt.getSubject(), habit.id);

        return Response.created(URI.create("/api/microhabits/" + habit.id)).entity(MicrohabitDto.fromEntity(habit, jwt.getSubject())).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Update an existing microhabit", description = "Updates an existing microhabit. Requires 'admin' role.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MicrohabitDto.class)))
    @APIResponse(responseCode = "404", description = "Microhabit not found")
    @SecurityRequirement(name = "jwtAuth")
    public Response updateMicrohabit(@PathParam("id") UUID id, @Valid MicrohabitCreateUpdateDto habitDto) {
        Optional<MicrohabitContent> existingHabitOpt = MicrohabitContent.findByIdOptional(id);
        if (existingHabitOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Optional<LookupRoutineTile> routineTileOpt = LookupRoutineTile.findByIdOptional(habitDto.routineTileId);
        if (routineTileOpt.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("RoutineTile with id " + habitDto.routineTileId + " not found.").build();
        }

        MicrohabitContent habit = existingHabitOpt.get();
        habit.title = habitDto.title;
        habit.previewDescription = habitDto.previewDescription;
        habit.doshaTypes = habitDto.doshaTypes;
        habit.routineTile = routineTileOpt.get();

        habit.persist(); // Panache managed die Aktualisierung

        LOG.infof("Admin user %s updated microhabit with id %s", jwt.getSubject(), habit.id);

        return Response.ok(MicrohabitDto.fromEntity(habit, jwt.getSubject())).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Delete a microhabit", description = "Deletes a microhabit. Requires 'admin' role.")
    @APIResponse(responseCode = "204", description = "Microhabit deleted")
    @APIResponse(responseCode = "404", description = "Microhabit not found")
    @SecurityRequirement(name = "jwtAuth")
    public Response deleteMicrohabit(@PathParam("id") UUID id) {
        boolean deleted = MicrohabitContent.deleteById(id);
        if (deleted) {
            LOG.infof("Admin user %s deleted microhabit with id %s", jwt.getSubject(), id);
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @POST 
    @Path("/{id}/like")
    @Authenticated 
    @Transactional
    @Operation(summary = "Like a microhabit", description = "Allows an authenticated user to like a microhabit.")
    @APIResponse(responseCode = "200", description = "Microhabit liked successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = LikeResponseDto.class)))
    @SecurityRequirement(name = "jwtAuth")
    public Response likeMicrohabit(@PathParam("id") UUID contentId) {
        String userId = jwt.getSubject();
        Optional<ContentItem> contentItemOpt = ContentItem.findByIdOptional(contentId);
        if (contentItemOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).entity("Content item not found.").build();
        }
        ContentItem item = contentItemOpt.get();

        if (ContentLike.find("contentItem.id = ?1 AND userId = ?2", contentId, userId).firstResultOptional().isEmpty()) {
            ContentLike newLike = new ContentLike(item, userId);
            newLike.persist();
            item.likeCount = Math.max(0, item.likeCount) + 1;
            item.persist();
        }

        return Response.ok(new LikeResponseDto(contentId, item.likeCount, true)).build();
    }

    @POST 
    @Path("/{id}/unlike")
    @Authenticated 
    @Transactional
    @Operation(summary = "Unlike a microhabit", description = "Allows an authenticated user to remove their like from a microhabit.")
    @APIResponse(responseCode = "200", description = "Microhabit unliked successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = LikeResponseDto.class)))
    @SecurityRequirement(name = "jwtAuth")
    public Response unlikeMicrohabit(@PathParam("id") UUID contentId) {
        String userId = jwt.getSubject();
        Optional<ContentItem> contentItemOpt = ContentItem.findByIdOptional(contentId);
        if (contentItemOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).entity("Content item not found.").build();
        }
        ContentItem item = contentItemOpt.get();

        long deletedCount = ContentLike.delete("contentItem.id = ?1 AND userId = ?2", contentId, userId);
        if (deletedCount > 0) {
            item.likeCount = Math.max(0, item.likeCount - 1);
            item.persist();
        }

        return Response.ok(new LikeResponseDto(contentId, item.likeCount, false)).build();
    }
}