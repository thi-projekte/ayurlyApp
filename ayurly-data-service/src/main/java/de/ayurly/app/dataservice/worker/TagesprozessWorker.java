package de.ayurly.app.dataservice.worker;

import java.util.Map;
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
                .asyncResponseTimeout(1000)
                .build();

        client.subscribe("user-preferences-laden").lockDuration(5000).handler(this::handleLadePraeferenzen).open();
        client.subscribe("content-generieren").lockDuration(10000).handler(this::handleGeneriereContent).open();
        client.subscribe("content-speichern").lockDuration(5000).handler(this::handleSpeichereContent).open();
        
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
}