import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import apiRequest from '../../services/apiService'; // Importiere den zentralen API-Service
import styles from '../../pages/AdminPage.module.css';

const API_BASE_URL_CONTENT_TYPES = '/api/lookups/admin/content-types';

const ManageContentTypes = () => {
  const { keycloakInstance } = useUser();
  const [contentTypes, setContentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [editingContentType, setEditingContentType] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchContentTypes = useCallback(async () => {
    if (!keycloakInstance || !keycloakInstance.token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(API_BASE_URL_CONTENT_TYPES, 'GET', null, keycloakInstance.token);
      setContentTypes(data || []);
    } catch (err) {
      setError(err.message || 'Fehler beim Laden der Content-Typen.');
    } finally {
      setIsLoading(false);
    }
  }, [keycloakInstance]);

  useEffect(() => {
    fetchContentTypes();
  }, [fetchContentTypes]);

  const handleCreateNew = () => {
    setEditingContentType({ value: '', label: '', description: '', isActive: true, sortOrder: 0 });
    setIsCreating(true);
    setError(null);
    setSuccessMessage('');
  };

  const handleEdit = (contentType) => {
    setEditingContentType({ ...contentType });
    setIsCreating(false);
    setError(null);
    setSuccessMessage('');
  };

  const handleDelete = async (id) => {
    if (!keycloakInstance || !keycloakInstance.token) return;
    if (window.confirm('Möchten Sie diesen Content-Typ wirklich löschen? Beachten Sie, dass dies Auswirkungen auf bestehende Inhalte haben kann!')) {
      setIsLoading(true);
      setError(null);
      try {
        await apiRequest(`${API_BASE_URL_CONTENT_TYPES}/${id}`, 'DELETE', null, keycloakInstance.token);
        setSuccessMessage('Content-Typ erfolgreich gelöscht.');
        fetchContentTypes();
      } catch (err) {
        setError(err.message || 'Fehler beim Löschen des Content-Typs.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!keycloakInstance || !keycloakInstance.token || !editingContentType) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    const method = isCreating ? 'POST' : 'PUT';
    const url = isCreating ? API_BASE_URL_CONTENT_TYPES : `${API_BASE_URL_CONTENT_TYPES}/${editingContentType.id}`;
    const payload = {
        value: editingContentType.value,
        label: editingContentType.label,
        description: editingContentType.description,
        isActive: editingContentType.isActive,
        sortOrder: parseInt(editingContentType.sortOrder, 10) || 0,
    };

    try {
      await apiRequest(url, method, payload, keycloakInstance.token);
      setSuccessMessage(`Content-Typ erfolgreich ${isCreating ? 'erstellt' : 'aktualisiert'}.`);
      setEditingContentType(null);
      setIsCreating(false);
      fetchContentTypes();
    } catch (err) {
      setError(err.message || `Fehler beim ${isCreating ? 'Erstellen' : 'Aktualisieren'} des Content-Typs.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingContentType(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (isLoading && !editingContentType) {
    return <p>Lade Content-Typen...</p>;
  }

  return (
    <div>
      <h2>Content-Typen verwalten</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      {!editingContentType && (
        <button onClick={handleCreateNew} className={styles.createButton}>Neuen Content-Typ erstellen</button>
      )}

      {editingContentType && (
        <form onSubmit={handleSave} className={styles.adminForm}>
          <h3>{isCreating ? 'Neuen Content-Typ erstellen' : 'Content-Typ bearbeiten'}</h3>
          <div>
            <label htmlFor="value">Wert (technisch, z.B. "RECIPE"):</label>
            <input type="text" id="value" name="value" value={editingContentType.value} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="label">Anzeige-Label (z.B. "Rezept"):</label>
            <input type="text" id="label" name="label" value={editingContentType.label} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="description">Beschreibung:</label>
            <textarea id="description" name="description" value={editingContentType.description || ''} onChange={handleChange}></textarea>
          </div>
           <div>
            <label htmlFor="sortOrder">Sortierreihenfolge:</label>
            <input type="number" id="sortOrder" name="sortOrder" value={editingContentType.sortOrder} onChange={handleChange} />
          </div>
          <div>
            <input type="checkbox" id="isActive" name="isActive" checked={editingContentType.isActive} onChange={handleChange} />
            <label htmlFor="isActive" className={styles.checkboxLabel}>Aktiv</label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton} disabled={isLoading}>
              {isLoading ? 'Speichern...' : 'Speichern'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={() => { setEditingContentType(null); setIsCreating(false); }} disabled={isLoading}>
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {!editingContentType && contentTypes.length > 0 && (
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Wert</th>
              <th>Label</th>
              <th>Aktiv</th>
              <th>Sortierung</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {contentTypes.map(contentType => (
              <tr key={contentType.id}>
                <td>{contentType.id}</td>
                <td>{contentType.value}</td>
                <td>{contentType.label}</td>
                <td>{contentType.isActive ? 'Ja' : 'Nein'}</td>
                <td>{contentType.sortOrder}</td>
                <td className={styles.actionsCell}>
                  <button onClick={() => handleEdit(contentType)} className={styles.editButton}>Bearbeiten</button>
                  <button onClick={() => handleDelete(contentType.id)} className={styles.deleteButton}>Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!editingContentType && !isLoading && contentTypes.length === 0 && (
        <p>Keine Content-Typen gefunden.</p>
      )}
    </div>
  );
};

export default ManageContentTypes;