import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import apiRequest from '../../services/apiService';
import styles from '../../pages/AdminPage.module.css';

const API_BASE_URL_MICROHABITS = '/api/microhabits';
const API_BASE_URL_LOOKUPS = '/api/lookups';

const initialMicrohabitFormState = {
    title: '',
    previewDescription: '',
    doshaTypes: [],
    routineTileId: '',
};

const ManageMicrohabits = () => {
    const { keycloakInstance } = useUser();
    const [microhabits, setMicrohabits] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [editingMicrohabit, setEditingMicrohabit] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState(initialMicrohabitFormState);

    const [doshaTypeOptions, setDoshaTypeOptions] = useState([]);
    const [routineTileOptions, setRoutineTileOptions] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterTile, setFilterTile] = useState('all');
    const [filterDosha, setFilterDosha] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });


    const fetchMicrohabits = useCallback(async () => {
        if (!keycloakInstance || !keycloakInstance.token) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiRequest(API_BASE_URL_MICROHABITS, 'GET', null, keycloakInstance.token);
            setMicrohabits(data || []);
        } catch (err) {
            setError(err.message || 'Fehler beim Laden der Microhabits.');
            setMicrohabits([]);
        } finally {
            setIsLoading(false);
        }
    }, [keycloakInstance]);

    const fetchLookups = useCallback(async () => {
        if (!keycloakInstance || !keycloakInstance.token) return;
        try {
            const [doshas, routines] = await Promise.all([
                apiRequest(`${API_BASE_URL_LOOKUPS}/dosha-types`, 'GET', null, keycloakInstance.token),
                apiRequest(`${API_BASE_URL_LOOKUPS}/routine-tiles`, 'GET', null, keycloakInstance.token)
            ]);
            setDoshaTypeOptions(doshas || []);
            setRoutineTileOptions(routines || []);
        } catch (err) {
            setError(err.message || 'Fehler beim Laden der Auswahl-Optionen.');
        }
    }, [keycloakInstance]);

    useEffect(() => {
        fetchMicrohabits();
        fetchLookups();
    }, [fetchMicrohabits, fetchLookups]);

    const handleCreateNew = () => {
        setEditingMicrohabit(null);
        setFormData(initialMicrohabitFormState);
        setIsCreating(true);
        setError(null);
        setSuccessMessage('');
    };

    const handleEdit = (microhabit) => {
        setFormData({
            title: microhabit.title || '',
            previewDescription: microhabit.previewDescription || '',
            doshaTypes: microhabit.doshaTypes || [],
            routineTileId: microhabit.routineTile?.id || '',
        });
        setEditingMicrohabit(microhabit);
        setIsCreating(false);
        setError(null);
        setSuccessMessage('');
    };

    const handleDelete = async (id) => {
        if (!keycloakInstance || !keycloakInstance.token) return;
        if (window.confirm('Möchten Sie dieses Microhabit wirklich löschen?')) {
            setIsLoading(true);
            setError(null);
            try {
                await apiRequest(`${API_BASE_URL_MICROHABITS}/${id}`, 'DELETE', null, keycloakInstance.token);
                setSuccessMessage('Microhabit erfolgreich gelöscht.');
                fetchMicrohabits();
                if (editingMicrohabit && editingMicrohabit.id === id) {
                    cancelEdit();
                }
            } catch (err) {
                setError(err.message || 'Fehler beim Löschen des Microhabits.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "doshaTypes") {
            const newDoshaTypes = checked
                ? [...formData.doshaTypes, value]
                : formData.doshaTypes.filter(dt => dt !== value);
            setFormData(prev => ({ ...prev, doshaTypes: newDoshaTypes }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!keycloakInstance || !keycloakInstance.token) return;

        if (!formData.routineTileId) {
            setError('Bitte wählen Sie eine zugehörige Routine-Kachel aus.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage('');

        const payload = { ...formData, routineTileId: parseInt(formData.routineTileId, 10) };
        const method = isCreating ? 'POST' : 'PUT';
        const url = isCreating ? API_BASE_URL_MICROHABITS : `${API_BASE_URL_MICROHABITS}/${editingMicrohabit.id}`;

        try {
            await apiRequest(url, method, payload, keycloakInstance.token);
            setSuccessMessage(`Microhabit erfolgreich ${isCreating ? 'erstellt' : 'aktualisiert'}.`);
            cancelEdit(); 
            fetchMicrohabits(); 
        } catch (err) {
            setError(err.message || `Fehler beim ${isCreating ? 'Erstellen' : 'Aktualisieren'} des Microhabits.`);
        } finally {
            setIsLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditingMicrohabit(null);
        setIsCreating(false);
        setFormData(initialMicrohabitFormState);
        setError(null);
    };

    const filteredMicrohabits = useMemo(() => {
        let filtered = [...microhabits];

        // 1. Filterung
        if (filterTile !== 'all') {
            filtered = filtered.filter(habit => habit.routineTile?.id.toString() === filterTile);
        }
        if (filterDosha !== 'all') {
            filtered = filtered.filter(habit => habit.doshaTypes?.includes(filterDosha));
        }

        // 2. Suche
        if (searchTerm) {
            filtered = filtered.filter(habit =>
                habit.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 3. Sortierung
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'routineTile.name') {
                    aValue = a.routineTile?.name || '';
                    bValue = b.routineTile?.name || '';
                }

                if (sortConfig.key === 'doshaTypes') {
                    aValue = a.doshaTypes?.[0] || '';
                    bValue = b.doshaTypes?.[0] || '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [microhabits, searchTerm, filterTile, filterDosha, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    if (isLoading && !editingMicrohabit && !isCreating) {
        return <p>Lade Microhabits...</p>;
    }

    return (
        <div>
            <h2>Microhabits verwalten</h2>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

            {(!editingMicrohabit && !isCreating) && (
                <button onClick={handleCreateNew} className={styles.createButton}>Neues Microhabit erstellen</button>
            )}

            {(editingMicrohabit || isCreating) && (
                <form onSubmit={handleSubmit} className={styles.adminForm}>
                    <h3>{isCreating ? 'Neues Microhabit erstellen' : `Microhabit bearbeiten: ${editingMicrohabit?.title || ''}`}</h3>

                    <div>
                        <label htmlFor="title">Titel:</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleFormChange} required />
                    </div>

                    <div>
                        <label htmlFor="previewDescription">Beschreibung (für Modal-Ansicht):</label>
                        <textarea id="previewDescription" name="previewDescription" value={formData.previewDescription} onChange={handleFormChange}></textarea>
                    </div>

                    <div>
                        <label htmlFor="routineTileId">Zugehörige Routine-Kachel:</label>
                        <select id="routineTileId" name="routineTileId" value={formData.routineTileId} onChange={handleFormChange} required>
                            <option value="">--- Bitte wählen ---</option>
                            {routineTileOptions.map(tile => (
                                <option key={tile.id} value={tile.id}>{tile.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Dosha Typen:</label>
                        {doshaTypeOptions.map(dosha => (
                            <label key={dosha.value} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="doshaTypes"
                                    value={dosha.value}
                                    checked={formData.doshaTypes.includes(dosha.value)}
                                    onChange={handleFormChange}
                                /> {dosha.label}
                            </label>
                        ))}
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.saveButton} disabled={isLoading}>
                            {isLoading ? 'Speichern...' : 'Microhabit Speichern'}
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isLoading}>
                            Abbrechen
                        </button>
                    </div>
                </form>
            )}

            {(!editingMicrohabit && !isCreating && microhabits.length > 0) && (
                <>
                    <div className={styles.tableControls}>
                        <input
                            type="text"
                            placeholder="Suche nach Titel..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select value={filterTile} onChange={(e) => setFilterTile(e.target.value)}>
                            <option value="all">Alle Routine-Kacheln</option>
                            {routineTileOptions.map(tile => (
                                <option key={tile.id} value={tile.id}>{tile.name}</option>
                            ))}
                        </select>
                        <select value={filterDosha} onChange={(e) => setFilterDosha(e.target.value)}>
                            <option value="all">Alle Dosha-Typen</option>
                            {doshaTypeOptions.map(dosha => (
                                <option key={dosha.value} value={dosha.value}>{dosha.label}</option>
                            ))}
                        </select>
                        <p>Treffer: {filteredMicrohabits.length}</p>
                    </div>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th className={styles.sortableHeader} onClick={() => requestSort('title')}>
                                    Titel {getSortIndicator('title', sortConfig)}
                                </th>
                                <th className={styles.sortableHeader} onClick={() => requestSort('routineTile.name')}>
                                    Routine-Kachel {getSortIndicator('routineTile.name', sortConfig)}
                                </th>
                                <th className={styles.sortableHeader} onClick={() => requestSort('doshaTypes')}>
                                    Dosha-Typen {getSortIndicator('doshaTypes', sortConfig)}
                                </th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMicrohabits.map(habit => (
                                <tr key={habit.id}>
                                    <td>{habit.title}</td>
                                    <td>{habit.routineTile?.name || '-'}</td>
                                    <td>{habit.doshaTypes?.join(', ') || 'ALL'}</td>
                                    <td className={styles.actionsCell}>
                                        <button onClick={() => handleEdit(habit)} className={styles.editButton}>Bearbeiten</button>
                                        <button onClick={() => handleDelete(habit.id)} className={styles.deleteButton}>Löschen</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {(!editingMicrohabit && !isCreating && !isLoading && microhabits.length === 0) && (
                <p>Keine Microhabits gefunden. Erstellen Sie das erste!</p>
            )}
        </div>
    );
};

const getSortIndicator = (key, sortConfig) => {
    if (sortConfig.key !== key) return '↕';
    if (sortConfig.direction === 'ascending') return '↑';
    return '↓';
};

export default ManageMicrohabits;