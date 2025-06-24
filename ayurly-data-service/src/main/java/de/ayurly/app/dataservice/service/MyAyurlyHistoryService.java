// Pfad: src/main/java/de/ayurly/app/dataservice/service/MyAyurlyHistoryService.java
package de.ayurly.app.dataservice.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
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
import org.jboss.logging.Logger;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MyAyurlyHistoryService {

    private static final Logger LOG = Logger.getLogger(MyAyurlyHistoryService.class);

    @Inject
    EntityManager entityManager;
    
    public static class GraphDataPoint {
        public String label;
        public double progress;

        public GraphDataPoint(String label, Double progress) {
            this.label = label;
            this.progress = (progress != null) ? progress : 0.0;
        }
    }

    public static class CalendarDayProgress {
        public String date; // Format: "YYYY-MM-DD"
        public double progress;

        public CalendarDayProgress(LocalDate date, Double progress) {
            this.date = date.toString();
            this.progress = (progress != null) ? progress : 0.0;
        }
    }

    @Transactional
    public List<CalendarDayProgress> getMonthlyProgress(String userId, int year, int month) {
        String hql = "SELECT NEW de.ayurly.app.dataservice.service.MyAyurlyHistoryService$CalendarDayProgress(h.calendarDate, AVG(h.progressPercentage)) " +
                 "FROM MyAyurlyHistory h " +
                 "WHERE h.user.id = :userId AND YEAR(h.calendarDate) = :year AND MONTH(h.calendarDate) = :month " +
                 "GROUP BY h.calendarDate " +
                 "ORDER BY h.calendarDate ASC";
    
        return entityManager.createQuery(hql, CalendarDayProgress.class)
            .setParameter("userId", userId)
            .setParameter("year", year)
            .setParameter("month", month)
            .getResultList();
    }

    @Transactional
    public List<GraphDataPoint> getAggregatedHistory(String userId, String timeframe) {
        
        LocalDate endDate = LocalDate.now(ZoneId.of("Europe/Berlin"));
        LocalDate startDate;
        String dateSelection;
        String dateGrouping;
        DateTimeFormatter formatter;

        switch (timeframe) {
            case "week":
                startDate = endDate.minusDays(6);
                dateGrouping = "TO_CHAR(calendarDate, 'YYYY-MM-DD')";
                formatter = DateTimeFormatter.ofPattern("dd.MM.");
                break;
            case "month":
                startDate = endDate.minusMonths(1).plusDays(1);
                dateGrouping = "TO_CHAR(calendarDate, 'YYYY-MM-DD')";
                formatter = DateTimeFormatter.ofPattern("dd.MM.");
                break;
            case "year":
                startDate = endDate.minusYears(1).plusDays(1);
                dateGrouping = "TO_CHAR(calendarDate, 'YYYY-WW')"; // Gruppiert nach Kalenderwoche
                formatter = DateTimeFormatter.ofPattern("w"); // 'w' für Woche des Jahres
                break;
            case "total":
                // Finde das erste Datum des Users
                MyAyurlyHistory firstEntry = MyAyurlyHistory.find("user.id = ?1 ORDER BY calendarDate ASC", userId).firstResult();
                startDate = (firstEntry != null) ? firstEntry.calendarDate : endDate;
                // Aggregiere monatlich für die Gesamtansicht
                dateGrouping = "TO_CHAR(calendarDate, 'YYYY-MM')"; 
                formatter = DateTimeFormatter.ofPattern("MMM yy");
                break;
            default:
                 return new ArrayList<>();
        }
        
        dateSelection = "MIN(" + dateGrouping + ")";

        StringBuilder queryBuilder = new StringBuilder();
        Parameters params = Parameters.with("userId", userId).and("startDate", startDate).and("endDate", endDate);
        queryBuilder.append("SELECT NEW de.ayurly.app.dataservice.service.MyAyurlyHistoryService$GraphDataPoint(" + dateSelection + ", AVG(progressPercentage)) ");
        queryBuilder.append("FROM MyAyurlyHistory WHERE user.id = :userId AND calendarDate BETWEEN :startDate AND :endDate ");
        queryBuilder.append("GROUP BY " + dateGrouping + " ORDER BY " + dateSelection + " ASC");

        LOG.infof("Executing history query: %s with params: %s", queryBuilder.toString(), params.map());

       var query = entityManager.createQuery(queryBuilder.toString(), GraphDataPoint.class);
        for (Map.Entry<String, Object> entry : params.map().entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        List<GraphDataPoint> results = query.getResultList();

        // Formatiere das Label für die Anzeige im Frontend
        results.forEach(point -> {
             try {
                if ("year".equals(timeframe)) {
                   // Format für KW: 'KW 26'
                    String weekNum = LocalDate.parse(point.label.substring(0,4) + "-W" + point.label.substring(5,7) + "-1", DateTimeFormatter.ISO_WEEK_DATE).format(formatter);
                    point.label = "KW " + weekNum;
                } else if ("total".equals(timeframe)) {
                     point.label = LocalDate.parse(point.label + "-01").format(formatter);
                }
                else { // "week" or "month"
                    point.label = LocalDate.parse(point.label).format(formatter);
               }
             } catch (Exception e) {
                 LOG.warnf("Could not parse date label: %s for timeframe %s", point.label, timeframe);
                 // Label bleibt unverändert im Fehlerfall
             }
        });

        return results;
    }

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