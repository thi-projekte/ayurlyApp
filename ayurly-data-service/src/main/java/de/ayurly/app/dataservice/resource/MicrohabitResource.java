package de.ayurly.app.dataservice.resource;

import java.util.Map;
import java.util.UUID;

import org.eclipse.microprofile.jwt.JsonWebToken;

import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.ContentLike;
import de.ayurly.app.dataservice.service.MicrohabitService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/microhabits")
@RolesAllowed("user")
public class MicrohabitResource {

    @Inject
    MicrohabitService microhabitService;

    @Inject
    JsonWebToken jwt;

    @POST
    @Path("/{id}/like")
    @Produces(MediaType.APPLICATION_JSON)
    public Response likeMicrohabit(@PathParam("id") UUID id) {
        String userId = jwt.getSubject();
        ContentItem updatedItem = microhabitService.likeMicrohabit(id, userId);
        boolean isLiked = ContentLike.count("contentItem.id = ?1 AND userId = ?2", id, userId) > 0;
        return Response.ok(Map.of("likeCount", updatedItem.likeCount, "likedByCurrentUser", isLiked)).build();
    }

    @POST
    @Path("/{id}/unlike")
    @Produces(MediaType.APPLICATION_JSON)
    public Response unlikeMicrohabit(@PathParam("id") UUID id) {
        String userId = jwt.getSubject();
        ContentItem updatedItem = microhabitService.unlikeMicrohabit(id, userId);
        boolean isLiked = ContentLike.count("contentItem.id = ?1 AND userId = ?2", id, userId) > 0;
        return Response.ok(Map.of("likeCount", updatedItem.likeCount, "likedByCurrentUser", isLiked)).build();
    }
}