package de.ayurly.app.dataservice.resource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Encoding;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import jakarta.annotation.security.RolesAllowed; // Wichtig für RESTEasy Reactive
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@jakarta.ws.rs.Path("/api/admin/uploads") // Vollqualifizierter Name für die Annotation -> um Kollision zu vermeiden, weil 2x Path import
@ApplicationScoped
@Tag(name = "File Upload (Admin)", description = "Handles file uploads for content images.")
public class FileUploadResource {

    private static final Logger LOG = Logger.getLogger(FileUploadResource.class);

    @ConfigProperty(name = "app.upload.directory")
    String uploadDirectory; // Aus application.properties

    public static class FileUploadRequest {
        @org.jboss.resteasy.reactive.RestForm("file") // Name des Formularfelds
        public FileUpload file;

        @org.jboss.resteasy.reactive.RestForm("subfolder") // Optional: z.B. "recipes", "users"
        public String subfolder;
    }

    public static class FileUploadResponse {
        public String filePath; // Relativer Pfad, der in der DB gespeichert wird, z.B. /uploads/recipes/bild.jpg
        public String fileName;

        public FileUploadResponse(String filePath, String fileName) {
            this.filePath = filePath;
            this.fileName = fileName;
        }
    }

    @POST
    @jakarta.ws.rs.Path("/image") // Vollqualifizierter Name für die Annotation -> um Kollision zu vermeiden, weil 2x Path import
    @RolesAllowed("admin") // Nur Admins dürfen Bilder hochladen
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Upload an image file", description = "Uploads an image to a specified subfolder within the configured upload directory.")
    @RequestBody(
        description = "Multipart form data containing the file and an optional subfolder.",
        required = true,
        content = @Content(
            mediaType = MediaType.MULTIPART_FORM_DATA,
            schema = @Schema(implementation = FileUploadRequest.class),
            encoding = {
                @Encoding(name = "file", contentType = "image/jpeg, image/png, image/gif, image/webp"),
                @Encoding(name = "subfolder", contentType = MediaType.TEXT_PLAIN)
            }
        )
    )
    @APIResponse(responseCode = "200", description = "File uploaded successfully", content = @Content(schema = @Schema(implementation = FileUploadResponse.class)))
    @APIResponse(responseCode = "400", description = "No file uploaded or invalid request")
    @APIResponse(responseCode = "500", description = "Internal server error during file upload")
    @SecurityRequirement(name = "jwtAuth")
    public Response uploadImage(FileUploadRequest request) {
        if (request.file == null || request.file.fileName() == null || request.file.fileName().isEmpty()) {
            LOG.warn("Upload attempt with no file or no filename.");
            return Response.status(Response.Status.BAD_REQUEST).entity("No file uploaded or filename is missing.").build();
        }

        FileUpload uploadedFile = request.file;
        String subfolder = (request.subfolder != null && !request.subfolder.trim().isEmpty()) ? request.subfolder.trim() : "general";

        // Erstelle einen eindeutigen Dateinamen, um Überschreibungen zu vermeiden
        String originalFileName = uploadedFile.fileName();
        String extension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            extension = originalFileName.substring(i); // .jpg, .png etc.
        }
        String uniqueFileName = UUID.randomUUID().toString() + extension;

        // Zielverzeichnis erstellen, falls es nicht existiert
        java.nio.file.Path targetSubfolderPath = java.nio.file.Paths.get(uploadDirectory, subfolder); // Vollqualifizierter Name
        try {
            Files.createDirectories(targetSubfolderPath); // Erstellt das Verzeichnis inkl. Parents, falls nicht vorhanden
        } catch (IOException e) {
            LOG.errorf(e, "Could not create target directory: %s", targetSubfolderPath.toString());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Could not create target directory.").build();
        }

        java.nio.file.Path filePathInContainer = targetSubfolderPath.resolve(uniqueFileName); // Vollqualifizierter Name

        try (InputStream fileInputStream = uploadedFile.uploadedFile().toFile().toURI().toURL().openStream()) { // Holt den Stream von der temporären Datei
            Files.copy(fileInputStream, filePathInContainer, StandardCopyOption.REPLACE_EXISTING);
            LOG.infof("File %s uploaded successfully to %s", originalFileName, filePathInContainer.toString());

            // Erstelle den relativen Pfad für die Datenbank und den Frontend-Zugriff
            // Dieser Pfad muss dem entsprechen, was Nginx später ausliefert
            String publicFilePath = "/uploads/" + subfolder + "/" + uniqueFileName;

            return Response.ok(new FileUploadResponse(publicFilePath, originalFileName)).build();
        } catch (IOException e) {
            LOG.errorf(e, "Error saving uploaded file %s to %s", originalFileName, filePathInContainer.toString());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error saving uploaded file.").build();
        } finally {
            // Temporäre Datei löschen, die von RESTEasy Reactive erstellt wurde
            try {
                Files.deleteIfExists(uploadedFile.uploadedFile());
            } catch (IOException e) {
                LOG.warnf(e, "Could not delete temporary uploaded file: %s", uploadedFile.uploadedFile().toString());
            }
        }
    }
}