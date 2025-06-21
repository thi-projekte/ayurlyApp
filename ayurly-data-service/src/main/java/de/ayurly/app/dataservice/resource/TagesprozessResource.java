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

    
    private static class CamundaVariable {
        public String type;
        public Object value;

        public CamundaVariable(String type, Object value) {
            this.type = type;
            this.value = value;
        }
    }

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
        // falls kein Content vorliegt
        long count = MyAyurlyContent.count("user.id = ?1 and calendarDate = ?2", userId, selectedDate);
        if (count > 0) {
            return Response.ok(Map.of("status", "CONTENT_EXISTS")).build();
        }
        
        Map<String, CamundaVariable> variables = new HashMap<>();
        variables.put("userId", new CamundaVariable("String", userId));
        variables.put("selectedDate", new CamundaVariable("String", selectedDateStr));
        
        Map<String, Object> processPayload = Map.of("variables", variables);

        try {
            CibsevenProcessClient.ProcessInstance instance = processClient.startProcess("ayurly-tages-content-prozess", processPayload);
            return Response.accepted(Map.of("processInstanceId", instance.id, "status", "PROCESS_STARTED")).build();
        } catch (Exception e) {
            System.err.println("Fehler beim Starten des Camunda-Prozesses: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Prozess konnte nicht gestartet werden. Details siehe Server-Log."))
                    .build();
        }
    }
}