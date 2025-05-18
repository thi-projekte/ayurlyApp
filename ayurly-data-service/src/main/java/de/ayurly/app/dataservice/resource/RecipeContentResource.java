package de.ayurly.app.dataservice.resource;

import java.net.URI;
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
import de.ayurly.app.dataservice.entity.content.recipe.RecipeContent;
import de.ayurly.app.dataservice.entity.content.recipe.RecipeIngredient;
import de.ayurly.app.dataservice.entity.content.recipe.RecipePreparationStep; 
import io.quarkus.panache.common.Parameters;
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

    @Inject 
    JsonWebToken jwt;

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

    public static class RecipeContentDto {
        public UUID id;
        public String title;
        public String imageUrl;
        public String previewDescription;
        public String description;
        public String[] doshaTypes;
        public String benefits;
        public Integer preparationTimeMinutes;
        public Integer numberOfPortions;
        public List<IngredientDto> ingredients;
        public List<PreparationStepDto> preparationSteps;
        public String contentType;
        public int likeCount; // NEU
        public Boolean likedByCurrentUser; // NEU: Wird nur gesetzt, wenn ein User eingeloggt ist

        public static RecipeContentDto fromEntity(RecipeContent entity, boolean includeDetails, String currentUserId) { // currentUserId NEU
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
            dto.benefits = entity.benefits;
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
        public String benefits;
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
            recipe.benefits = this.benefits;
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
        // Wir wollen nur ContentItems vom Typ 'RECIPE'
        // Mit JOINED-Strategie können wir direkt RecipeContent abfragen.
        List<RecipeContent> recipes;
        String currentUserId = getCurrentUserIdOptional();

        if (doshaType != null && !doshaType.trim().isEmpty()) {
            // Da doshaTypes in recipe_details ist, müssen wir die RecipeContent Entitäten filtern
            // Dies erfordert eine Query, die auf die Spalte in recipe_details zugreift.
            // Beispiel: "SELECT rc FROM RecipeContent rc WHERE :dosha = ANY(rc.doshaTypes)"
            String query = "SELECT rc FROM RecipeContent rc WHERE :doshaType = ANY(rc.doshaTypes) ORDER BY rc.title";
            recipes = RecipeContent.find(query, Parameters.with("doshaType", doshaType)).list();
        } else {
            recipes = RecipeContent.listAll(Sort.by("title"));
        }

        return recipes.stream()
                      .map(recipe -> RecipeContentDto.fromEntity(recipe, false, currentUserId)) // false: keine Details für Listenansicht
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
            // Alternativ: Alle Rezepte zurückgeben oder einen Fehler/Hinweis.
            // Hier geben wir eine leere Liste zurück oder man könnte einen 404 werfen.
             return Response.ok(Collections.emptyList()).build();
            // return Response.status(Response.Status.NOT_FOUND).entity("User dosha type not set. Please complete your profile or Dosha test.").build();
        }

        String userDosha = appUser.getDoshaType();
        LOG.infof("Fetching personalized recipes for user %s with Dosha type %s", userId, userDosha);

        // Query, um Rezepte zu finden, die entweder den spezifischen Dosha-Typ des Users enthalten
        // ODER als 'Tridoshic' markiert sind (was für alle Doshas passt).
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
            .map(recipe -> Response.ok(RecipeContentDto.fromEntity(recipe, true, currentUserId)).build())
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
        // Beim Erstellen hat der aktuelle Admin-User es nicht automatisch geliked
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
        // Update ContentItem fields
        existingRecipe.title = recipeDto.title;
        existingRecipe.imageUrl = recipeDto.imageUrl;
        existingRecipe.previewDescription = recipeDto.previewDescription;
         // Update RecipeDetails fields
        existingRecipe.description = recipeDto.description;
        existingRecipe.doshaTypes = recipeDto.doshaTypes;
        existingRecipe.benefits = recipeDto.benefits;
        existingRecipe.preparationTimeMinutes = recipeDto.preparationTimeMinutes;
        existingRecipe.numberOfPortions = recipeDto.numberOfPortions;

        // Update ingredients
        existingRecipe.ingredients.clear();
        RecipeContent.flush();
        if (recipeDto.ingredients != null) {
            recipeDto.ingredients.forEach(ingDto -> existingRecipe.addIngredient(ingDto.toEntity()));
        }

        // Update preparation steps
        existingRecipe.preparationSteps.clear();
        RecipeContent.flush();
        if (recipeDto.preparationSteps != null) {
            recipeDto.preparationSteps.forEach(stepDto -> existingRecipe.addPreparationStep(stepDto.toEntity()));
        }
        
        // Panache managed die Persistierung der Änderungen am Ende der Transaktion
        // existingRecipe.persist(); // ist nicht nötig, da die Entität "managed" ist

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
        // Löscht das ContentItem und dank CascadeType.ALL und ON DELETE CASCADE in der DB
        // auch die zugehörigen recipe_details, recipe_ingredients und recipe_preparation_steps.
        boolean deleted = ContentItem.deleteById(id); // Löschen über die Basisklasse
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    // --- LIKE Endpunkte ---

    @POST
    @Path("/{id}/like")
    @Authenticated // Jeder authentifizierte User kann liken
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

    @POST // Oder DELETE, je nach Präferenz für "unlike"
    @Path("/{id}/unlike")
    @Authenticated // Jeder authentifizierte User kann entliken
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