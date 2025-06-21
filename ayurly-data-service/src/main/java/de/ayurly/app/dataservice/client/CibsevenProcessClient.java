package de.ayurly.app.dataservice.client;

import java.util.Map;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("/")
@RegisterRestClient(configKey="cibseven.api")
public interface CibsevenProcessClient {

    @POST
    @Path("/process-definition/key/{processKey}/start")
    @Consumes(MediaType.APPLICATION_JSON)
    ProcessInstance startProcess(@PathParam("processKey") String processKey, Map<String, Object> payload);

    @GET
    @Path("/history/variable-instance")
    @Produces(MediaType.APPLICATION_JSON)
    // Wir fragen die Historie ab, um sicherzugehen, dass die Variable geschrieben wurde
    Variable[] getProcessVariable(@QueryParam("processInstanceId") String instanceId, @QueryParam("variableName") String variableName);

    // DTOs (Data Transfer Objects) für die Antworten
    class ProcessInstance {
        public String id;
    }
    class Variable {
        public String value;
        public String type;
    }
}