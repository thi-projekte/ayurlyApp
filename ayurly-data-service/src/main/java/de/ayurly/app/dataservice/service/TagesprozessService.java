package de.ayurly.app.dataservice.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList; 
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import de.ayurly.app.dataservice.entity.AppUser;
import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.MicrohabitContent;
import de.ayurly.app.dataservice.entity.content.recipe.RecipeContent;
import de.ayurly.app.dataservice.entity.content.yoga.YogaExerciseContent;
import de.ayurly.app.dataservice.entity.lookup.LookupRoutineTile;
import de.ayurly.app.dataservice.entity.user.MyAyurlyContent;
import de.ayurly.app.dataservice.entity.user.MyAyurlyHistory;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class TagesprozessService {

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

        String doshaQueryPattern = "'%\"" + doshaType + "\"%'";
        String tridoshicQueryPattern = "'%\"tridoshic\"%'";

        if ((boolean) prozessVariablen.getOrDefault("showZenMove", true)) {
            YogaExerciseContent.find("FROM YogaExerciseContent y WHERE doshaTypes::text LIKE " + doshaQueryPattern + " OR doshaTypes::text LIKE " + tridoshicQueryPattern + " ORDER BY RANDOM()").page(0, 1).firstResultOptional()
                .ifPresent(yoga -> generierterContent.put("yogaId",((YogaExerciseContent) yoga).id));
        }

        if ((boolean) prozessVariablen.getOrDefault("showNourishCycle", true)) {
            RecipeContent.find("FROM RecipeContent r WHERE doshaTypes::text LIKE " + doshaQueryPattern + " OR doshaTypes::text LIKE " + tridoshicQueryPattern + " ORDER BY RANDOM()").page(0, 1).firstResultOptional()
                .ifPresent(recipe -> generierterContent.put("recipeId", ((RecipeContent)recipe).id));
        }
        
        List<UUID> allMicroHabitIds = new ArrayList<>();
        if ((boolean) prozessVariablen.getOrDefault("showMorningFlow", true)) {
            allMicroHabitIds.addAll(findMicroHabitsForTile("MorningFlow", doshaType, 3));
        }
        if ((boolean) prozessVariablen.getOrDefault("showEveningFlow", true)) {
            allMicroHabitIds.addAll(findMicroHabitsForTile("EveningFlow", doshaType, 3));
        }
        if ((boolean) prozessVariablen.getOrDefault("showRestCycle", true)) {
            allMicroHabitIds.addAll(findMicroHabitsForTile("RestCycle", doshaType, 3));
        }

        if (!allMicroHabitIds.isEmpty()) {
            generierterContent.put("microHabitIds", allMicroHabitIds);
        }
        
        return generierterContent;
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
    
    private List<UUID> findMicroHabitsForTile(String tileKey, String doshaType, int limit) {
        String doshaQueryPattern = "'%\"" + doshaType + "\"%'";
        String tridoshicQueryPattern = "'%\"tridoshic\"%'";

        List<MicrohabitContent> results = MicrohabitContent.find(
            "FROM MicrohabitContent m WHERE m.routineTile.tileKey = ?1 AND (m.doshaTypes::text LIKE " + doshaQueryPattern + " OR m.doshaTypes::text LIKE " + tridoshicQueryPattern + ") ORDER BY RANDOM()",
            tileKey
        ).page(0, limit).list();

        List<UUID> idList = new ArrayList<>();
        for (MicrohabitContent mh : results) {
            idList.add(mh.id);
        }
        return idList;
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