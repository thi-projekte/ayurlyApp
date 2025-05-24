import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext'; 
import styles from '../../pages/AdminPage.module.css';

const API_BASE_URL = '/api/lookups/admin/dosha-types'; 

const apiRequest = async (url, method = 'GET', body = null, token) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) { // No Content
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};


const ManageDoshaTypes = () => {
  const { keycloakInstance } = useUser();
  const [doshaTypes, setDoshaTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [editingDosha, setEditingDosha] = useState(null); 
  const [isCreating, setIsCreating] = useState(false);

  const fetchDoshaTypes = useCallback(async () => {
    if (!keycloakInstance || !keycloakInstance.token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(API_BASE_URL, 'GET', null, keycloakInstance.token);
      setDoshaTypes(data || []);
    } catch (err) {
      setError(err.message || 'Fehler beim Laden der Dosha-Typen.');
    } finally {
      setIsLoading(false);
    }
  }, [keycloakInstance]);

  useEffect(() => {
    fetchDoshaTypes();
  }, [fetchDoshaTypes]);

  const handleCreateNew = () => {
    setEditingDosha({ value: '', label: '', description: '', isActive: true, sortOrder: 0 });
    setIsCreating(true);
    setError(null);
    setSuccessMessage('');
  };

  const handleEdit = (dosha) => {
    setEditingDosha({ ...dosha });
    setIsCreating(false);
    setError(null);
    setSuccessMessage('');
  };

  const handleDelete = async (id) => {
    if (!keycloakInstance || !keycloakInstance.token) return;
    if (window.confirm('Möchten Sie diesen Dosha-Typ wirklich löschen?')) {
      setIsLoading(true);
      setError(null);
      try {
        await apiRequest(`${API_BASE_URL}/${id}`, 'DELETE', null, keycloakInstance.token);
        setSuccessMessage('Dosha-Typ erfolgreich gelöscht.');
        fetchDoshaTypes(); 
      } catch (err) {
        setError(err.message || 'Fehler beim Löschen des Dosha-Typs.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!keycloakInstance || !keycloakInstance.token || !editingDosha) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    const method = isCreating ? 'POST' : 'PUT';
    const url = isCreating ? API_BASE_URL : `${API_BASE_URL}/${editingDosha.id}`;
    const payload = {
        value: editingDosha.value,
        label: editingDosha.label,
        description: editingDosha.description,
        isActive: editingDosha.isActive,
        sortOrder: parseInt(editingDosha.sortOrder, 10) || 0,
    };

    try {
      await apiRequest(url, method, payload, keycloakInstance.token);
      setSuccessMessage(`Dosha-Typ erfolgreich ${isCreating ? 'erstellt' : 'aktualisiert'}.`);
      setEditingDosha(null);
      setIsCreating(false);
      fetchDoshaTypes();
    } catch (err) {
      setError(err.message || `Fehler beim ${isCreating ? 'Erstellen' : 'Aktualisieren'} des Dosha-Typs.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingDosha(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  if (isLoading && !editingDosha) {
    return <p>Lade Dosha-Typen...</p>;
  }


  return (
    <div>
      <h2>Dosha-Typen verwalten</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      {!editingDosha && (
        <button onClick={handleCreateNew} className={styles.createButton}>Neuen Dosha-Typ erstellen</button>
      )}

      {editingDosha && (
        <form onSubmit={handleSave} className={styles.adminForm}>
          <h3>{isCreating ? 'Neuen Dosha-Typ erstellen' : 'Dosha-Typ bearbeiten'}</h3>
          <div>
            <label htmlFor="value">Wert (technisch, z.B. "Vata"):</label>
            <input type="text" id="value" name="value" value={editingDosha.value} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="label">Anzeige-Label (z.B. "🌀 Vata"):</label>
            <input type="text" id="label" name="label" value={editingDosha.label} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="description">Beschreibung:</label>
            <textarea id="description" name="description" value={editingDosha.description} onChange={handleChange}></textarea>
          </div>
           <div>
            <label htmlFor="sortOrder">Sortierreihenfolge:</label>
            <input type="number" id="sortOrder" name="sortOrder" value={editingDosha.sortOrder} onChange={handleChange} />
          </div>
          <div>
            <input type="checkbox" id="isActive" name="isActive" checked={editingDosha.isActive} onChange={handleChange} />
            <label htmlFor="isActive" className={styles.checkboxLabel}>Aktiv</label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton} disabled={isLoading}>
              {isLoading ? 'Speichern...' : 'Speichern'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={() => { setEditingDosha(null); setIsCreating(false); }} disabled={isLoading}>
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {!editingDosha && doshaTypes.length > 0 && (
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
            {doshaTypes.map(dosha => (
              <tr key={dosha.id}>
                <td>{dosha.id}</td>
                <td>{dosha.value}</td>
                <td>{dosha.label}</td>
                <td>{dosha.isActive ? 'Ja' : 'Nein'}</td>
                <td>{dosha.sortOrder}</td>
                <td className={styles.actionsCell}>
                  <button onClick={() => handleEdit(dosha)} className={styles.editButton}>Bearbeiten</button>
                  <button onClick={() => handleDelete(dosha.id)} className={styles.deleteButton}>Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!editingDosha && !isLoading && doshaTypes.length === 0 && (
        <p>Keine Dosha-Typen gefunden.</p>
      )}
    </div>
  );
};

export default ManageDoshaTypes;