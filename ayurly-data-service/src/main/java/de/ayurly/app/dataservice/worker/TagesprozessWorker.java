package de.ayurly.app.dataservice.worker;

import java.util.Map;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.camunda.bpm.client.ExternalTaskClient;
import org.camunda.bpm.client.task.ExternalTask;
import org.camunda.bpm.client.task.ExternalTaskService;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import de.ayurly.app.dataservice.service.TagesprozessService;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

@ApplicationScoped
public class TagesprozessWorker {
    private static final Logger LOGGER = Logger.getLogger(TagesprozessWorker.class.getName());

    @Inject
    TagesprozessService tagesprozessService;

    @ConfigProperty(name = "cibseven.api/mp-rest/url")
    String cibsevenApiUrl;

    void onStart(@Observes StartupEvent ev) {
        ExternalTaskClient client = ExternalTaskClient.create()
                .baseUrl(cibsevenApiUrl)
                .asyncResponseTimeout(30000)
                .disableBackoffStrategy()
                .build();

        client.subscribe("user-preferences-laden").lockDuration(5000).handler(this::handleLadePraeferenzen).open();
        client.subscribe("content-generieren").lockDuration(10000).handler(this::handleGeneriereContent).open();
        client.subscribe("content-speichern").lockDuration(5000).handler(this::handleSpeichereContent).open();

        client.subscribe("delete-tile-content").lockDuration(5000).handler(this::handleDeleteTileContent).open();
        client.subscribe("generate-single-tile-content").lockDuration(10000).handler(this::handleGenerateSingleTileContent).open();
        client.subscribe("save-single-tile-content").lockDuration(5000).handler(this::handleSaveSingleTileContent).open();
        
        LOGGER.info("Tagesprozess Worker gestartet und für Topics registriert.");
    }

    private void handleLadePraeferenzen(ExternalTask task, ExternalTaskService service) {
        LOGGER.info("WORKER: Bearbeite Task [user-preferences-laden] für Prozess " + task.getProcessInstanceId());
        try {
            String userId = task.getVariable("userId");
            Map<String, Object> praeferenzen = tagesprozessService.ladeUserPraeferenzen(userId);
            service.complete(task, praeferenzen);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "WORKER: Fehler bei [user-preferences-laden]", e);
            service.handleBpmnError(task, "FEHLER_LADEN_PRÄFERENZEN", e.getMessage());
        }
    }
    
    private void handleGeneriereContent(ExternalTask task, ExternalTaskService service) {
        LOGGER.info("WORKER: Bearbeite Task [content-generieren] für Prozess " + task.getProcessInstanceId());
        try {
            Map<String, Object> generierterContent = tagesprozessService.generiereTagesContent(task.getAllVariables());
            service.complete(task, generierterContent);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "WORKER: Fehler bei [content-generieren]", e);
            service.handleBpmnError(task, "FEHLER_GENERIERUNG_CONTENT", e.getMessage());
        }
    }

    private void handleSpeichereContent(ExternalTask task, ExternalTaskService service) {
        LOGGER.info("WORKER: Bearbeite Task [content-speichern] für Prozess " + task.getProcessInstanceId());
        try {
            tagesprozessService.speichereTagesContent(task.getAllVariables());
            service.complete(task);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "WORKER: Fehler bei [content-speichern]", e);
            service.handleBpmnError(task, "FEHLER_SPEICHERUNG_CONTENT", e.getMessage());
        }
    }

    private void handleDeleteTileContent(ExternalTask task, ExternalTaskService service) {
        LOGGER.info("WORKER: Bearbeite Task [delete-tile-content] für Prozess " + task.getProcessInstanceId());
        try {
            String userId = task.getVariable("userId");
            String selectedDate = task.getVariable("selectedDate");
            String tileKey = task.getVariable("tileKey");
            tagesprozessService.deleteTileContent(userId, selectedDate, tileKey);
            service.complete(task);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "WORKER: Fehler bei [delete-tile-content]", e);
            service.handleBpmnError(task, "FEHLER_LOESCHEN_CONTENT", e.getMessage());
        }
    }

    private void handleGenerateSingleTileContent(ExternalTask task, ExternalTaskService service) {
        LOGGER.info("WORKER: Bearbeite Task [generate-single-tile-content] für Prozess " + task.getProcessInstanceId());
        try {
            String userId = task.getVariable("userId");
            String tileKey = task.getVariable("tileKey");
            Map<String, Object> generatedContent = tagesprozessService.generateSingleTileContent(userId, tileKey);
            service.complete(task, generatedContent);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "WORKER: Fehler bei [generate-single-tile-content]", e);
            service.handleBpmnError(task, "FEHLER_GENERIERUNG_CONTENT", e.getMessage());
        }
    }

    private void handleSaveSingleTileContent(ExternalTask task, ExternalTaskService service) {
        LOGGER.info("WORKER: Bearbeite Task [save-single-tile-content] für Prozess " + task.getProcessInstanceId());
        try {
            tagesprozessService.saveSingleTileContent(task.getVariable("userId"), task.getVariable("selectedDate"), task.getVariable("tileKey"), task.getVariable("contentIds"));
           service.complete(task);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "WORKER: Fehler bei [save-single-tile-content]", e);
            service.handleBpmnError(task, "FEHLER_SPEICHERUNG_CONTENT", e.getMessage());
        }
    }
}