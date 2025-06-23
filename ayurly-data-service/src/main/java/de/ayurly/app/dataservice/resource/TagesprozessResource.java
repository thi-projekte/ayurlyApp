package de.ayurly.app.dataservice.resource;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

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

    private static final Logger LOG = Logger.getLogger(TagesprozessResource.class);

    @Inject
    @RestClient
    CibsevenProcessClient processClient;

    @Inject
    JsonWebToken jwt;

    
    private static class CamundaVariable {
        public String type;
        public Object value;
        public CamundaVariable(String type, Object value) { this.type = type; this.value = value; }
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

        long count = MyAyurlyContent.count("user.id = ?1 and calendarDate = ?2", userId, selectedDate);
        if (count > 0) {
            return Response.ok(Map.of("status", "CONTENT_EXISTS")).build();
        }
        
        LocalDate today = LocalDate.now();
        boolean isDateValid = !selectedDate.isBefore(today); // true, wenn heute oder in der Zukunft

        Map<String, CamundaVariable> variables = new HashMap<>();
        variables.put("userId", new CamundaVariable("String", userId));
        variables.put("selectedDate", new CamundaVariable("String", selectedDateStr));
        // Übergeben Sie das Ergebnis der Prüfung als sauberen Boolean-Wert
        variables.put("isDateValid", new CamundaVariable("Boolean", isDateValid));
        
        Map<String, Object> processPayload = Map.of("variables", variables);

        try {
            LOG.infof("Starte Camunda-Prozess 'ayurly-tages-content-prozess' für User %s", userId);
            CibsevenProcessClient.ProcessInstance instance = processClient.startProcess("ayurly-tages-content-prozess", processPayload);
            LOG.infof("Prozess erfolgreich gestartet mit Instanz-ID: %s", instance.id);
            return Response.accepted(Map.of("processInstanceId", instance.id, "status", "PROCESS_STARTED")).build();
        } catch (Exception e) {
            LOG.errorf(e, "FATALER FEHLER beim Starten des Camunda-Prozesses für User %s", userId);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Prozess konnte nicht gestartet werden. Details siehe Server-Log."))
                    .build();
        }
    }

    @POST
    @Path("/reshuffle")
    @RolesAllowed("user")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response reshuffleTagesContent(Map<String, String> payload) {
        String selectedDateStr = payload.get("date");
        String tileKey = payload.get("tileKey");

        if (selectedDateStr == null || selectedDateStr.isBlank() || tileKey == null || tileKey.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity(Map.of("error", "Datum oder tileKey fehlen.")).build();
        }
        
        String userId = jwt.getSubject();
        LocalDate selectedDate = LocalDate.parse(selectedDateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        boolean isDateValid = !selectedDate.isBefore(LocalDate.now());

        Map<String, CamundaVariable> variables = new HashMap<>();
        variables.put("userId", new CamundaVariable("String", userId));
        variables.put("selectedDate", new CamundaVariable("String", selectedDateStr));
        variables.put("tileKey", new CamundaVariable("String", tileKey));
        variables.put("isDateValid", new CamundaVariable("Boolean", isDateValid));
        
        Map<String, Object> processPayload = Map.of("variables", variables);

        try {
            LOG.infof("Starte Camunda-Prozess 'ayurly-reshuffle-tile-prozess' für User %s und Kachel %s", userId, tileKey);
            CibsevenProcessClient.ProcessInstance instance = processClient.startProcess("ayurly-reshuffle-tile-prozess", processPayload);
            LOG.infof("Reshuffle-Prozess erfolgreich gestartet mit Instanz-ID: %s", instance.id);
            return Response.accepted(Map.of("processInstanceId", instance.id, "status", "PROCESS_STARTED")).build();
        } catch (Exception e) {
            LOG.errorf(e, "FATALER FEHLER beim Starten des Reshuffle-Prozesses für User %s", userId);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(Map.of("error", "Prozess konnte nicht gestartet werden.")).build();
        }
    }
}