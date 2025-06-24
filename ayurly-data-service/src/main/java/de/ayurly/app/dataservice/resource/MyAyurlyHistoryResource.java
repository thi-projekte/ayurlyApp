package de.ayurly.app.dataservice.resource;

import java.util.List;

import org.eclipse.microprofile.jwt.JsonWebToken;

import de.ayurly.app.dataservice.service.MyAyurlyHistoryService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/myayurly/history")
@RolesAllowed("user")
public class MyAyurlyHistoryResource {

    @Inject
    MyAyurlyHistoryService historyService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/graph")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getGraphData(@QueryParam("timeframe") String timeframe) {
        
        String userId = jwt.getSubject();
        
        if (timeframe == null || timeframe.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing required query parameter: timeframe").build();
        }

        List<MyAyurlyHistoryService.GraphDataPoint> data = historyService.getAggregatedHistory(userId, timeframe);
        
        return Response.ok(data).build();
    }
}