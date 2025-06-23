package de.ayurly.app.dataservice.service;

import java.util.UUID;

import org.jboss.logging.Logger;

import de.ayurly.app.dataservice.entity.content.ContentItem;
import de.ayurly.app.dataservice.entity.content.ContentLike;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class MicrohabitService {

    private static final Logger LOG = Logger.getLogger(MicrohabitService.class);

    @Transactional
    public ContentItem likeMicrohabit(UUID microhabitId, String userId) {
        ContentItem item = ContentItem.findById(microhabitId);
        if (item == null) {
            throw new NotFoundException("Microhabit nicht gefunden.");
        }

        long existingLike = ContentLike.count("contentItem.id = ?1 and userId = ?2", microhabitId, userId);
        if (existingLike == 0) {
            ContentLike newLike = new ContentLike();
            newLike.contentItem = item;
            newLike.userId = userId;
            newLike.persist();

            item.likeCount++;
            item.persist();
            LOG.infof("User %s liked Microhabit %s", userId, microhabitId);
        }
        return item;
    }

    @Transactional
    public ContentItem unlikeMicrohabit(UUID microhabitId, String userId) {
        ContentItem item = ContentItem.findById(microhabitId);
        if (item == null) {
            throw new NotFoundException("Microhabit nicht gefunden.");
        }

        long deletedCount = ContentLike.delete("contentItem.id = ?1 and userId = ?2", microhabitId, userId);
        if (deletedCount > 0) {
            if (item.likeCount > 0) {
                item.likeCount--;
            }
            item.persist();
            LOG.infof("User %s unliked Microhabit %s", userId, microhabitId);
        }
        return item;
    }
}