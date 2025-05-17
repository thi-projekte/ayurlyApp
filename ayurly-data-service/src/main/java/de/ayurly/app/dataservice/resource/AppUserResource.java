package de.ayurly.app.dataservice.resource; 

import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger; // Besser als @RolesAllowed({}) wenn nur Authentifizierung nötig ist

import de.ayurly.app.dataservice.entity.AppUser;
import io.quarkus.security.Authenticated;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/users") // Geänderter Pfad für Klarheit
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AppUserResource {

    private static final Logger LOG = Logger.getLogger(AppUserResource.class);

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/me")
    @Authenticated // Stellt sicher, dass ein gültiges JWT vorhanden ist
    @Transactional
    public Response getCurrentUserAccount() {
        if (jwt == null || jwt.getSubject() == null) {
            // Sollte durch @Authenticated bereits abgefangen werden, aber als doppelter Check
            LOG.warn("JWT or subject is null. User not authenticated or token not properly propagated.");
            return Response.status(Response.Status.UNAUTHORIZED)
                           .entity("User not authenticated or token invalid.")
                           .build();
        }

        String keycloakUserId = jwt.getSubject();
        AppUser appUser = AppUser.findById(keycloakUserId);

        if (appUser == null) {
            LOG.infof("AppUser mit Keycloak-ID %s nicht in lokaler DB gefunden. Erstelle neuen Eintrag.", keycloakUserId);
            appUser = new AppUser(keycloakUserId);
            // Optional: email aus Token initial setzen, falls gewünscht und in AppUser-Entität vorhanden
            // appUser.email = jwt.getClaim("email");
            // doshaType ist initial null und wird über den PUT-Endpunkt gesetzt.

            try {
                appUser.persist();
                LOG.infof("Neuer AppUser für Keycloak-ID %s erfolgreich in DB gespeichert.", keycloakUserId);
            } catch (Exception e) {
                LOG.errorf(e, "Fehler beim Speichern des neuen AppUser für Keycloak-ID %s", keycloakUserId);
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                               .entity("Fehler beim Anlegen des Benutzerprofils in der Datenbank.")
                               .build();
            }
        } else {
            LOG.infof("AppUser für Keycloak-ID %s aus DB geladen.", keycloakUserId);
        }
        
        // Erstelle ein DTO, das die Keycloak-Daten und die lokalen Daten kombiniert
        UserAccountResponse responseDto = new UserAccountResponse(
            keycloakUserId,
            jwt.getClaim("preferred_username"),
            jwt.getClaim("email"),
            jwt.getClaim("given_name"),
            jwt.getClaim("family_name"),
            appUser.getDoshaType()
        );

        return Response.ok(responseDto).build();
    }

    @PUT
    @Path("/me/dosha")
    @Authenticated
    @Transactional
    public Response updateUserDosha(DoshaUpdateRequest request) {
        if (jwt == null || jwt.getSubject() == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        String keycloakUserId = jwt.getSubject();
        AppUser appUser = AppUser.findById(keycloakUserId);

        if (appUser == null) {
            // Fall: User ist in Keycloak, aber noch nicht in unserer app_user Tabelle.
            // Das sollte idealerweise durch einen vorherigen GET /me Aufruf angelegt worden sein.
            // Wir könnten ihn hier auch anlegen:
            LOG.infof("AppUser für Keycloak-ID %s nicht gefunden beim Dosha-Update, lege ihn an.", keycloakUserId);
            appUser = new AppUser(keycloakUserId);
            // Optional: username/email hier auch setzen, falls in AppUser vorhanden
            // appUser.username = jwt.getClaim("preferred_username");
            // appUser.email = jwt.getClaim("email");
        }

        appUser.doshaType = request.doshaType;
        try {
            appUser.persist(); // persist() handhabt sowohl create als auch update
            LOG.infof("Dosha-Typ für AppUser mit Keycloak-ID %s auf %s aktualisiert.", keycloakUserId, appUser.doshaType);

            // Antwort mit dem aktualisierten kombinierten Profil
             UserAccountResponse responseDto = new UserAccountResponse(
                keycloakUserId,
                jwt.getClaim("preferred_username"),
                jwt.getClaim("email"),
                jwt.getClaim("given_name"),
                jwt.getClaim("family_name"),
                appUser.getDoshaType()
            );
            return Response.ok(responseDto).build();
        } catch (Exception e) {
            LOG.errorf(e, "Fehler beim Aktualisieren des Dosha-Typs für AppUser mit Keycloak-ID %s", keycloakUserId);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                           .entity("Fehler beim Aktualisieren des Dosha-Typs.")
                           .build();
        }
    }

    // DTO für die Anfrage zum Aktualisieren des Dosha-Typs
    public static class DoshaUpdateRequest {
        public String doshaType;
    }

    // DTO für die Antwort von /me, kombiniert Keycloak-Daten und lokale Daten
    public static class UserAccountResponse {
        public String keycloakId;
        public String username;
        public String email;
        public String firstName;
        public String lastName;
        public String doshaType; // Aus der lokalen DB

        public UserAccountResponse(String keycloakId, String username, String email, String firstName, String lastName, String doshaType) {
            this.keycloakId = keycloakId;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.doshaType = doshaType;
        }
    }
}