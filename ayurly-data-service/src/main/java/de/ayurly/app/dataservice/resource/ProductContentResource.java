package de.ayurly.app.dataservice.resource;

import java.math.BigDecimal;
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

import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.ContentLike;
import de.ayurly.app.dataservice.entity.content.product.ProductActiveIngredient;
import de.ayurly.app.dataservice.entity.content.product.ProductApplicationStep;
import de.ayurly.app.dataservice.entity.content.product.ProductBenefit;
import de.ayurly.app.dataservice.entity.content.product.ProductContent;
import de.ayurly.app.dataservice.resource.RecipeContentResource.LikeResponseDto;
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

@Path("/api/products")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Products (Content Model)", description = "Operations related to products")
public class ProductContentResource {

    private static final Logger LOG = Logger.getLogger(ProductContentResource.class);
    private static final String TRIDOSHIC_DB_VALUE = "Tridoshic";

    @Inject
    JsonWebToken jwt;

    @Inject
    EntityManager entityManager;

    // --- DTOs (Data Transfer Objects) ---
    public static class ActiveIngredientDto {
        public String ingredientText;

        public static ActiveIngredientDto fromEntity(ProductActiveIngredient entity) {
            if (entity == null) return null;
            ActiveIngredientDto dto = new ActiveIngredientDto();
            dto.ingredientText = entity.ingredientText;
            return dto;
        }

        public ProductActiveIngredient toEntity(int sortOrder) {
            return new ProductActiveIngredient(this.ingredientText, sortOrder);
        }
    }

    public static class ApplicationStepDto {
        public int stepNumber;
        public String description;

        public static ApplicationStepDto fromEntity(ProductApplicationStep entity) {
            if (entity == null) return null;
            ApplicationStepDto dto = new ApplicationStepDto();
            dto.stepNumber = entity.stepNumber;
            dto.description = entity.description;
            return dto;
        }

        public ProductApplicationStep toEntity() {
            ProductApplicationStep entity = new ProductApplicationStep();
            entity.stepNumber = this.stepNumber;
            entity.description = this.description;
            return entity;
        }
    }

    public static class BenefitDto {
        public String benefitText;

        public static BenefitDto fromEntity(ProductBenefit entity) {
             if (entity == null) return null;
             BenefitDto dto = new BenefitDto();
             dto.benefitText = entity.benefitText;
             return dto;
        }

        public ProductBenefit toEntity(int sortOrder) {
            return new ProductBenefit(this.benefitText, sortOrder);
        }
    }

    public static class ProductContentDto {
        public UUID id;
        public String title;
        public String imageUrl;
        public String previewDescription;
        public String description;
        public String[] doshaTypes;
        public BigDecimal price;
        public BigDecimal weight;
        public String unit;
        public String externalLink;
        public List<String> benefits;
        public List<String> activeIngredients;
        public List<ApplicationStepDto> applicationSteps;
        public String contentType;
        public int likeCount;
        public Boolean likedByCurrentUser;

        public static ProductContentDto fromEntity(ProductContent entity, boolean includeDetails, String currentUserId) {
            if (entity == null) return null;
            ProductContentDto dto = new ProductContentDto();
            dto.id = entity.id;
            dto.title = entity.title;
            dto.imageUrl = entity.imageUrl;
            dto.previewDescription = entity.previewDescription;
            dto.contentType = entity.contentType;
            dto.likeCount = entity.likeCount;

            dto.description = entity.description;
            dto.doshaTypes = entity.doshaTypes;
            dto.price = entity.price;
            dto.weight = entity.weight;
            dto.unit = entity.unit;
            dto.externalLink = entity.externalLink;

            if (entity.benefits != null) {
                dto.benefits = entity.benefits.stream().map(b -> b.benefitText).collect(Collectors.toList());
            } else {
                dto.benefits = Collections.emptyList();
            }

            if (includeDetails) {
                 if (entity.activeIngredients != null) {
                    dto.activeIngredients = entity.activeIngredients.stream().map(i -> i.ingredientText).collect(Collectors.toList());
                }
                 if (entity.applicationSteps != null) {
                    dto.applicationSteps = entity.applicationSteps.stream().map(ApplicationStepDto::fromEntity).collect(Collectors.toList());
                }
            }

            if (currentUserId != null) {
                dto.likedByCurrentUser = ContentLike.count("contentItem.id = ?1 AND userId = ?2", entity.id, currentUserId) > 0;
            } else {
                dto.likedByCurrentUser = null;
            }

            return dto;
        }
    }
    
    public static class ProductContentCreateUpdateDto {
        public String title;
        public String imageUrl;
        public String previewDescription;
        public String description;
        public String[] doshaTypes;
        public BigDecimal price;
        public BigDecimal weight;
        public String unit;
        public String externalLink;
        public List<String> benefits;
        public List<String> activeIngredients;
        public List<ApplicationStepDto> applicationSteps;

        public ProductContent toEntity() {
            ProductContent product = new ProductContent();
            product.title = this.title;
            product.imageUrl = this.imageUrl;
            product.previewDescription = this.previewDescription;

            product.description = this.description;
            product.doshaTypes = this.doshaTypes;
            product.price = this.price;
            product.weight = this.weight;
            product.unit = this.unit;
            product.externalLink = this.externalLink;

            if (this.benefits != null) {
                for (int i = 0; i < this.benefits.size(); i++) {
                    product.addBenefit(new ProductBenefit(this.benefits.get(i), i * 10));
                }
            }
            if (this.activeIngredients != null) {
                for (int i = 0; i < this.activeIngredients.size(); i++) {
                    product.addActiveIngredient(new ProductActiveIngredient(this.activeIngredients.get(i), i * 10));
                }
            }
            if (this.applicationSteps != null) {
                this.applicationSteps.forEach(stepDto -> product.addApplicationStep(stepDto.toEntity()));
            }

            return product;
        }
    }

    private String getCurrentUserIdOptional() {
        if (jwt != null && jwt.getSubject() != null) {
            return jwt.getSubject();
        }
        return null;
    }

    @GET
    @PermitAll
    public List<ProductContentDto> getAllProducts(@QueryParam("doshaType") String doshaType) {
        List<ProductContent> products;
        String currentUserId = getCurrentUserIdOptional();

        if (doshaType != null && !doshaType.trim().isEmpty()) {
            String query = "SELECT p FROM ProductContent p WHERE :doshaParam = ANY(p.doshaTypes) OR :tridoshicValue = ANY(p.doshaTypes) ORDER BY p.title";
            products = ProductContent.find(query, Parameters.with("doshaParam", doshaType).and("tridoshicValue", TRIDOSHIC_DB_VALUE)).list();
        } else {
            products = ProductContent.listAll(Sort.by("title"));
        }

        return products.stream()
                .map(product -> ProductContentDto.fromEntity(product, false, currentUserId))
                .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    @PermitAll
    public Response getProductById(@PathParam("id") UUID id) {
        Optional<ProductContent> productOpt = ProductContent.findByIdOptional(id);
        String currentUserId = getCurrentUserIdOptional();

        return productOpt
                .map(product -> Response.ok(ProductContentDto.fromEntity(product, true, currentUserId)).build())
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Create a new product", description = "Creates a new product (as ProductContent). Requires 'admin' role.")
    @APIResponse(responseCode = "201", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ProductContentDto.class)))
    @SecurityRequirement(name = "jwtAuth")
    public Response createProduct(@Valid ProductContentCreateUpdateDto productDto) {
        ProductContent product = productDto.toEntity();
        product.persist();
        ProductContentDto responseDto = ProductContentDto.fromEntity(product, true, getCurrentUserIdOptional());
        return Response.created(URI.create("/api/products/" + product.id)).entity(responseDto).build();
    }
    
    @PUT
    @Path("/{id}")
    @RolesAllowed("admin")
    @Transactional
    @Operation(summary = "Update an existing product", description = "Updates an existing product (as ProductContent). Requires 'admin' role.")
    @APIResponse(responseCode = "200", description = "Product updated successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ProductContentDto.class)))
    @APIResponse(responseCode = "404", description = "Product not found")
    @APIResponse(responseCode = "400", description = "Invalid product data provided")
    @SecurityRequirement(name = "jwtAuth")
    public Response updateProduct(@PathParam("id") UUID id, @Valid ProductContentCreateUpdateDto productDto) {
        Optional<ProductContent> existingProductOpt = ProductContent.findByIdOptional(id);
        if (existingProductOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).entity("Product not found.").build();
        }

        ProductContent existingProduct = existingProductOpt.get();
        
        // 1. Update primitive fields
        existingProduct.title = productDto.title;
        existingProduct.imageUrl = productDto.imageUrl;
        existingProduct.previewDescription = productDto.previewDescription;
        existingProduct.description = productDto.description;
        existingProduct.doshaTypes = productDto.doshaTypes;
        existingProduct.price = productDto.price;
        existingProduct.weight = productDto.weight;
        existingProduct.unit = productDto.unit;
        existingProduct.externalLink = productDto.externalLink;

        // 2. Update Benefits
        for (ProductBenefit benefit : new ArrayList<>(existingProduct.benefits)) {
            existingProduct.removeBenefit(benefit);
        }
        entityManager.flush();
        if(productDto.benefits != null) {
             for (int i = 0; i < productDto.benefits.size(); i++) {
                String benefitText = productDto.benefits.get(i);
                if (benefitText != null && !benefitText.trim().isEmpty()) {
                    existingProduct.addBenefit(new ProductBenefit(benefitText.trim(), i * 10));
                }
            }
        }
        
        // 3. Update Active Ingredients
        for (ProductActiveIngredient ingredient : new ArrayList<>(existingProduct.activeIngredients)) {
            existingProduct.removeActiveIngredient(ingredient);
        }
        entityManager.flush();
        if(productDto.activeIngredients != null) {
             for (int i = 0; i < productDto.activeIngredients.size(); i++) {
                String ingredientText = productDto.activeIngredients.get(i);
                 if (ingredientText != null && !ingredientText.trim().isEmpty()) {
                    existingProduct.addActiveIngredient(new ProductActiveIngredient(ingredientText.trim(), i * 10));
                }
            }
        }
        
        // 4. Update Application Steps
        for (ProductApplicationStep step : new ArrayList<>(existingProduct.applicationSteps)) {
            existingProduct.removeApplicationStep(step);
        }
        entityManager.flush();
        if(productDto.applicationSteps != null) {
            productDto.applicationSteps.stream()
                 .map(ApplicationStepDto::toEntity)
                 .forEach(existingProduct::addApplicationStep);
        }

        entityManager.flush();

        ProductContentDto responseDto = ProductContentDto.fromEntity(existingProduct, true, getCurrentUserIdOptional());
        return Response.ok(responseDto).build();
    }


    @DELETE
    @Path("/{id}")
    @RolesAllowed("admin")
    @Transactional
    public Response deleteProduct(@PathParam("id") UUID id) {
        boolean deleted = ContentItem.deleteById(id);
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @POST
    @Path("/{id}/like")
    @Authenticated
    @Transactional
    public Response likeProduct(@PathParam("id") UUID contentId) {
        String userId = jwt.getSubject();
        Optional<ContentItem> itemOpt = ContentItem.findByIdOptional(contentId);
        if(itemOpt.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        
        ContentItem item = itemOpt.get();
        if (ContentLike.find("contentItem.id = ?1 and userId = ?2", contentId, userId).firstResultOptional().isEmpty()) {
            ContentLike like = new ContentLike(item, userId);
            like.persist();
            item.likeCount++;
        }
        return Response.ok(new LikeResponseDto(contentId, item.likeCount, true)).build();
    }

    @POST
    @Path("/{id}/unlike")
    @Authenticated
    @Transactional
    public Response unlikeProduct(@PathParam("id") UUID contentId) {
        String userId = jwt.getSubject();
        Optional<ContentItem> itemOpt = ContentItem.findByIdOptional(contentId);
        if(itemOpt.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();

        ContentItem item = itemOpt.get();
        long deletedCount = ContentLike.delete("contentItem.id = ?1 and userId = ?2", contentId, userId);
        if(deletedCount > 0) {
            item.likeCount = Math.max(0, item.likeCount - 1);
        }
        return Response.ok(new LikeResponseDto(contentId, item.likeCount, false)).build();
    }
}