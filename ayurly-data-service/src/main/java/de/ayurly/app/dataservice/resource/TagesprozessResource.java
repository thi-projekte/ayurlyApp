package de.ayurly.app.dataservice.resource;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import de.ayurly.app.dataservice.client.CibsevenProcessClient;
import de.ayurly.app.dataservice.entity.user.MyAyurlyContent;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/tagesprozess")
public class TagesprozessResource {

    @Inject
    @RestClient
    CibsevenProcessClient processClient;

    @Inject
    JsonWebToken jwt;

    @POST
    @Path("/generieren")
    @RolesAllowed("user")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response generiereTagesContent(Map<String, String> payload) {
        String selectedDateStr = payload.get("date");
        if (selectedDateStr == null || selectedDateStr.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity(Map.of("error", "Datum fehlt.")).build();
        }
        
        String userId = jwt.getSubject();
        LocalDate selectedDate = LocalDate.parse(selectedDateStr, DateTimeFormatter.ISO_LOCAL_DATE);

        // falls user schon einen Eintrag für den Tag hat sofort entsprechende Rückmeldung geben.
        long count = MyAyurlyContent.count("user.id = ?1 and calendarDate = ?2", userId, selectedDate);
        if (count > 0) {
            return Response.ok(Map.of("status", "CONTENT_EXISTS")).build();
        }
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("userId", userId);
        variables.put("selectedDate", selectedDateStr);
        
        Map<String, Object> processPayload = Map.of("variables", variables);

        try {
            CibsevenProcessClient.ProcessInstance instance = processClient.startProcess("ayurly-tages-content-prozess", processPayload);
            return Response.accepted(Map.of("processInstanceId", instance.id, "status", "PROCESS_STARTED")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Prozess konnte nicht gestartet werden: " + e.getMessage()))
                    .build();
        }
    }
}