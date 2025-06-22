package de.ayurly.app.dataservice.resource;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import de.ayurly.app.dataservice.entity.AppUser;
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
}