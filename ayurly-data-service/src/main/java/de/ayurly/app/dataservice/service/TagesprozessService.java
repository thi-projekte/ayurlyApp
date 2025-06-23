package de.ayurly.app.dataservice.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList; 
import java.util.HashMap;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.jboss.logging.Logger;

import de.ayurly.app.dataservice.entity.AppUser;
import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.recipe.RecipeContent;
import de.ayurly.app.dataservice.entity.content.yoga.YogaExerciseContent;
import de.ayurly.app.dataservice.entity.lookup.LookupRoutineTile;
import de.ayurly.app.dataservice.entity.user.MyAyurlyContent;
import de.ayurly.app.dataservice.entity.user.MyAyurlyHistory;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class TagesprozessService {

    private static final Logger LOG = Logger.getLogger(TagesprozessService.class);

    @Inject
    EntityManager entityManager;

    @Transactional
    public Map<String, Object> ladeUserPraeferenzen(String userId) {
        AppUser user = AppUser.findById(userId);
        if (user == null) throw new IllegalStateException("User mit ID " + userId + " nicht gefunden.");
        
        Map<String, Object> praeferenzen = new HashMap<>();
        praeferenzen.put("doshaType", user.doshaType);
        praeferenzen.put("showMorningFlow", user.showMorningFlow);
        praeferenzen.put("showEveningFlow", user.showEveningFlow);
        praeferenzen.put("showRestCycle", user.showRestCycle);
        praeferenzen.put("showZenMove", user.showZenMove);
        praeferenzen.put("showNourishCycle", user.showNourishCycle);
        return praeferenzen;
    }

    @Transactional
    public Map<String, Object> generiereTagesContent(Map<String, Object> prozessVariablen) {
        String doshaType = (String) prozessVariablen.get("doshaType");
        Map<String, Object> generierterContent = new HashMap<>();

        Parameters params = Parameters.with("doshaParam", "%" + doshaType + "%").and("tridoshicParam", "%Tridoshic%");

        if ((boolean) prozessVariablen.getOrDefault("showZenMove", true)) {
            findRandomContentIds(YogaExerciseContent.class, doshaType, 1).stream().findFirst()
                .ifPresent(yogaId -> generierterContent.put("zenMoveContentIds", new ArrayList<>(List.of(yogaId))));
            List<UUID> zenMoveMicroHabits = findRandomContentIds("ZEN_MOVE", doshaType, 3);
            if (generierterContent.containsKey("zenMoveContentIds")) {
                ((List<UUID>) generierterContent.get("zenMoveContentIds")).addAll(zenMoveMicroHabits);
            } else if (!zenMoveMicroHabits.isEmpty()) {
                generierterContent.put("zenMoveContentIds", zenMoveMicroHabits);
            }
        }

        if ((boolean) prozessVariablen.getOrDefault("showNourishCycle", true)) {
            findRandomContentIds(RecipeContent.class, doshaType, 1).stream().findFirst()
                .ifPresent(recipeId -> generierterContent.put("nourishCycleContentIds", new ArrayList<>(List.of(recipeId))));
            // Zusätzliche Microhabits für NourishCycle generieren
            List<UUID> nourishCycleMicroHabits = findRandomContentIds("NOURISH_CYCLE", doshaType, 3);
            if (generierterContent.containsKey("nourishCycleContentIds")) {
                ((List<UUID>) generierterContent.get("nourishCycleContentIds")).addAll(nourishCycleMicroHabits);
            } else if (!nourishCycleMicroHabits.isEmpty()) {
                generierterContent.put("nourishCycleContentIds", nourishCycleMicroHabits);
            }
        }
        
        List<UUID> allMicroHabitIds = new ArrayList<>();
        if ((boolean) prozessVariablen.getOrDefault("showMorningFlow", true)) {
            allMicroHabitIds.addAll(findRandomContentIds("MORNING_FLOW", doshaType, 3));
        }
        if ((boolean) prozessVariablen.getOrDefault("showEveningFlow", true)) {
            allMicroHabitIds.addAll(findRandomContentIds("EVENING_FLOW", doshaType, 3));
        }
        if ((boolean) prozessVariablen.getOrDefault("showRestCycle", true)) {
            allMicroHabitIds.addAll(findRandomContentIds("REST_CYCLE", doshaType, 3));
        }

        if (!allMicroHabitIds.isEmpty()) {
            generierterContent.put("microHabitIds", allMicroHabitIds);
        }
        
        return generierterContent;
    }

    @SuppressWarnings("unchecked")
    private List<UUID> findRandomContentIds(Class<? extends ContentItem> contentType, String doshaType, int limit) {
        String tableName = getTableNameForContentType(contentType);
        String nativeQuery = "SELECT content_id FROM " + tableName + " WHERE :dosha = ANY(dosha_types) OR 'tridoshic' = ANY(dosha_types) ORDER BY RANDOM() LIMIT :limit";
        LOG.infof("Führe Query aus: %s mit dosha=%s, limit=%d", nativeQuery, doshaType, limit);
        List<UUID> resultList = entityManager.createNativeQuery(nativeQuery, UUID.class)
                .setParameter("dosha", doshaType)
                .setParameter("limit", limit)
                .getResultList();
        LOG.infof("Query für %s lieferte %d Ergebnisse.", tableName, resultList.size());
        return resultList;
    }

    @SuppressWarnings("unchecked")
    private List<UUID> findRandomContentIds(String tileKey, String doshaType, int limit) {
        String nativeQuery = "SELECT md.content_id FROM microhabit_details md INNER JOIN lookup_routine_tiles lrt ON md.routine_tile_id = lrt.id WHERE lrt.tile_key = :tileKey " + 
                              "AND (:dosha = ANY(md.dosha_types) OR 'tridoshic' = ANY(md.dosha_types)) ORDER BY RANDOM() LIMIT :limit";
        LOG.infof("Führe Query für Microhabits aus: %s mit tileKey=%s, dosha=%s, limit=%d", nativeQuery, tileKey, doshaType, limit);
        List<UUID> resultList = entityManager.createNativeQuery(nativeQuery, UUID.class)
                .setParameter("tileKey", tileKey)
                .setParameter("dosha", doshaType)
                .setParameter("limit", limit)
                .getResultList();
        LOG.infof("Query für Microhabits (tileKey=%s) lieferte %d Ergebnisse.", tileKey, resultList.size());
        return resultList;
    }

    private String getCorrectDoshaType(String doshaType) {
        if(doshaType == null)
            return null;
        else if(doshaType.equals("pitta") || doshaType.equals("Pitta"))
            return "Pitta";
        else if(doshaType.equals("kapha") || doshaType.equals("Kapha"))
            return "Kapha";
        else if (doshaType.equals("vata") || doshaType.equals("Vata"))
            return "Vata";
        else 
            return "Tridoshic";
    }

    private String getTableNameForContentType(Class<? extends ContentItem> contentType) {
        if (contentType.equals(RecipeContent.class)) {
            return "recipe_details";
        } else if (contentType.equals(YogaExerciseContent.class)) {
            return "yoga_exercise_details";
        }
        throw new IllegalArgumentException("Unsupported content type: " + contentType.getName());
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public void speichereTagesContent(Map<String, Object> prozessVariablen) {
        String userId = (String) prozessVariablen.get("userId");
        LocalDate selectedDate = LocalDate.parse((String) prozessVariablen.get("selectedDate"), DateTimeFormatter.ISO_LOCAL_DATE);
        AppUser user = AppUser.findById(userId);
        
        if (prozessVariablen.containsKey("zenMoveContentIds")) {
            saveContentForTile(user, selectedDate, "ZEN_MOVE", (List<UUID>) prozessVariablen.get("zenMoveContentIds"));
        }
        if (prozessVariablen.containsKey("nourishCycleContentIds")) {
            saveContentForTile(user, selectedDate, "NOURISH_CYCLE", (List<UUID>) prozessVariablen.get("nourishCycleContentIds"));
        }
        if (prozessVariablen.containsKey("microHabitIds")) {
            List<UUID> ids = (List<UUID>) prozessVariablen.get("microHabitIds");
            int i = 0;
            if ((boolean) prozessVariablen.getOrDefault("showMorningFlow", false)) i = saveMicroHabitsForTile(user, selectedDate, "MORNING_FLOW", ids, i, 3);
            if ((boolean) prozessVariablen.getOrDefault("showEveningFlow", false)) i = saveMicroHabitsForTile(user, selectedDate, "EVENING_FLOW", ids, i, 3);
            if ((boolean) prozessVariablen.getOrDefault("showRestCycle", false)) saveMicroHabitsForTile(user, selectedDate, "REST_CYCLE", ids, i, 3);
        }
    }

    private int saveMicroHabitsForTile(AppUser user, LocalDate date, String tileKey, List<UUID> allIds, int startIndex, int count) {
        List<UUID> tileSpecificIds = new ArrayList<>();
        for (int i = 0; i < count && (startIndex + i) < allIds.size(); i++) {
            tileSpecificIds.add(allIds.get(startIndex + i));
        }
        if (!tileSpecificIds.isEmpty()) {
            saveContentForTile(user, date, tileKey, tileSpecificIds);
        }
        return startIndex + tileSpecificIds.size();
    }

    private void saveContentForTile(AppUser user, LocalDate date, String tileKey, List<UUID> contentIds) {
        if (contentIds == null || contentIds.isEmpty()) return;
        
        LookupRoutineTile tile = LookupRoutineTile.find("tileKey", tileKey).firstResult();
        for (UUID contentId : contentIds) {
            ContentItem item = ContentItem.findById(contentId);
            if (item != null) {
                MyAyurlyContent content = new MyAyurlyContent();
                content.user = user;
                content.calendarDate = date;
                content.routineTile = tile;
                content.contentItem = item;
                content.persist();
            }
        }

        MyAyurlyHistory history = new MyAyurlyHistory();
        history.user = user;
        history.calendarDate = date;
        history.routineTile = tile;
        history.doshaType = user.doshaType;
        history.totalTasks = contentIds.size();
        history.completedTasks = 0;
        history.progressPercentage = BigDecimal.ZERO;
        history.persist();
    }
    
     @Transactional
    public void deleteTileContent(String userId, String dateStr, String tileKey) {
        LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        LookupRoutineTile tile = LookupRoutineTile.find("tileKey", tileKey).firstResult();
        
        LOG.infof("Lösche History für User %s, Datum %s, Kachel %s", userId, date, tileKey);
        MyAyurlyHistory.delete("user.id = ?1 and calendarDate = ?2 and routineTile = ?3", userId, date, tile);

        LOG.infof("Lösche Content für User %s, Datum %s, Kachel %s", userId, date, tileKey);
        MyAyurlyContent.delete("user.id = ?1 and calendarDate = ?2 and routineTile = ?3", userId, date, tile);
    }

    @Transactional
    public Map<String, Object> generateSingleTileContent(String userId, String tileKey) {
        AppUser user = AppUser.findById(userId);
        String doshaType = user.doshaType != null ? user.doshaType : "Tridoshic";
        List<UUID> newContentIds = new ArrayList<>();

        switch (tileKey) {
            case "MORNING_FLOW":
            case "EVENING_FLOW":
            case "REST_CYCLE":
                newContentIds.addAll(findRandomContentIds(tileKey, doshaType, 3));
                break;
            case "ZEN_MOVE":
                findRandomContentIds(YogaExerciseContent.class, doshaType, 1).stream().findFirst().ifPresent(newContentIds::add);
                newContentIds.addAll(findRandomContentIds(tileKey, doshaType, 3));
                break;
            case "NOURISH_CYCLE":
                findRandomContentIds(RecipeContent.class, doshaType, 1).stream().findFirst().ifPresent(newContentIds::add);
                newContentIds.addAll(findRandomContentIds(tileKey, doshaType, 3));
                break;
            default:
                LOG.warnf("Unbekannter tileKey für Reshuffle: %s", tileKey);
                return Collections.emptyMap();
        }
        
        return Map.of("contentIds", newContentIds);
    }

    @Transactional
    public void saveSingleTileContent(String userId, String dateStr, String tileKey, List<UUID> contentIds) {
        LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        AppUser user = AppUser.findById(userId);
        saveContentForTile(user, date, tileKey, contentIds);
    }
}