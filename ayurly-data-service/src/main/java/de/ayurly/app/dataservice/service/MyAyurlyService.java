package de.ayurly.app.dataservice.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.jboss.logging.Logger;

import de.ayurly.app.dataservice.entity.AppUser;
import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.MicrohabitContent;
import de.ayurly.app.dataservice.entity.content.recipe.RecipeContent;
import de.ayurly.app.dataservice.entity.content.yoga.YogaExerciseContent;
import de.ayurly.app.dataservice.entity.lookup.LookupRoutineTile;
import de.ayurly.app.dataservice.entity.user.MyAyurlyContent;
import de.ayurly.app.dataservice.entity.user.MyAyurlyHistory;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;

@ApplicationScoped
public class MyAyurlyService {

    private static final Logger LOG = Logger.getLogger(MyAyurlyService.class);

    @Inject
    EntityManager entityManager;

    @Transactional
    public List<MyAyurlyContent> generateContentForDay(AppUser user, LocalDate date) {
        LOG.infof("Generating content for user %s on date %s", user.id, date);
        
        Map<String, LookupRoutineTile> tiles = LookupRoutineTile.<LookupRoutineTile>streamAll()
                .collect(Collectors.toMap(tile -> tile.tileKey, tile -> tile));

        if (user.showNourishCycle) generateContentForTile(user, date, tiles.get("NOURISH_CYCLE"), RecipeContent.class, 1);
        if (user.showZenMove) generateContentForTile(user, date, tiles.get("ZEN_MOVE"), YogaExerciseContent.class, 1);
        if (user.showMorningFlow) generateContentForTile(user, date, tiles.get("MORNING_FLOW"), MicrohabitContent.class, 3);
        if (user.showEveningFlow) generateContentForTile(user, date, tiles.get("EVENING_FLOW"), MicrohabitContent.class, 3);
        if (user.showRestCycle) generateContentForTile(user, date, tiles.get("REST_CYCLE"), MicrohabitContent.class, 3);
        
        return MyAyurlyContent.list("user = ?1 and calendarDate = ?2", user, date);
    }

    @Transactional
    public void generateContentForTile(AppUser user, LocalDate date, LookupRoutineTile tile, Class<? extends ContentItem> contentType, int count) {
        LOG.infof("Generating %d %s for tile %s", count, contentType.getSimpleName(), tile.tileKey);

        String doshaType = user.doshaType;
        // native Query um random funktion zu nutzen und Übersetzer HQL-SQL nicht will...
        String nativeQuery = "SELECT content_id FROM " + getTableNameForContentType(contentType) + " WHERE :dosha = ANY(dosha_types) OR 'Tridoshic' = ANY(dosha_types) ORDER BY RANDOM() LIMIT :limit";
           
        
        List<UUID> contentIds = entityManager.createNativeQuery(nativeQuery, UUID.class)
                .setParameter("dosha", doshaType)
                .setParameter("limit", count)
                .getResultList();
        
        if (contentIds.isEmpty()) {
            LOG.warnf("No content of type %s found for dosha %s. Cannot generate content for tile %s.", contentType.getSimpleName(), doshaType, tile.tileKey);
            return;
        }
        // HQL-Abfrage mit IDs
        List<ContentItem> items = ContentItem.list("id IN ?1", contentIds);


        if (items.isEmpty()) {
            LOG.warnf("No content of type %s found for dosha %s. Cannot generate content for tile %s.", contentType.getSimpleName(), doshaType, tile.tileKey);
            return;
        }

        for (ContentItem item : items) {
            MyAyurlyContent newContent = new MyAyurlyContent();
            newContent.user = user;
            newContent.calendarDate = date;
            newContent.routineTile = tile;
            newContent.contentItem = item;
            newContent.persist();
        }
    }

    private String getTableNameForContentType(Class<? extends ContentItem> contentType) {
        if (contentType.equals(RecipeContent.class)) {
            return "recipe_details";
        }
        if (contentType.equals(YogaExerciseContent.class)) {
            return "yoga_exercise_details";
        }
        if (contentType.equals(MicrohabitContent.class)) {
            return "microhabit_details";
        }
        throw new IllegalArgumentException("Unsupported content type for dashboard generation: " + contentType.getName());
     }

    @Transactional
    public MyAyurlyContent toggleDoneStatus(AppUser user, Long myAyurlyContentId) {
        Optional<MyAyurlyContent> contentOpt = MyAyurlyContent.findByIdOptional(myAyurlyContentId);
        if (contentOpt.isEmpty() || !contentOpt.get().user.id.equals(user.id)) {
            throw new WebApplicationException("Content not found or access denied", 404);
        }

        MyAyurlyContent content = contentOpt.get();
        
        // Inhalt aus der Zukunft darf nicht abgehakt werden
        if (content.calendarDate.isAfter(LocalDate.now(ZoneId.of("Europe/Berlin")))) {
            throw new WebApplicationException("Cannot complete tasks for a future date", 400);
        }
        
        content.isDone = !content.isDone;
        content.persist();
        
        updateHistory(user, content.calendarDate, content.routineTile);
        
        return content;
    }

    @Transactional
    public void updateHistory(AppUser user, LocalDate date, LookupRoutineTile tile) {
        List<MyAyurlyContent> allTasksForTile = MyAyurlyContent.list("user = ?1 and calendarDate = ?2 and routineTile = ?3", user, date, tile);
        
        int totalTasks = allTasksForTile.size();
        if (totalTasks == 0) return;
        
        long completedTasks = allTasksForTile.stream().filter(c -> c.isDone).count();
        BigDecimal progress = BigDecimal.valueOf(completedTasks * 100.0 / totalTasks).setScale(2, RoundingMode.HALF_UP);

        MyAyurlyHistory history = MyAyurlyHistory.find("user = ?1 and calendarDate = ?2 and routineTile = ?3 and doshaType = ?4",
                user, date, tile, user.doshaType).firstResult();
        
        if (history == null) {
            history = new MyAyurlyHistory();
            history.user = user;
            history.calendarDate = date;
            history.routineTile = tile;
            history.doshaType = user.doshaType;
        }
        
        history.totalTasks = totalTasks;
        history.completedTasks = (int) completedTasks;
        history.progressPercentage = progress;
        history.persist();
        LOG.infof("History updated for user %s, date %s, tile %s. Progress: %s%%", user.id, date, tile.tileKey, progress);
    }
}