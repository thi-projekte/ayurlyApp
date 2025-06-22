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
        public String source;
        public String target;
        public long value;

        public SankeyNodeDto(String source, String target, long value) {
            this.source = source;
            this.target = target;
            this.value = value;
        }
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
    @Path("/sankey-data/microhabits")
    @Transactional
    @Operation(summary = "Get Sankey diagram data for Microhabits", description = "Retrieves aggregated data for Microhabits, structured for a Sankey diagram.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = SankeyNodeDto.class)))
    public Response getSankeyData() {
        List<SankeyNodeDto> sankeyData = new ArrayList<>();
        
        Map<String, Map<String, Long>> doshaToRoutineCounts = new HashMap<>();
        
        // 1. Daten aggregieren
        List<MicrohabitContent> allMicrohabits = MicrohabitContent.listAll();
        for (MicrohabitContent item : allMicrohabits) {
            if (item.doshaTypes == null || item.doshaTypes.length == 0 || item.routineTile == null) {
                continue;
            }
            
            Arrays.sort(item.doshaTypes);
            String doshaKey = String.join(", ", item.doshaTypes);
            String routineTileName = item.routineTile.title;

            doshaToRoutineCounts
                .computeIfAbsent(doshaKey, k -> new HashMap<>())
                .merge(routineTileName, 1L, Long::sum);
        }

        long totalMicrohabits = allMicrohabits.size();
        final String sourceNode = "Microhabits (" + totalMicrohabits + ")";

        doshaToRoutineCounts.forEach((doshaKey, routineMap) -> {
            long totalForDosha = routineMap.values().stream().mapToLong(Long::longValue).sum();

            // Level 1 -> 2: Von "Microhabits" zum Dosha-Typ
            sankeyData.add(new SankeyNodeDto(sourceNode, doshaKey, totalForDosha));
            
            // Level 2 -> 3: Vom Dosha-Typ zur Routine-Kachel
            routineMap.forEach((routineName, count) -> {
                sankeyData.add(new SankeyNodeDto(doshaKey, routineName, count));
            });
        });

        return Response.ok(sankeyData).build();
    }

}