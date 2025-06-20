package de.ayurly.app.dataservice.resource;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.eclipse.microprofile.jwt.JsonWebToken;

import de.ayurly.app.dataservice.entity.AppUser;
import de.ayurly.app.dataservice.entity.user.MyAyurlyContent;
import de.ayurly.app.dataservice.service.MyAyurlyService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/myayurly")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class MyAyurlyResource {

    @Inject
    JsonWebToken jwt;
    @Inject
    MyAyurlyService myAyurlyService;

    // DTOs für die Frontend-Kommunikation
    public static class DashboardItemDto {
        public UUID id;
        public String title;
        public String contentType;
        public boolean isDone;

        public static DashboardItemDto fromEntity(MyAyurlyContent entity) {
            DashboardItemDto dto = new DashboardItemDto();
            dto.id = entity.id;
            dto.title = entity.contentItem.title;
            dto.contentType = entity.contentItem.contentType;
            dto.isDone = entity.isDone;
            return dto;
        }
    }
    public static class RoutineTileDto {
        public String title;
        public List<DashboardItemDto> items;
    }

    @GET
    @Path("/{date}")
    public Response getDashboardForDate(@PathParam("date") String dateString) {
        String userId = jwt.getSubject();
        AppUser user = AppUser.findById(userId);

        if (user.doshaType == null || user.doshaType.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "DOSHA_TEST_REQUIRED", "message", "User has no Dosha type set."))
                    .build();
        }

        LocalDate date;
        try {
            date = LocalDate.parse(dateString);
        } catch (DateTimeParseException e) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid date format. Use YYYY-MM-DD.").build();
        }
        
        if (date.isBefore(LocalDate.now())) {
             // Generieren für die Vergangenheit ist nicht erlaubt, aber Abrufen schon
        }

        List<MyAyurlyContent> content = MyAyurlyContent.list("user = ?1 and calendarDate = ?2", user, date);

        if (content.isEmpty()) {
            if (date.isBefore(LocalDate.now())) {
                return Response.status(Response.Status.BAD_REQUEST).entity("Cannot generate content for past dates.").build();
            }
            content = myAyurlyService.generateContentForDay(user, date);
        }

        Map<String, List<DashboardItemDto>> groupedByTile = content.stream()
                .collect(Collectors.groupingBy(c -> c.routineTile.title,
                        Collectors.mapping(DashboardItemDto::fromEntity, Collectors.toList())));
        
        return Response.ok(groupedByTile).build();
    }
    
    @POST
    @Path("/toggle-done/{id}")
    public Response toggleDone(@PathParam("id") Long myAyurlyContentId) {
        String userId = jwt.getSubject();
        AppUser user = AppUser.findById(userId);
        
        try {
            MyAyurlyContent updatedContent = myAyurlyService.toggleDoneStatus(user, myAyurlyContentId);
            return Response.ok(DashboardItemDto.fromEntity(updatedContent)).build();
        } catch (WebApplicationException e) {
            return e.getResponse();
        }
    }
}