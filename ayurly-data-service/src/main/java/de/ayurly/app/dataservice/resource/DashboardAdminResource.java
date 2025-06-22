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
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@Path("/api/admin/dashboard")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Dashboard", description = "Operations for the admin dashboard")
@RolesAllowed("admin")
@SecurityRequirement(name = "jwtAuth")
public class DashboardAdminResource {

    @Inject
    EntityManager entityManager;

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

    public static class TopContentDto {
        public String title;
        public String contentType;
        public long count;

        public TopContentDto(String title, String contentType, Long count) {
            this.title = title;
            this.contentType = contentType;
            this.count = count != null ? count : 0L;
        }
    }

    public static class TileUsageDto {
        public String tileName;
        public long doneCount;

        public TileUsageDto(String tileName, Long doneCount) {
            this.tileName = tileName;
            this.doneCount = doneCount != null ? doneCount : 0L;
        }
    }

    @GET
    @Path("/metrics")
    @Transactional
    @Operation(summary = "Get admin dashboard metrics", description = "Retrieves key metrics for the admin dashboard display.")
    @APIResponse(responseCode = "200", description = "Metrics successfully retrieved", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = DashboardMetricsDto.class)))
    public Response getDashboardMetrics() {
        DashboardMetricsDto dto = new DashboardMetricsDto();

        dto.totalUsers = AppUser.count();

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        dto.activeUsersLast30Days = MyAyurlyContent.count("SELECT DISTINCT user.id FROM MyAyurlyContent WHERE calendarDate >= :date", Parameters.with("date", thirtyDaysAgo));

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

        List<MicrohabitContent> allMicrohabits = MicrohabitContent.listAll();
        for (MicrohabitContent item : allMicrohabits) {
            if (item.doshaTypes == null || item.doshaTypes.length == 0 || item.routineTile == null) {
                continue;
            }

            Arrays.sort(item.doshaTypes);
            String doshaKey = String.join(", ", item.doshaTypes);
            String routineTileName = item.routineTile.title;

            doshaToRoutineCounts.computeIfAbsent(doshaKey, k -> new HashMap<>()).merge(routineTileName, 1L, Long::sum);
        }

        long totalMicrohabits = allMicrohabits.size();
        final String sourceNode = "Microhabits (" + totalMicrohabits + ")";

        doshaToRoutineCounts.forEach((doshaKey, routineMap) -> {
            long totalForDosha = routineMap.values().stream().mapToLong(Long::longValue).sum();

            sankeyData.add(new SankeyNodeDto(sourceNode, doshaKey, totalForDosha));

            routineMap.forEach((routineName, count) -> {
                sankeyData.add(new SankeyNodeDto(doshaKey, routineName, count));
            });
        });

        return Response.ok(sankeyData).build();
    }

    @GET
    @Path("/performance/top-liked")
    @Transactional
    @Operation(summary = "Get Top 5 liked content items", description = "Retrieves a ranked list of the most liked content, optionally filtered by content type and the user's dosha type.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = TopContentDto.class)))
    public Response getTopLikedContent(@QueryParam("contentType") String contentType, @QueryParam("userDoshaType") String userDoshaType) {

        String query;
        Parameters params = new Parameters();

        if (userDoshaType != null && !userDoshaType.isEmpty() && !userDoshaType.equals("all")) {
            query = "SELECT ci.title, ci.contentType, COUNT(cl.id) as likeCount FROM ContentLike cl JOIN cl.contentItem ci JOIN AppUser u ON cl.userId = u.id WHERE u.doshaType = :userDoshaType";
            params.and("userDoshaType", userDoshaType);
            if (contentType != null && !contentType.isEmpty() && !contentType.equals("all")) {
                query += " AND ci.contentType = :contentType";
                params.and("contentType", contentType);
            }
            query += " GROUP BY ci.id, ci.title, ci.contentType ORDER BY likeCount DESC";
        } else {
            query = "SELECT c.title, c.contentType, c.likeCount FROM ContentItem c";
            if (contentType != null && !contentType.isEmpty() && !contentType.equals("all")) {
                query += " WHERE c.contentType = :contentType";
                params.and("contentType", contentType);
            }
            query += " ORDER BY c.likeCount DESC";
        }

        TypedQuery<Object[]> typedQuery = entityManager.createQuery(query, Object[].class);
        for (Map.Entry<String, Object> entry : params.map().entrySet()) {
            typedQuery.setParameter(entry.getKey(), entry.getValue());
        }
        List<Object[]> results = typedQuery.setMaxResults(5).getResultList();

        List<TopContentDto> dtoList = results.stream()
            .map(row -> new TopContentDto((String) row[0], (String) row[1], ((Number) row[2]).longValue()))
            .collect(Collectors.toList());

        return Response.ok(dtoList).build();
    }

    @GET
    @Path("/performance/top-done")
    @Transactional
    @Operation(summary = "Get Top 5 'done' content items", description = "Retrieves a ranked list of the most completed content, optionally filtered.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = TopContentDto.class)))
    public Response getTopDoneContent(@QueryParam("contentType") String contentType, @QueryParam("userDoshaType") String userDoshaType) {

        String query = "SELECT m.contentItem.title, m.contentItem.contentType, COUNT(m.id) as doneCount FROM MyAyurlyContent m WHERE m.isDone = true";
        Parameters params = new Parameters();

        if (contentType != null && !contentType.isEmpty() && !contentType.equals("all")) {
            query += " AND m.contentItem.contentType = :contentType";
            params.and("contentType", contentType);
        }
        if (userDoshaType != null && !userDoshaType.isEmpty() && !userDoshaType.equals("all")) {
            query += " AND m.user.doshaType = :userDoshaType";
            params.and("userDoshaType", userDoshaType);
        }
        query += " GROUP BY m.contentItem.id, m.contentItem.title, m.contentItem.contentType ORDER BY doneCount DESC";

        List<TopContentDto> results = MyAyurlyContent.find(query, params).page(0, 5).project(TopContentDto.class).list();
        return Response.ok(results).build();
    }

    @GET
    @Path("/performance/tile-usage")
    @Transactional
    @Operation(summary = "Get usage counts for routine tiles", description = "Retrieves the count of 'done' items for each routine tile.")
    @APIResponse(responseCode = "200", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = TileUsageDto.class)))
    public Response getTileUsage() {
        List<TileUsageDto> results = MyAyurlyContent.find("SELECT m.routineTile.title, COUNT(m.id) FROM MyAyurlyContent m WHERE m.isDone = true GROUP BY m.routineTile.title ORDER BY COUNT(m.id) DESC").project(TileUsageDto.class).list();
        return Response.ok(results).build();
    }
}