package de.ayurly.app.dataservice.resource;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.ContentLike;
import de.ayurly.app.dataservice.entity.content.yoga.YogaExerciseContent;
import de.ayurly.app.dataservice.entity.content.yoga.YogaExerciseEffect;
import de.ayurly.app.dataservice.entity.content.yoga.YogaExerciseStep;
import de.ayurly.app.dataservice.entity.content.yoga.YogaExerciseSubStep;
import de.ayurly.app.dataservice.entity.content.yoga.YogaExerciseTip;
import io.quarkus.panache.common.Sort;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
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

@Path("/api/yoga-exercises")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Yoga Exercises (Content Model)", description = "Operations related to yoga exercises")
public class YogaExerciseContentResource {

    @Inject
    JsonWebToken jwt;
    @Inject
    EntityManager entityManager;

    // --- DTOs ---

    public static class SubStepDto {
        public int subStepNumber;
        public String description;
        // fromEntity
        public static SubStepDto fromEntity(YogaExerciseSubStep entity) {
            SubStepDto dto = new SubStepDto();
            dto.subStepNumber = entity.subStepNumber;
            dto.description = entity.description;
            return dto;
        }
        // toEntity
        public YogaExerciseSubStep toEntity() {
            YogaExerciseSubStep entity = new YogaExerciseSubStep();
            entity.subStepNumber = this.subStepNumber;
            entity.description = this.description;
            return entity;
        }
    }

    public static class StepDto {
        public int stepNumber;
        public String title;
        public String description;
        public List<SubStepDto> subSteps;
        // fromEntity
        public static StepDto fromEntity(YogaExerciseStep entity) {
            StepDto dto = new StepDto();
            dto.stepNumber = entity.stepNumber;
            dto.title = entity.title;
            dto.description = entity.description;
            dto.subSteps = entity.subSteps.stream().map(SubStepDto::fromEntity).collect(Collectors.toList());
            return dto;
        }
        // toEntity
        public YogaExerciseStep toEntity() {
            YogaExerciseStep entity = new YogaExerciseStep();
            entity.stepNumber = this.stepNumber;
            entity.title = this.title;
            entity.description = this.description;
            if (this.subSteps != null) {
                this.subSteps.forEach(subDto -> entity.addSubStep(subDto.toEntity()));
            }
            return entity;
        }
    }

    public static class YogaExerciseContentDto {
        public UUID id;
        public String title;
        public String imageUrl;
        public String previewDescription;
        public String videoUrl;
        public String description;
        public String[] doshaTypes;
        public List<String> effects;
        public List<String> tips;
        public List<StepDto> steps;
        public int likeCount;
        public Boolean likedByCurrentUser;

        public static YogaExerciseContentDto fromEntity(YogaExerciseContent entity, String currentUserId) {
            YogaExerciseContentDto dto = new YogaExerciseContentDto();
            dto.id = entity.id;
            dto.title = entity.title;
            dto.imageUrl = entity.imageUrl;
            dto.previewDescription = entity.previewDescription;
            dto.videoUrl = entity.videoUrl;
            dto.description = entity.description;
            dto.doshaTypes = entity.doshaTypes;
            dto.effects = entity.effects.stream().map(e -> e.effectText).collect(Collectors.toList());
            dto.tips = entity.tips.stream().map(t -> t.tipText).collect(Collectors.toList());
            dto.steps = entity.steps.stream().map(StepDto::fromEntity).collect(Collectors.toList());
            dto.likeCount = entity.likeCount;
            if (currentUserId != null) {
                dto.likedByCurrentUser = ContentLike.count("contentItem.id = ?1 AND userId = ?2", entity.id, currentUserId) > 0;
            } else {
                dto.likedByCurrentUser = null;
            }
            return dto;
        }
    }

    public static class YogaExerciseCreateUpdateDto {
        public String title;
        public String imageUrl;
        public String previewDescription;
        public String videoUrl;
        public String description;
        public String[] doshaTypes;
        public List<String> effects;
        public List<String> tips;
        public List<StepDto> steps;
    }

    // --- Helper ---
    private String getCurrentUserIdOptional() {
        return (jwt != null && jwt.getSubject() != null) ? jwt.getSubject() : null;
    }
    
    // --- Endpoints ---
    
    @GET
    @PermitAll
    public List<YogaExerciseContentDto> getAll() {
        String userId = getCurrentUserIdOptional();
        return YogaExerciseContent.<YogaExerciseContent>listAll(Sort.by("title")).stream()
            .map(entity -> YogaExerciseContentDto.fromEntity(entity, userId))
            .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    @PermitAll
    public Response getById(@PathParam("id") UUID id) {
        String userId = getCurrentUserIdOptional();
        return YogaExerciseContent.<YogaExerciseContent>findByIdOptional(id)
            .map(entity -> Response.ok(YogaExerciseContentDto.fromEntity(entity, userId)).build())
            .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @RolesAllowed("admin")
    @Transactional
    public Response create(@Valid YogaExerciseCreateUpdateDto dto) {
        YogaExerciseContent entity = new YogaExerciseContent();
        entity.title = dto.title;
        entity.imageUrl = dto.imageUrl;
        entity.previewDescription = dto.previewDescription;
        entity.videoUrl = dto.videoUrl;
        entity.description = dto.description;
        entity.doshaTypes = dto.doshaTypes;
        
        if (dto.effects != null) {
            for (int i=0; i<dto.effects.size(); i++) {
                YogaExerciseEffect effect = new YogaExerciseEffect();
                effect.effectText = dto.effects.get(i);
                effect.sortOrder = i;
                entity.addEffect(effect);
            }
        }
        if (dto.tips != null) {
            for (int i=0; i<dto.tips.size(); i++) {
                YogaExerciseTip tip = new YogaExerciseTip();
                tip.tipText = dto.tips.get(i);
                tip.sortOrder = i;
                entity.addTip(tip);
            }
        }
        if (dto.steps != null) {
            dto.steps.forEach(stepDto -> entity.addStep(stepDto.toEntity()));
        }

        entity.persist();
        return Response.created(URI.create("/api/yoga-exercises/" + entity.id)).entity(YogaExerciseContentDto.fromEntity(entity, getCurrentUserIdOptional())).build();
    }
    
    @PUT
    @Path("/{id}")
    @RolesAllowed("admin")
    @Transactional
    public Response update(@PathParam("id") UUID id, @Valid YogaExerciseCreateUpdateDto dto) {
        Optional<YogaExerciseContent> optionalEntity = YogaExerciseContent.findByIdOptional(id);
        if (optionalEntity.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        YogaExerciseContent entity = optionalEntity.get();

        entity.title = dto.title;
        entity.imageUrl = dto.imageUrl;
        entity.previewDescription = dto.previewDescription;
        entity.videoUrl = dto.videoUrl;
        entity.description = dto.description;
        entity.doshaTypes = dto.doshaTypes;

        for(YogaExerciseEffect e : new ArrayList<>(entity.effects)) { entity.removeEffect(e); }
        entityManager.flush();
        if(dto.effects != null) { for(int i=0; i<dto.effects.size(); i++) { YogaExerciseEffect e = new YogaExerciseEffect(); e.effectText = dto.effects.get(i); e.sortOrder = i; entity.addEffect(e); } }

        for(YogaExerciseTip t : new ArrayList<>(entity.tips)) { entity.removeTip(t); }
        entityManager.flush();
        if(dto.tips != null) { for(int i=0; i<dto.tips.size(); i++) { YogaExerciseTip t = new YogaExerciseTip(); t.tipText = dto.tips.get(i); t.sortOrder = i; entity.addTip(t); } }

        for(YogaExerciseStep s : new ArrayList<>(entity.steps)) { entity.removeStep(s); }
        entityManager.flush();
        if(dto.steps != null) { dto.steps.forEach(stepDto -> entity.addStep(stepDto.toEntity())); }
        
        return Response.ok(YogaExerciseContentDto.fromEntity(entity, getCurrentUserIdOptional())).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("admin")
    @Transactional
    public Response delete(@PathParam("id") UUID id) {
        return ContentItem.deleteById(id) ? Response.noContent().build() : Response.status(Response.Status.NOT_FOUND).build();
    }

    @POST
    @Path("/{id}/like")
    @Authenticated
    @Transactional
    public Response like(@PathParam("id") UUID id) {
        String userId = jwt.getSubject();
        Optional<ContentItem> itemOpt = ContentItem.findByIdOptional(id);
        if(itemOpt.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        
        ContentItem item = itemOpt.get();
        if (ContentLike.find("contentItem.id = ?1 and userId = ?2", id, userId).firstResultOptional().isEmpty()) {
            ContentLike like = new ContentLike(item, userId);
            like.persist();
            item.likeCount++;
        }
        return Response.ok(new RecipeContentResource.LikeResponseDto(id, item.likeCount, true)).build();
    }

    @POST
    @Path("/{id}/unlike")
    @Authenticated
    @Transactional
    public Response unlike(@PathParam("id") UUID id) {
        String userId = jwt.getSubject();
        Optional<ContentItem> itemOpt = ContentItem.findByIdOptional(id);
        if(itemOpt.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();

        ContentItem item = itemOpt.get();
        if(ContentLike.delete("contentItem.id = ?1 and userId = ?2", id, userId) > 0) {
            item.likeCount = Math.max(0, item.likeCount - 1);
        }
        return Response.ok(new RecipeContentResource.LikeResponseDto(id, item.likeCount, false)).build();
    }
}