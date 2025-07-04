package de.ayurly.app.dataservice.resource;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
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

import de.ayurly.app.dataservice.entity.AppUser;
import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.ContentLike;
import de.ayurly.app.dataservice.entity.content.recipe.RecipeBenefit; 
import de.ayurly.app.dataservice.entity.content.recipe.RecipeContent;
import de.ayurly.app.dataservice.entity.content.recipe.RecipeIngredient;
import de.ayurly.app.dataservice.entity.content.recipe.RecipePreparationStep;
import de.ayurly.app.dataservice.service.FileService;
import io.quarkus.panache.common.Parameters;
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
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/recipes")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Recipes (Content Model)", description = "Operations related to recipes using the generalized content model")
public class RecipeContentResource {

    private static final Logger LOG = Logger.getLogger(RecipeContentResource.class); 
    
    private static final String TRIDOSHIC_DB_VALUE = "Tridoshic"; 

    @Inject
    JsonWebToken jwt;

    @Inject
    EntityManager entityManager;

    @Inject
    FileService fileService;

    // --- DTOs (Data Transfer Object)---
    public static class IngredientDto {
        public String name;
        public String quantity;
        public String unit;
        public String notes;

        public static IngredientDto fromEntity(RecipeIngredient entity) {
            if (entity == null) return null;
            IngredientDto dto = new IngredientDto();
            dto.name = entity.name;
            dto.quantity = entity.quantity;
            dto.unit = entity.unit;
            dto.notes = entity.notes;
            return dto;
        }

        public RecipeIngredient toEntity() {
            RecipeIngredient entity = new RecipeIngredient();
            entity.name = this.name;
            entity.quantity = this.quantity;
            entity.unit = this.unit;
            entity.notes = this.notes;
            return entity;
        }
    }

    public static class PreparationStepDto {
        public int stepNumber;
        public String description;

        public static PreparationStepDto fromEntity(RecipePreparationStep entity) {
            if (entity == null) return null;
            PreparationStepDto dto = new PreparationStepDto();
            dto.stepNumber = entity.stepNumber;
            dto.description = entity.description;
            return dto;
        }

        public RecipePreparationStep toEntity() {
            RecipePreparationStep entity = new RecipePreparationStep();
            entity.stepNumber = this.stepNumber;
            entity.description = this.description;
            return entity;
        }
    }

    public static class BenefitDto {
        public String benefitText;
        public int sortOrder;

        public static BenefitDto fromEntity(RecipeBenefit entity) {
            if (entity == null) return null;
            BenefitDto dto = new BenefitDto();
            dto.benefitText = entity.benefitText;
            dto.sortOrder = entity.sortOrder;
            return dto;
        }

        public RecipeBenefit toEntity() {
            RecipeBenefit entity = new RecipeBenefit();
            entity.benefitText = this.benefitText;
            entity.sortOrder = this.sortOrder;
            return entity;
        }
    }

    public static class RecipeContentDto {
        public UUID id;
        public String title;
        public String imageUrl;
        public String previewDescription;
        public String description;
        public String[] doshaTypes;
        public List<String> benefits; 
        public Integer preparationTimeMinutes;
        public Integer numberOfPortions;
        public List<IngredientDto> ingredients;
        public List<PreparationStepDto> preparationSteps;
        public String contentType;
        public int likeCount; 
        public Boolean likedByCurrentUser; // Wird nur gesetzt, wenn ein User eingeloggt ist

        public static RecipeContentDto fromEntity(RecipeContent entity, boolean includeDetails, String currentUserId) { 
            if (entity == null) return null;
            RecipeContentDto dto = new RecipeContentDto();
            dto.id = entity.id; // von ContentItem
            dto.title = entity.title; // von ContentItem
            dto.imageUrl = entity.imageUrl; // von ContentItem
            dto.previewDescription = entity.previewDescription; // von ContentItem
            dto.contentType = entity.contentType; // von ContentItem
            dto.likeCount = entity.likeCount; // von ContentItem

            // Spezifische Rezeptdaten
            dto.description = entity.description;
            dto.doshaTypes = entity.doshaTypes;
            if (entity.benefits != null) { 
                dto.benefits = entity.benefits.stream()
                                      .map(benefit -> benefit.benefitText)
                                      .collect(Collectors.toList());
            } else {
                dto.benefits = Collections.emptyList();
            }
            dto.preparationTimeMinutes = entity.preparationTimeMinutes;
            dto.numberOfPortions = entity.numberOfPortions;

            if (includeDetails) {
                if (entity.ingredients != null) {
                    dto.ingredients = entity.ingredients.stream().map(IngredientDto::fromEntity).collect(Collectors.toList());
                }
                if (entity.preparationSteps != null) {
                    dto.preparationSteps = entity.preparationSteps.stream().map(PreparationStepDto::fromEntity).collect(Collectors.toList());
                }
            }

            // Prüfen, ob der aktuelle User geliked hat
            if (currentUserId != null) {
                dto.likedByCurrentUser = ContentLike.count("contentItem.id = ?1 AND userId = ?2", entity.id, currentUserId) > 0;
            } else {
                dto.likedByCurrentUser = null; // null wenn nicht eingeloggt
            }

            return dto;
        }
    }

    public static class RecipeContentCreateUpdateDto {
        // Felder von ContentItem
        public String title;
        public String imageUrl;
        public String previewDescription;

        // Felder von RecipeDetails
        public String description;
        public String[] doshaTypes;
        public List<String> benefits; 
        public Integer preparationTimeMinutes;
        public Integer numberOfPortions;
        public List<IngredientDto> ingredients;
        public List<PreparationStepDto> preparationSteps;

        public RecipeContent toEntity() {
            RecipeContent recipe = new RecipeContent();
            // ContentItem Felder
            recipe.title = this.title;
            recipe.imageUrl = this.imageUrl;
            recipe.previewDescription = this.previewDescription;
            // recipe.contentType wird durch @DiscriminatorValue gesetzt

            // RecipeDetails Felder
            recipe.description = this.description;
            recipe.doshaTypes = this.doshaTypes;
            recipe.preparationTimeMinutes = this.preparationTimeMinutes;
            recipe.numberOfPortions = this.numberOfPortions;

            if (this.ingredients != null) {
                this.ingredients.forEach(ingDto -> {
                    RecipeIngredient ingEntity = ingDto.toEntity();
                    recipe.addIngredient(ingEntity);
                });
            }
            if (this.preparationSteps != null) {
                this.preparationSteps.forEach(stepDto -> {
                    RecipePreparationStep stepEntity = stepDto.toEntity();
                    recipe.addPreparationStep(stepEntity);
                });
            }
            if (this.benefits != null) { // NEU
                for (int i = 0; i < this.benefits.size(); i++) {
                    String benefitText = this.benefits.get(i);
                    if (benefitText != null && !benefitText.trim().isEmpty()) {
                        recipe.addBenefit(new RecipeBenefit(benefitText.trim(), i * 10)); // sortOrder basiert auf Index
                    }
                }
            }
            return recipe;
        }
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


    private String getCurrentUserIdOptional() {
        if (jwt != null && jwt.getSubject() != null) {
            return jwt.getSubject();
        }
        return null;
    }

    // --- Endpunkte ---

    @GET 
    @PermitAll
    @Operation(summary = "Get all recipes", description = "Retrieves a list of all recipes (as RecipeContent). Optional filter by providing doshaType.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = RecipeContentDto.class, type = org.eclipse.microprofile.openapi.annotations.enums.SchemaType.ARRAY)))
    public List<RecipeContentDto> getAllRecipes(@QueryParam("doshaType") String doshaType) {
        List<RecipeContent> recipes;
        String currentUserId = getCurrentUserIdOptional();

        if (doshaType != null && !doshaType.trim().isEmpty()) {
            // Query, um Rezepte zu finden, die entweder den spezifischen Dosha-Typ des Users enthalten
            // ODER als 'Tridoshic' (oder dein DB-Äquivalent) markiert sind.
            String query = "SELECT rc FROM RecipeContent rc WHERE (:doshaParam = ANY(rc.doshaTypes) OR :tridoshicValue = ANY(rc.doshaTypes)) ORDER BY rc.title";
            recipes = RecipeContent.find(query, 
                Parameters.with("doshaParam", doshaType).and("tridoshicValue", TRIDOSHIC_DB_VALUE)
            ).list();
        } else {
            // Wenn kein doshaType angegeben ist, alle Rezepte laden
            recipes = RecipeContent.listAll(Sort.by("title"));
        }

        return recipes.stream()
                      .map(recipe -> RecipeContentDto.fromEntity(recipe, false, currentUserId))
                      .collect(Collectors.toList());
    }

    @GET 
    @Path("/personalized")
    @Authenticated // Nur für eingeloggte User
    @Operation(summary = "Get personalized recipes for current user", description = "Retrieves recipes matching the current user's dosha type. Also includes Tridoshic recipes.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = RecipeContentDto.class, type = org.eclipse.microprofile.openapi.annotations.enums.SchemaType.ARRAY)))
    @APIResponse(responseCode = "401", description = "User not authenticated")
    @APIResponse(responseCode = "404", description = "User profile or Dosha type not found")
    @SecurityRequirement(name = "jwtAuth")
    public Response getPersonalizedRecipes() {
        String userId = jwt.getSubject();
        if (userId == null) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("User not authenticated.").build();
        }

        AppUser appUser = AppUser.findById(userId);
        if (appUser == null || appUser.getDoshaType() == null || appUser.getDoshaType().trim().isEmpty()) {
            LOG.warnf("User %s has no Dosha type set. Returning empty list for personalized recipes.", userId);
             return Response.ok(Collections.emptyList()).build();
        }

        String userDosha = appUser.getDoshaType();
        LOG.infof("Fetching personalized recipes for user %s with Dosha type %s", userId, userDosha);

        // Query, um Rezepte zu finden, die entweder den spezifischen Dosha-Typ des Users enthalten
        // ODER als 'Tridoshic' markiert sind 
        // Das `dosha_types` Feld ist ein Array.
        String query = "SELECT rc FROM RecipeContent rc WHERE (:userDosha = ANY(rc.doshaTypes) OR 'Tridoshic' = ANY(rc.doshaTypes)) ORDER BY rc.title";
        List<RecipeContent> recipes = RecipeContent.find(query, Parameters.with("userDosha", userDosha)).list();

        String currentUserIdForLikeCheck = getCurrentUserIdOptional();
        List<RecipeContentDto> recipeDtos = recipes.stream()
                                           .map(recipe -> RecipeContentDto.fromEntity(recipe, false, currentUserIdForLikeCheck))
                                           .collect(Collectors.toList());
        return Response.ok(recipeDtos).build();
    }

    @GET 
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "Get a recipe by ID", description = "Retrieves a single recipe (as RecipeContent) by its UUID.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = RecipeContentDto.class)))
    @APIResponse(responseCode = "404", description = "Recipe not found or not a recipe type")
    public Response getRecipeById(@PathParam("id") UUID id) {
        // Finde ein ContentItem und prüfe, ob es ein RecipeContent ist
        Optional<RecipeContent> recipeOpt = RecipeContent.findByIdOptional(id);
        String currentUserId = getCurrentUserIdOptional();

        return recipeOpt
            .map(recipe -> Response.ok(RecipeContentDto.fromEntity(recipe, true, currentUserId)).build()) // includeDetails auf true setzen
            .orElseGet(() -> Response.status(Response.Status.NOT_FOUND).entity("Recipe not found or content item is not a recipe.").build());
    }

    @POST 
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Create a new recipe", description = "Creates a new recipe (as RecipeContent). Requires 'admin' role.")
    @APIResponse(responseCode = "201", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = RecipeContentDto.class)))
    @SecurityRequirement(name = "jwtAuth")
    public Response createRecipe(@Valid RecipeContentCreateUpdateDto recipeDto) {
        RecipeContent recipe = recipeDto.toEntity();
        // recipe.contentType wird automatisch durch @DiscriminatorValue("RECIPE") gesetzt
        recipe.persist();
        RecipeContentDto responseDto = RecipeContentDto.fromEntity(recipe, true, getCurrentUserIdOptional());
        return Response.created(URI.create("/api/recipes/" + recipe.id)).entity(responseDto).build();
    }

    @PUT 
    @Path("/{id}")
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Update an existing recipe", description = "Updates an existing recipe (as RecipeContent). Requires 'admin' role.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = RecipeContentDto.class)))
    @APIResponse(responseCode = "404", description = "Recipe not found")
    @SecurityRequirement(name = "jwtAuth")
    public Response updateRecipe(@PathParam("id") UUID id, @Valid RecipeContentCreateUpdateDto recipeDto) {
        Optional<RecipeContent> existingRecipeOpt = RecipeContent.findByIdOptional(id);
        if (existingRecipeOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).entity("Recipe not found or content item is not a recipe.").build();
        }

        RecipeContent existingRecipe = existingRecipeOpt.get();
        String oldImageUrl = existingRecipe.imageUrl;
        // Update ContentItem fields
        existingRecipe.title = recipeDto.title;
        existingRecipe.imageUrl = recipeDto.imageUrl;
        existingRecipe.previewDescription = recipeDto.previewDescription;
         // Update RecipeDetails fields
        existingRecipe.description = recipeDto.description;
        existingRecipe.doshaTypes = recipeDto.doshaTypes;
        existingRecipe.preparationTimeMinutes = recipeDto.preparationTimeMinutes;
        existingRecipe.numberOfPortions = recipeDto.numberOfPortions;

        // Zutaten aktualisieren
        // Alte Zutaten entfernen
        for (RecipeIngredient ingredient : new ArrayList<>(existingRecipe.ingredients)) {
            existingRecipe.removeIngredient(ingredient); // Stellt sicher, dass die Beziehung aufgehoben wird
        }
        entityManager.flush(); 

        // Neue Zutaten hinzufügen
        if (recipeDto.ingredients != null) {
            for (IngredientDto ingDto : recipeDto.ingredients) {
                RecipeIngredient newIngredient = ingDto.toEntity();
                existingRecipe.addIngredient(newIngredient);
            }
        }

        // Zubereitungsschritte aktualisieren
        // Alte Schritte entfernen
        for (RecipePreparationStep step : new ArrayList<>(existingRecipe.preparationSteps)) {
            existingRecipe.removePreparationStep(step);
        }
        entityManager.flush(); 

        // Neue Schritte hinzufügen
        if (recipeDto.preparationSteps != null) {
            for (PreparationStepDto stepDto : recipeDto.preparationSteps) {
                RecipePreparationStep newStep = stepDto.toEntity();
                existingRecipe.addPreparationStep(newStep);
            }
        }

        // Benefits aktualisieren
        // Alte Benefits entfernen
        for (RecipeBenefit benefit : new ArrayList<>(existingRecipe.benefits)) {
            existingRecipe.removeBenefit(benefit);
        }
        entityManager.flush(); 

        // Neue Benefits hinzufügen
        if (recipeDto.benefits != null) {
            for (int i = 0; i < recipeDto.benefits.size(); i++) {
                String benefitText = recipeDto.benefits.get(i);
                if (benefitText != null && !benefitText.trim().isEmpty()) {
                     existingRecipe.addBenefit(new RecipeBenefit(benefitText.trim(), i * 10));
                }
            }
        }
        
        // Panache managed die Persistierung der Änderungen am Ende der Transaktion
        // Ein explizites persist() auf existingRecipe ist nicht nötig, da es eine managed entity ist.

        // Altes Bild löschen, wenn es geändert wurde
        if (oldImageUrl != null && !oldImageUrl.equals(existingRecipe.imageUrl)) {
            fileService.deleteFile(oldImageUrl);
        }

        RecipeContentDto responseDto = RecipeContentDto.fromEntity(existingRecipe, true, getCurrentUserIdOptional());
        return Response.ok(responseDto).build();
    }

    @DELETE 
    @Path("/{id}")
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Delete a recipe", description = "Deletes a recipe (ContentItem and RecipeDetails). Requires 'admin' role.")
    @APIResponse(responseCode = "204", description = "Recipe deleted")
    @APIResponse(responseCode = "404", description = "Recipe not found")
    @SecurityRequirement(name = "jwtAuth")
    public Response deleteRecipe(@PathParam("id") UUID id) {
        Optional<RecipeContent> recipeOpt = RecipeContent.findByIdOptional(id);
        if (recipeOpt.isPresent()) {
            RecipeContent recipe = recipeOpt.get();
            String imageUrl = recipe.imageUrl; // Pfad merken
            
            recipe.delete(); // DB-Eintrag löschen
            
            fileService.deleteFile(imageUrl); // Datei löschen
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    // --- LIKE Endpunkte ---

    @POST 
    @Path("/{id}/like")
    @Authenticated 
    @Transactional
    @Operation(summary = "Like a recipe", description = "Allows an authenticated user to like a recipe. Idempotent.")
    @APIResponse(responseCode = "200", description = "Recipe liked successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = LikeResponseDto.class)))
    @APIResponse(responseCode = "404", description = "Recipe not found")
    @APIResponse(responseCode = "401", description = "User not authenticated")
    @SecurityRequirement(name = "jwtAuth")
    public Response likeRecipe(@PathParam("id") UUID contentId) {
        String userId = jwt.getSubject();
        if (userId == null) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("User ID not found in token.").build();
        }

        Optional<ContentItem> contentItemOpt = ContentItem.findByIdOptional(contentId);
        if (contentItemOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).entity("Content item not found.").build();
        }
        ContentItem item = contentItemOpt.get();

        // Prüfen, ob der User diesen Content bereits geliked hat
        Optional<ContentLike> existingLike = ContentLike.find("contentItem.id = ?1 AND userId = ?2", contentId, userId).firstResultOptional();

        if (existingLike.isEmpty()) {
            ContentLike newLike = new ContentLike(item, userId);
            newLike.persist();
            // likeCount erhöhen
            item.likeCount = item.likeCount + 1;
            item.persist(); // Sicherstellen, dass der Zähler aktualisiert wird
            LOG.infof("User %s liked content item %s. New like count: %d", userId, contentId, item.likeCount);
        } else {
            LOG.infof("User %s already liked content item %s. No action taken.", userId, contentId);
        }

        LikeResponseDto response = new LikeResponseDto(contentId, item.likeCount, true);
        return Response.ok(response).build();
    }

    @POST 
    @Path("/{id}/unlike")
    @Authenticated 
    @Transactional
    @Operation(summary = "Unlike a recipe", description = "Allows an authenticated user to remove their like from a recipe.")
    @APIResponse(responseCode = "200", description = "Recipe unliked successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = LikeResponseDto.class)))
    @APIResponse(responseCode = "404", description = "Recipe not found or not liked by user")
    @APIResponse(responseCode = "401", description = "User not authenticated")
    @SecurityRequirement(name = "jwtAuth")
    public Response unlikeRecipe(@PathParam("id") UUID contentId) {
        String userId = jwt.getSubject();
         if (userId == null) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("User ID not found in token.").build();
        }

        Optional<ContentItem> contentItemOpt = ContentItem.findByIdOptional(contentId);
        if (contentItemOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).entity("Content item not found.").build();
        }
        ContentItem item = contentItemOpt.get();

        long deletedCount = ContentLike.delete("contentItem.id = ?1 AND userId = ?2", contentId, userId);

        if (deletedCount > 0) {
            // likeCount verringern, aber nicht unter 0
            item.likeCount = Math.max(0, item.likeCount - 1);
            item.persist();
            LOG.infof("User %s unliked content item %s. New like count: %d", userId, contentId, item.likeCount);
        } else {
             LOG.infof("User %s had not liked content item %s, or like already removed. No action taken.", userId, contentId);
        }

        LikeResponseDto response = new LikeResponseDto(contentId, item.likeCount, false);
        return Response.ok(response).build();
    }
}