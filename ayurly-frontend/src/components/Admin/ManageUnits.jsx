import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import apiRequest from '../../services/apiService';
import styles from '../../pages/AdminPage.module.css';

const API_BASE_URL_UNITS = '/api/lookups/admin/units';

const ManageUnits = () => {
  const { keycloakInstance } = useUser();
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [editingUnit, setEditingUnit] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchUnits = useCallback(async () => {
    if (!keycloakInstance || !keycloakInstance.token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(API_BASE_URL_UNITS, 'GET', null, keycloakInstance.token);
      setUnits(data || []);
    } catch (err) {
      setError(err.message || 'Fehler beim Laden der Einheiten.');
    } finally {
      setIsLoading(false);
    }
  }, [keycloakInstance]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleCreateNew = () => {
    setEditingUnit({ value: '', label: '', isActive: true, sortOrder: 0 }); 
    setIsCreating(true);
    setError(null);
    setSuccessMessage('');
  };

  const handleEdit = (unit) => {
    setEditingUnit({ ...unit });
    setIsCreating(false);
    setError(null);
    setSuccessMessage('');
  };

  const handleDelete = async (id) => {
    if (!keycloakInstance || !keycloakInstance.token) return;
    if (window.confirm('Möchten Sie diese Einheit wirklich löschen?')) {
      setIsLoading(true);
      setError(null);
      try {
        await apiRequest(`${API_BASE_URL_UNITS}/${id}`, 'DELETE', null, keycloakInstance.token);
        setSuccessMessage('Einheit erfolgreich gelöscht.');
        fetchUnits();
      } catch (err) {
        setError(err.message || 'Fehler beim Löschen der Einheit.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!keycloakInstance || !keycloakInstance.token || !editingUnit) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    const method = isCreating ? 'POST' : 'PUT';
    const url = isCreating ? API_BASE_URL_UNITS : `${API_BASE_URL_UNITS}/${editingUnit.id}`;
    const payload = {
        value: editingUnit.value,
        label: editingUnit.label,
        isActive: editingUnit.isActive,
        sortOrder: parseInt(editingUnit.sortOrder, 10) || 0,
    };

    try {
      await apiRequest(url, method, payload, keycloakInstance.token);
      setSuccessMessage(`Einheit erfolgreich ${isCreating ? 'erstellt' : 'aktualisiert'}.`);
      setEditingUnit(null);
      setIsCreating(false);
      fetchUnits();
    } catch (err) {
      setError(err.message || `Fehler beim ${isCreating ? 'Erstellen' : 'Aktualisieren'} der Einheit.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingUnit(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (isLoading && !editingUnit) {
    return <p>Lade Einheiten...</p>;
  }

  return (
    <div>
      <h2>Einheiten verwalten</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      {!editingUnit && (
        <button onClick={handleCreateNew} className={styles.createButton}>Neue Einheit erstellen</button>
      )}

      {editingUnit && (
        <form onSubmit={handleSave} className={styles.adminForm}>
          <h3>{isCreating ? 'Neue Einheit erstellen' : 'Einheit bearbeiten'}</h3>
          <div>
            <label htmlFor="value">Wert (technisch, z.B. "g"):</label>
            <input type="text" id="value" name="value" value={editingUnit.value} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="label">Anzeige-Label (z.B. "Gramm"):</label>
            <input type="text" id="label" name="label" value={editingUnit.label} onChange={handleChange} />
          </div>
           <div>
            <label htmlFor="sortOrder">Sortierreihenfolge:</label>
            <input type="number" id="sortOrder" name="sortOrder" value={editingUnit.sortOrder} onChange={handleChange} />
          </div>
          <div>
            <input type="checkbox" id="isActive" name="isActive" checked={editingUnit.isActive} onChange={handleChange} />
            <label htmlFor="isActive" className={styles.checkboxLabel}>Aktiv</label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton} disabled={isLoading}>
              {isLoading ? 'Speichern...' : 'Speichern'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={() => { setEditingUnit(null); setIsCreating(false); }} disabled={isLoading}>
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {!editingUnit && units.length > 0 && (
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
            {units.map(unit => (
              <tr key={unit.id}>
                <td>{unit.id}</td>
                <td>{unit.value}</td>
                <td>{unit.label}</td>
                <td>{unit.isActive ? 'Ja' : 'Nein'}</td>
                <td>{unit.sortOrder}</td>
                <td className={styles.actionsCell}>
                  <button onClick={() => handleEdit(unit)} className={styles.editButton}>Bearbeiten</button>
                  <button onClick={() => handleDelete(unit.id)} className={styles.deleteButton}>Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!editingUnit && !isLoading && units.length === 0 && (
        <p>Keine Einheiten gefunden.</p>
      )}
    </div>
  );
};

export default ManageUnits;