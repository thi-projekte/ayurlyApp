package de.ayurly.app.dataservice.resource;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import de.ayurly.app.dataservice.entity.AppUser;
import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.MicrohabitContent;
import de.ayurly.app.dataservice.entity.content.product.ProductContent;
import de.ayurly.app.dataservice.entity.content.recipe.RecipeContent;
import de.ayurly.app.dataservice.entity.content.yoga.YogaExerciseContent;
import de.ayurly.app.dataservice.entity.user.MyAyurlyContent;
import io.quarkus.panache.common.Parameters;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api/admin/dashboard")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Dashboard", description = "Operations for the admin dashboard")
@RolesAllowed("admin") 
@SecurityRequirement(name = "jwtAuth")
public class DashboardAdminResource {

     public static class DashboardMetricsDto {
        public long totalUsers;
        public long activeUsersLast30Days;
        public long totalRecipes;
        public long totalMicrohabits;
        public long totalProducts;
        public long totalYogaExercises;
    }

    public static class SankeyNodeDto {
        public String sourceType; 
        public String source;
        public String targetType;
        public String target;
        public long value;
    }

    @GET
    @Path("/metrics")
    @Transactional 
    @Operation(summary = "Get admin dashboard metrics", description = "Retrieves key metrics for the admin dashboard display.")
    @APIResponse(
        responseCode = "200", 
        description = "Metrics successfully retrieved", 
        content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = DashboardMetricsDto.class))
    )
    @APIResponse(responseCode = "401", description = "User not authenticated")
    @APIResponse(responseCode = "403", description = "User not authorized (requires admin role)")
    public Response getDashboardMetrics() {
        DashboardMetricsDto dto = new DashboardMetricsDto();

        dto.totalUsers = AppUser.count();
        
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        dto.activeUsersLast30Days = MyAyurlyContent.count(
            "SELECT DISTINCT user.id FROM MyAyurlyContent WHERE calendarDate >= :date",
            Parameters.with("date", thirtyDaysAgo)
        );

        dto.totalRecipes = RecipeContent.count();
        dto.totalMicrohabits = MicrohabitContent.count();
        dto.totalProducts = ProductContent.count();
        dto.totalYogaExercises = YogaExerciseContent.count();
        
        return Response.ok(dto).build();
    }

    @GET
    @Path("/sankey-data")
    @Transactional
    @Operation(summary = "Get Sankey diagram data", description = "Retrieves aggregated data structured for a Sankey diagram.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = SankeyNodeDto.class, type = org.eclipse.microprofile.openapi.annotations.enums.SchemaType.ARRAY)))
    public Response getSankeyData() {
        
        List<SankeyNodeDto> sankeyData = new ArrayList<>();
        
        // 1. Zähle alle Content-Typen
        long totalRecipes = RecipeContent.count();
        long totalMicrohabits = MicrohabitContent.count();
        long totalProducts = ProductContent.count();
        long totalYoga = YogaExerciseContent.count();
        long totalContent = totalRecipes + totalMicrohabits + totalProducts + totalYoga;

        // Level 1 -> 2
        sankeyData.add(createNode("root", "Inhalte Gesamt", "ContentType", "Rezepte", totalRecipes));
        sankeyData.add(createNode("root", "Inhalte Gesamt", "ContentType", "Microhabits", totalMicrohabits));
        sankeyData.add(createNode("root", "Inhalte Gesamt", "ContentType", "Produkte", totalProducts));
        sankeyData.add(createNode("root", "Inhalte Gesamt", "ContentType", "Yoga", totalYoga));

        // Aggregiere Dosha-Typen für jeden Content-Typ
        addDoshaNodes("Rezepte", RecipeContent.listAll(), sankeyData);
        addDoshaNodes("Produkte", ProductContent.listAll(), sankeyData);
        addDoshaNodes("Yoga", YogaExerciseContent.listAll(), sankeyData);
        
        // 3. Spezielle Behandlung für Microhabits (Dosha -> RoutineTile)
        addMicrohabitNodes(MicrohabitContent.listAll(), sankeyData);

        return Response.ok(sankeyData).build();
    }

    private SankeyNodeDto createNode(String sourceType, String source, String targetType, String target, long value) {
        SankeyNodeDto node = new SankeyNodeDto();
        node.sourceType = sourceType;
        node.source = source;
        node.targetType = targetType;
        node.target = target;
        node.value = value;
        return node;
    }
    
    private void addDoshaNodes(String contentTypeName, List<? extends ContentItem> items, List<SankeyNodeDto> sankeyData) {
        Map<String, Long> doshaCounts = new HashMap<>();
        for (ContentItem item : items) {
            String[] doshaTypes = getDoshaTypes(item); 
            if (doshaTypes != null && doshaTypes.length > 0) {
                Arrays.sort(doshaTypes); 
                String doshaKey = String.join(", ", doshaTypes);
                doshaCounts.put(doshaKey, doshaCounts.getOrDefault(doshaKey, 0L) + 1);
            }
        }
        doshaCounts.forEach((doshaKey, count) -> 
            sankeyData.add(createNode("ContentType", contentTypeName, "DoshaType", doshaKey, count))
        );
    }
    
    private void addMicrohabitNodes(List<MicrohabitContent> items, List<SankeyNodeDto> sankeyData) {
        Map<String, Map<String, Long>> doshaToRoutineCounts = new HashMap<>();
        for (MicrohabitContent item : items) {
            if (item.doshaTypes != null && item.doshaTypes.length > 0 && item.routineTile != null) {
                Arrays.sort(item.doshaTypes);
                String doshaKey = String.join(", ", item.doshaTypes);
                String routineTileName = item.routineTile.title;

                doshaToRoutineCounts
                    .computeIfAbsent(doshaKey, k -> new HashMap<>())
                    .put(routineTileName, doshaToRoutineCounts.get(doshaKey).getOrDefault(routineTileName, 0L) + 1);
            }
        }
        
        doshaToRoutineCounts.forEach((doshaKey, routineMap) -> {
            long totalForDosha = routineMap.values().stream().mapToLong(Long::longValue).sum();
            sankeyData.add(createNode("ContentType", "Microhabits", "DoshaType", doshaKey, totalForDosha));
            
            routineMap.forEach((routineName, count) -> 
                sankeyData.add(createNode("DoshaType", doshaKey, "RoutineTile", routineName, count))
            );
        });
    }

     private String[] getDoshaTypes(ContentItem item) {
        try {
            Field field = item.getClass().getField("doshaTypes");
            return (String[]) field.get(item);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            return null; 
        }
    }
}