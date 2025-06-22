// Pfad: src/main/java/de/ayurly/app/dataservice/service/MyAyurlyHistoryService.java
package de.ayurly.app.dataservice.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import de.ayurly.app.dataservice.entity.AppUser;
import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.MicrohabitContent;
import de.ayurly.app.dataservice.entity.content.recipe.RecipeContent;
import de.ayurly.app.dataservice.entity.content.yoga.YogaExerciseContent;
import de.ayurly.app.dataservice.entity.lookup.LookupRoutineTile;
import de.ayurly.app.dataservice.entity.user.MyAyurlyContent;
import de.ayurly.app.dataservice.entity.user.MyAyurlyHistory;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MyAyurlyHistoryService {

    @Transactional
    public void updateHistoryForDay(AppUser user, LocalDate date) {
        // 1. Lade alle MyAyurlyContent-Einträge für den Tag
        List<MyAyurlyContent> contentsForDay = MyAyurlyContent.list("user = ?1 and calendarDate = ?2", user, date);

        // 2. Gruppiere sie nach der zugehörigen Routine-Kachel
        Map<LookupRoutineTile, List<MyAyurlyContent>> contentByRoutineTile = new HashMap<>();
        for (MyAyurlyContent content : contentsForDay) {
            contentByRoutineTile.computeIfAbsent(content.routineTile, k -> new ArrayList<>()).add(content);
        }
        
        // 3. Aktualisiere den Fortschritt für jede Kachel
        contentByRoutineTile.forEach((routineTile, contentList) -> {
            updateProgressForRoutine(user, date, routineTile, contentList);
        });
    }

    private void updateProgressForRoutine(AppUser user, LocalDate date, LookupRoutineTile routineTile, List<MyAyurlyContent> contentList) {
        // Map, um den Fortschritt zu sammeln: Key=Dosha-Typ, Value=[completedTasks, totalTasks]
        Map<String, int[]> progressMap = new HashMap<>();

        // Iteriere durch jeden Inhaltspunkt der Kachel
        for (MyAyurlyContent myAyurlyContent : contentList) {
            // Hole die Liste der Dosha-Typen für diesen Inhaltspunkt
            List<String> doshaTypes = getDoshaTypesForContentItem(myAyurlyContent.contentItem);

            // Aktualisiere die Zähler für jeden zugehörigen Dosha-Typ
            for (String dosha : doshaTypes) {
                progressMap.putIfAbsent(dosha, new int[]{0, 0});
                int[] counts = progressMap.get(dosha);
                if (myAyurlyContent.isDone) {
                    counts[0]++; // Erledigte Aufgaben
                }
                counts[1]++; // Gesamtzahl der Aufgaben
            }
        }

        // Speichere die aggregierten Ergebnisse in der myayurly_history Tabelle
        progressMap.forEach((dosha, counts) -> {
            int completedTasks = counts[0];
            int totalTasks = counts[1];

            BigDecimal percentage = (totalTasks == 0) ? BigDecimal.ZERO
                    : new BigDecimal(completedTasks).multiply(new BigDecimal(100))
                            .divide(new BigDecimal(totalTasks), 2, RoundingMode.HALF_UP);

            // Finde oder erstelle den passenden History-Eintrag
            MyAyurlyHistory history = MyAyurlyHistory.find("user = :user and calendarDate = :date and routineTile = :tile and doshaType = :dosha",
                Parameters.with("user", user)
                          .and("date", date)
                          .and("tile", routineTile)
                          .and("dosha", dosha)).firstResult();
            
            if (history == null) {
                history = new MyAyurlyHistory();
                history.user = user;
                history.calendarDate = date;
                history.routineTile = routineTile;
                history.doshaType = dosha;
            }
            
            history.totalTasks = totalTasks;
            history.completedTasks = completedTasks;
            history.progressPercentage = percentage;
            
            history.persist();
        });
    }

    /**
     * Ermittelt die Dosha-Typen für einen gegebenen ContentItem durch Überprüfung des konkreten Sub-Typs.
     * Nutzt 'instanceof', um sicher auf die spezifischen Implementierungen zuzugreifen.
     * @param contentItem Die abstrakte ContentItem-Entität.
     * @return Eine Liste von Dosha-Typ-Strings (z.B. ["VATA", "PITTA"] oder ["ALL"]).
     */
    private List<String> getDoshaTypesForContentItem(ContentItem contentItem) {
        String[] doshaArray = null;

        // Dank Hibernate's Polymorphie können wir den echten Typ zur Laufzeit prüfen.
        if (contentItem instanceof RecipeContent) {
            doshaArray = ((RecipeContent) contentItem).doshaTypes;
        } else if (contentItem instanceof YogaExerciseContent) {
            doshaArray = ((YogaExerciseContent) contentItem).doshaTypes;
        } else if (contentItem instanceof MicrohabitContent) {
            doshaArray = ((MicrohabitContent) contentItem).doshaTypes;
        }

        // Fallback: Wenn kein spezifischer Typ oder kein Dosha-Array vorhanden ist.
        if (doshaArray == null || doshaArray.length == 0) {
            return Collections.singletonList("ALL");
        }

        return Arrays.asList(doshaArray);
    }
}