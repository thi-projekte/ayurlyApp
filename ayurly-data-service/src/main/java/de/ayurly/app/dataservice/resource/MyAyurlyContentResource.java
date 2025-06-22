package de.ayurly.app.dataservice.resource;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.eclipse.microprofile.jwt.JsonWebToken;

import de.ayurly.app.dataservice.entity.AppUser;
import de.ayurly.app.dataservice.entity.content.recipe.RecipeContent;
import de.ayurly.app.dataservice.entity.user.MyAyurlyContent;
import de.ayurly.app.dataservice.resource.MyAyurlyResource.DashboardItemDto;
import de.ayurly.app.dataservice.service.MyAyurlyHistoryService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/myayurly/content")
@RolesAllowed("user")
public class MyAyurlyContentResource {

    
    // --- DTOs als innere Klassen ---
    public static class ContentItemDTO {
        public UUID myAyurlyContentId;
        public UUID contentItemId;
        public String title;
        public String previewDescription;
        public String imageUrl;
        public boolean isDone;
        public String contentType;
        public Integer preparationTimeMinutes;
    }

    public static class DashboardContentDTO {
        public List<ContentItemDTO> morningFlow = new ArrayList<>();
        public List<ContentItemDTO> eveningFlow = new ArrayList<>();
        public List<ContentItemDTO> restCycle = new ArrayList<>();
        public List<ContentItemDTO> zenMove = new ArrayList<>();
        public List<ContentItemDTO> nourishCycle = new ArrayList<>();
    }

    @Inject
    JsonWebToken jwt;

    @Inject
    MyAyurlyHistoryService historyService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDashboardContentForDate(@QueryParam("date") String dateStr) {
        String userId = jwt.getSubject();
        AppUser user = AppUser.findById(userId);
        LocalDate eventDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);

        List<MyAyurlyContent> content = MyAyurlyContent.list("user = ?1 and calendarDate = ?2", user, eventDate);

        if (content.isEmpty()) {
            return Response.ok(Map.of("status", "NO_CONTENT_FOUND")).build();
        }

        Map<String, List<DashboardItemDto>> groupedByTile = content.stream()
                .collect(Collectors.groupingBy(c -> c.routineTile.title,
                        Collectors.mapping(DashboardItemDto::fromEntity, Collectors.toList())));
        
        return Response.ok(groupedByTile).build();
    }

    @POST
    @Path("/{id}/toggle-done")
    @Transactional
    public Response toggleDoneStatus(@PathParam("id") UUID id) {
        String userId = jwt.getSubject();
        AppUser user = AppUser.findById(userId);
        
        MyAyurlyContent contentItem = MyAyurlyContent.findById(id);

        if (contentItem == null || !contentItem.user.id.equals(user.id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        if (contentItem.calendarDate.isAfter(LocalDate.now())) {
            return Response.status(Response.Status.BAD_REQUEST)
                           .entity("Content from the future cannot be marked as done.")
                           .build();
        }

        contentItem.isDone = !contentItem.isDone;
        contentItem.persist();

        // Der Aufruf bleibt konzeptionell gleich:
        historyService.updateHistoryForDay(user, contentItem.calendarDate);

        return Response.ok().build();
    }
    
    private List<ContentItemDTO> filterAndMap(List<MyAyurlyContent> allItems, String tileKey) {
        return allItems.stream()
            .filter(item -> item.routineTile.tileKey.equals(tileKey))
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    private ContentItemDTO mapToDto(MyAyurlyContent item) {
        ContentItemDTO dto = new ContentItemDTO();
        dto.myAyurlyContentId = item.id;
        dto.contentItemId = item.contentItem.id;
        dto.title = item.contentItem.title;
        dto.previewDescription = item.contentItem.previewDescription;
        dto.imageUrl = item.contentItem.imageUrl;
        dto.isDone = item.isDone;
        dto.contentType = item.contentItem.contentType;
        
        if (item.contentItem instanceof RecipeContent) {
            dto.preparationTimeMinutes = ((RecipeContent) item.contentItem).preparationTimeMinutes;
        }
        return dto;
    }
}