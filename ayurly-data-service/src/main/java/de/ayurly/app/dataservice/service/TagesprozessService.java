package de.ayurly.app.dataservice.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList; 
import java.util.HashMap;
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

        Parameters params = Parameters.with("doshaParam", "%" + doshaType + "%").and("tridoshicParam", "%tridoshic%");

        if ((boolean) prozessVariablen.getOrDefault("showZenMove", true)) {
            findRandomContentIds(YogaExerciseContent.class, doshaType, 1).stream().findFirst()
                .ifPresent(yogaId -> generierterContent.put("yogaId", yogaId));
        }

        if ((boolean) prozessVariablen.getOrDefault("showNourishCycle", true)) {
            findRandomContentIds(RecipeContent.class, doshaType, 1).stream().findFirst()
                .ifPresent(recipeId -> generierterContent.put("recipeId", recipeId));
        }
        
        List<UUID> allMicroHabitIds = new ArrayList<>();
        if ((boolean) prozessVariablen.getOrDefault("showMorningFlow", true)) {
            allMicroHabitIds.addAll(findRandomContentIds("MorningFlow", doshaType, 3));
        }
        if ((boolean) prozessVariablen.getOrDefault("showEveningFlow", true)) {
            allMicroHabitIds.addAll(findRandomContentIds("EveningFlow", doshaType, 3));
        }
        if ((boolean) prozessVariablen.getOrDefault("showRestCycle", true)) {
            allMicroHabitIds.addAll(findRandomContentIds("RestCycle", doshaType, 3));
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
        return entityManager.createNativeQuery(nativeQuery, UUID.class)
                .setParameter("dosha", doshaType)
                .setParameter("limit", limit)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    private List<UUID> findRandomContentIds(String tileKey, String doshaType, int limit) {
        String nativeQuery = "SELECT md.content_id FROM microhabit_details md INNER JOIN lookup_routine_tiles lrt ON md.routine_tile_id = lrt.id WHERE lrt.tile_key = :tileKey " + 
                              "AND (:dosha = ANY(md.dosha_types) OR 'tridoshic' = ANY(md.dosha_types)) ORDER BY RANDOM() LIMIT :limit";

        return entityManager.createNativeQuery(nativeQuery, UUID.class)
                .setParameter("tileKey", tileKey)
                .setParameter("dosha", doshaType)
                .setParameter("limit", limit)
                .getResultList();
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
        
        if (prozessVariablen.containsKey("yogaId")) {
            saveContentAndHistory(user, selectedDate, "ZenMove", (UUID)prozessVariablen.get("yogaId"), 1);
        }
        if (prozessVariablen.containsKey("recipeId")) {
            saveContentAndHistory(user, selectedDate, "NourishCycle", (UUID)prozessVariablen.get("recipeId"), 1);
        }
        if (prozessVariablen.containsKey("microHabitIds")) {
            List<UUID> ids = (List<UUID>) prozessVariablen.get("microHabitIds");
            int i = 0;
            if ((boolean) prozessVariablen.getOrDefault("showMorningFlow", false)) i = saveMicroHabitsForTile(user, selectedDate, "MorningFlow", ids, i, 3);
            if ((boolean) prozessVariablen.getOrDefault("showEveningFlow", false)) i = saveMicroHabitsForTile(user, selectedDate, "EveningFlow", ids, i, 3);
            if ((boolean) prozessVariablen.getOrDefault("showRestCycle", false)) saveMicroHabitsForTile(user, selectedDate, "RestCycle", ids, i, 3);
        }
    }

    private int saveMicroHabitsForTile(AppUser user, LocalDate date, String tileKey, List<UUID> allIds, int startIndex, int count) {
        LookupRoutineTile tile = LookupRoutineTile.find("tileKey", tileKey).firstResult();
        int addedCount = 0;
        for (int i = 0; i < count && (startIndex + i) < allIds.size(); i++) {
            ContentItem item = ContentItem.findById(allIds.get(startIndex + i));
            MyAyurlyContent content = new MyAyurlyContent();
            content.user = user;
            content.calendarDate = date;
            content.routineTile = tile;
            content.contentItem = item;
            content.persist();
            addedCount++;
        }
        if (addedCount > 0) {
            MyAyurlyHistory history = new MyAyurlyHistory();
            history.user = user;
            history.calendarDate = date;
            history.routineTile = tile;
            history.doshaType = user.doshaType;
            history.totalTasks = addedCount;
            history.completedTasks = 0;
            history.progressPercentage = BigDecimal.ZERO;
            history.persist();
        }
        return startIndex + addedCount;
    }
    
    private void saveContentAndHistory(AppUser user, LocalDate date, String tileKey, UUID contentId, int totalTasks) {
        LookupRoutineTile tile = LookupRoutineTile.find("tileKey", tileKey).firstResult();
        ContentItem item = ContentItem.findById(contentId);
        
        MyAyurlyContent content = new MyAyurlyContent();
        content.user = user;
        content.calendarDate = date;
        content.routineTile = tile;
        content.contentItem = item;
        content.persist();

        MyAyurlyHistory history = new MyAyurlyHistory();
        history.user = user;
        history.calendarDate = date;
        history.routineTile = tile;
        history.doshaType = user.doshaType;
        history.totalTasks = totalTasks;
        history.completedTasks = 0;
        history.progressPercentage = BigDecimal.ZERO;
        history.persist();
    }
}