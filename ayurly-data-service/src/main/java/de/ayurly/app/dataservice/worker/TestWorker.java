package de.ayurly.app.dataservice.worker;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.camunda.bpm.client.ExternalTaskClient;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import java.util.Map;

@ApplicationScoped
public class TestWorker {

    @ConfigProperty(name = "cibseven.api/mp-rest/url")
    String cibsevenApiUrl;

    void onStart(@Observes StartupEvent ev) {
        ExternalTaskClient client = ExternalTaskClient.create()
                .baseUrl(cibsevenApiUrl)
                .build();

        client.subscribe("dynamischen-inhalt-erzeugen")
                .lockDuration(1000)
                .handler((externalTask, externalTaskService) -> {
                    String inhalt = "Das ist ein dynamischer Test-Inhalt aus dem Prozess!";
                    Map<String, Object> variables = Map.of("dynamischerInhalt", inhalt);
                    externalTaskService.complete(externalTask, variables);
                }).open();
    }
}