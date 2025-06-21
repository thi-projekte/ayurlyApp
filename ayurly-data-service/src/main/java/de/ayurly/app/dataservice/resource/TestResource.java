package de.ayurly.app.dataservice.resource;

import java.util.Map;

import org.eclipse.microprofile.rest.client.inject.RestClient;

import de.ayurly.app.dataservice.client.CibsevenProcessClient;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/test-prozess")
public class TestResource {

    @Inject
    @RestClient
    CibsevenProcessClient processClient;

    // ENDPUNKT 1: Startet den Prozess
    @POST
    @Path("/start")
    @Produces(MediaType.APPLICATION_JSON)
    public Response startTestProcess() {
        Map<String, Object> payload = Map.of("variables", Map.of());
        CibsevenProcessClient.ProcessInstance instance = processClient.startProcess("test-prozess", payload);
        return Response.ok(Map.of("instanceId", instance.id)).build();
    }

    // ENDPUNKT 2: Wird vom Frontend wiederholt aufgerufen (gepollt), um das Ergebnis abzufragen
    @GET
    @Path("/{instanceId}/result")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getProcessResult(@PathParam("instanceId") String instanceId) {
        // Frage die Camunda-History-API nach unserer Variable ab
        CibsevenProcessClient.Variable[] variables = processClient.getProcessVariable(instanceId, "dynamischerInhalt");

        // Wenn das Array leer ist, ist der Prozess noch nicht so weit.
        if (variables == null || variables.length == 0) {
            // Sende "204 No Content", damit das Frontend weiß, dass es weiter pollen soll.
            return Response.status(Response.Status.NO_CONTENT).build();
        } else {
            // Variable gefunden! Sende sie an das Frontend.
            return Response.ok(Map.of("value", variables[0].value)).build();
        }
    }
}