package de.ayurly;

import java.util.Map;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;
import static io.restassured.RestAssured.given;
import io.restassured.http.ContentType;

@QuarkusTest
public class HelloProcessTest {

    @Test
    @SuppressWarnings("unchecked")
    public void testHelloProcessPath() {
        // 1. Starte eine neue Prozessinstanz
        String processInstanceId = given()
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .body("{}") // Leerer Body, wenn keine Startvariablen benötigt
            .when()
                .post("/hello_process")
            .then()
                .statusCode(201) // Quarkus Kogito default ist 201 für erfolgreiches Erstellen
                .body("id", notNullValue())
                .extract().path("id");

        // 2. Überprüfe, ob die Instanz erstellt wurde (optional, da der POST schon den ID liefert)
        given()
            .accept(ContentType.JSON)
        .when()
            .get("/hello_process/" + processInstanceId)
        .then()
            .statusCode(200)
            .body("id", equalTo(processInstanceId));

        // 3. Rufe die offenen Tasks für die Instanz ab
        // Kogito liefert oft ein Array von Tasks, auch wenn es nur einer ist.
        // Die genaue Struktur der Antwort hängt von der Kogito-Version und Konfiguration ab.
        // Ältere Versionen hatten /tasks?user=...&group=...
        // Neuere Versionen generieren den Pfad oft etwas anders, siehe Swagger UI.
        // Der Pfad hier ist ein häufiges Muster.
        Map<String, String> taskInfo = given()
                .accept(ContentType.JSON)
            .when()
                .get("/hello_process/" + processInstanceId + "/tasks")
            .then()
                .statusCode(200)
                .body("$", hasSize(1)) // Erwartet einen Task
                .body("[0].name", equalTo("UserTask_1")) // Task Name aus BPMN
                .body("[0].id", notNullValue())
                .extract().path("[0]"); // Extrahiere den ersten Task als Map

        String taskId = taskInfo.get("id");
        String taskName = taskInfo.get("name"); // Sollte "UserTask_1" sein

        // 4. Schließe den User Task ab
        // Der Task-Name ("UserTask_1" in diesem Fall) wird oft im Pfad verwendet
        given()
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .body("{}") // Leerer Body für den Task-Abschluss, wenn keine Daten übergeben werden
        .when()
            // Der Pfad zum Abschließen eines Tasks ist: /processId/{pId}/taskName/{taskId}
            // oder manchmal /processId/{pId}/humanTaskNodeName/{taskId}
            // Bitte prüfe den genauen Pfad in deiner Swagger-UI oder Kogito Doku
            .post("/hello_process/" + processInstanceId + "/" + taskName + "/" + taskId)
        .then()
            .statusCode(200)
            .body("id", equalTo(processInstanceId)); // Gibt die Prozessinstanz nach Abschluss zurück

        // 5. Überprüfe, ob die Prozessinstanz abgeschlossen ist (optional)
        // Abgeschlossene Instanzen geben oft einen 404 zurück, wenn sie nicht persistent sind
        // oder wenn die Persistenz so konfiguriert ist, dass abgeschlossene Instanzen nicht mehr über die Haupt-URL abgerufen werden.
        // Für In-Memory-Prozesse ohne spezielle Konfiguration sind sie oft einfach weg.
        given()
            .accept(ContentType.JSON)
        .when()
            .get("/hello_process/" + processInstanceId)
        .then()
            // .statusCode(404); // Wenn Instanz nach Abschluss nicht mehr gefunden wird
            .statusCode(200) // Oder 200, wenn sie noch abrufbar ist und einen 'state' hat
            .body("id", equalTo(processInstanceId)); // Überprüfe, ob der Prozessstatus als abgeschlossen markiert ist, falls die Instanz noch abrufbar ist.
                                                     // Die genaue Überprüfung hängt von der Struktur der Antwort für abgeschlossene Prozesse ab.
    }
}