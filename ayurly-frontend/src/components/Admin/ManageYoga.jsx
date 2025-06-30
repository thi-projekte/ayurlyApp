import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import apiRequest from '../../services/apiService';
import yogaExerciseService from '../../services/yogaExerciseService';
import styles from '../../pages/AdminPage.module.css';

const API_BASE_URL_LOOKUPS = '/api/lookups';
const API_BASE_URL_UPLOADS = '/api/admin/uploads';

const initialYogaFormState = {
    title: '',
    imageUrl: '', 
    previewDescription: '',
    videoUrl: '', 
    description: '',
    doshaTypes: [],
    effects: [{ text: '' }],
    tips: [{ text: '' }],
    steps: [{ title: '', description: '', subSteps: [{ description: '' }] }],
};

const ManageYoga = () => {
    const { keycloakInstance } = useUser();
    const [exercises, setExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [editingExercise, setEditingExercise] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState(initialYogaFormState);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedVideoFile, setSelectedVideoFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [doshaTypeOptions, setDoshaTypeOptions] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDosha, setFilterDosha] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });


    const fetchExercises = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await yogaExerciseService.getAllYogaExercises();
            setExercises(data || []);
        } catch (err) {
            setError('Fehler beim Laden der Yoga-Übungen.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchLookups = useCallback(async () => {
        if (!keycloakInstance) return;
        const doshas = await apiRequest(`${API_BASE_URL_LOOKUPS}/dosha-types`, 'GET', null, keycloakInstance.token);
        setDoshaTypeOptions(doshas || []);
    }, [keycloakInstance]);

    useEffect(() => {
        fetchExercises();
        fetchLookups();
    }, [fetchExercises, fetchLookups]);

    const resetFormAndState = () => {
        setEditingExercise(null);
        setIsCreating(false);
        setFormData(initialYogaFormState);
        setSelectedFile(null);
        setSelectedVideoFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCreateNew = () => {
        resetFormAndState();
        setIsCreating(true);
    };

    const handleEdit = async (exerciseId) => {
        setIsLoading(true);
        resetFormAndState();
        try {
            const exerciseToEdit = await yogaExerciseService.getYogaExerciseById(exerciseId);
            if (exerciseToEdit) {
                setFormData({
                    title: exerciseToEdit.title || '',
                    imageUrl: exerciseToEdit.imageUrl || '',
                    previewDescription: exerciseToEdit.previewDescription || '',
                    videoUrl: exerciseToEdit.videoUrl || '',
                    description: exerciseToEdit.description || '',
                    doshaTypes: exerciseToEdit.doshaTypes || [],
                    effects: exerciseToEdit.effects?.length ? exerciseToEdit.effects.map(e => ({ text: e })) : [{ text: '' }],
                    tips: exerciseToEdit.tips?.length ? exerciseToEdit.tips.map(t => ({ text: t })) : [{ text: '' }],
                    steps: exerciseToEdit.steps?.length ? exerciseToEdit.steps.map(s => ({ ...s, subSteps: s.subSteps?.length ? s.subSteps.map(ss => ({ ...ss })) : [{ description: '' }] })) : [{ title: '', description: '', subSteps: [{ description: '' }] }],
                });
                setImagePreview(exerciseToEdit.imageUrl);
                setEditingExercise(exerciseToEdit);
            }
        } catch (err) {
            setError('Fehler beim Laden der Übung.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Diese Yoga-Übung wirklich löschen?')) {
            await yogaExerciseService.deleteYogaExercise(id);
            fetchExercises();
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "doshaTypes") {
            const newDoshas = checked ? [...formData.doshaTypes, value] : formData.doshaTypes.filter(d => d !== value);
            setFormData(prev => ({ ...prev, doshaTypes: newDoshas }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleVideoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedVideoFile(file);
    };

    const handleSimpleListChange = (index, field, value) => {
        const list = [...formData[field]];
        list[index].text = value;
        setFormData(prev => ({ ...prev, [field]: list }));
    };

    const addSimpleListItem = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], { text: '' }] }));
    };

    const removeSimpleListItem = (index, field) => {
        setFormData(prev => ({ ...prev, [field]: formData[field].filter((_, i) => i !== index) }));
    };

    const handleStepChange = (index, field, value) => {
        const steps = [...formData.steps];
        steps[index][field] = value;
        setFormData(prev => ({ ...prev, steps }));
    };

    const addStep = () => {
        setFormData(prev => ({ ...prev, steps: [...prev.steps, { title: '', description: '', subSteps: [{ description: '' }] }] }));
    };

    const removeStep = (index) => {
        setFormData(prev => ({ ...prev, steps: formData.steps.filter((_, i) => i !== index) }));
    };

    const handleSubStepChange = (stepIndex, subStepIndex, value) => {
        const steps = [...formData.steps];
        steps[stepIndex].subSteps[subStepIndex].description = value;
        setFormData(prev => ({ ...prev, steps }));
    };

    const addSubStep = (stepIndex) => {
        const steps = [...formData.steps];
        steps[stepIndex].subSteps.push({ description: '' });
        setFormData(prev => ({ ...prev, steps }));
    };

    const removeSubStep = (stepIndex, subStepIndex) => {
        const steps = [...formData.steps];
        steps[stepIndex].subSteps = steps[stepIndex].subSteps.filter((_, i) => i !== subStepIndex);
        setFormData(prev => ({ ...prev, steps }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage('');

        let uploadedImageUrl = formData.imageUrl;
        let uploadedVideoUrl = formData.videoUrl;

        if (selectedFile) {
            const imageFormData = new FormData();
            imageFormData.append('file', selectedFile);
            imageFormData.append('subfolder', 'yoga');
            try {
                const res = await fetch(`${API_BASE_URL_UPLOADS}/image`, { method: 'POST', headers: { 'Authorization': `Bearer ${keycloakInstance.token}` }, body: imageFormData });
                if (!res.ok) throw new Error('Bild-Upload fehlgeschlagen');
                uploadedImageUrl = (await res.json()).filePath;
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
                return;
            }
        }

        if (selectedVideoFile) {
            const videoFormData = new FormData();
            videoFormData.append('file', selectedVideoFile);
            videoFormData.append('subfolder', 'yoga-videos'); // Eigenes Unterverzeichnis
            try {
                const res = await fetch(`${API_BASE_URL_UPLOADS}/video`, { method: 'POST', headers: { 'Authorization': `Bearer ${keycloakInstance.token}` }, body: videoFormData });
                if (!res.ok) throw new Error('Video-Upload fehlgeschlagen');
                uploadedVideoUrl = (await res.json()).filePath;
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
                return;
            }
        }

        const payload = {
            ...formData,
            imageUrl: uploadedImageUrl,
            videoUrl: uploadedVideoUrl,
            effects: formData.effects.map(i => i.text).filter(Boolean),
            tips: formData.tips.map(i => i.text).filter(Boolean),
            steps: formData.steps.map((step, index) => ({
                ...step,
                stepNumber: index + 1,
                subSteps: step.subSteps.map((subStep, subIndex) => ({
                    ...subStep,
                    subStepNumber: subIndex + 1,
                })).filter(ss => ss.description),
            })).filter(s => s.title),
        };

        try {
            if (isCreating) {
                await yogaExerciseService.createYogaExercise(payload);
                setSuccessMessage('Übung erfolgreich erstellt.');
            } else {
                await yogaExerciseService.updateYogaExercise(editingExercise.id, payload);
                setSuccessMessage('Übung erfolgreich aktualisiert.');
            }
            resetFormAndState();
            fetchExercises();
        } catch (err) {
            setError(`Fehler beim Speichern: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredExercises = useMemo(() => {
        let filtered = [...exercises];

        // 1. Filterung nach Dosha
        if (filterDosha !== 'all') {
            filtered = filtered.filter(exercise => exercise.doshaTypes?.includes(filterDosha));
        }

        // 2. Suche nach Titel
        if (searchTerm) {
            filtered = filtered.filter(exercise =>
                exercise.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 3. Sortierung
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (sortConfig.key === 'doshaTypes') {
                    const aString = a.doshaTypes?.join(', ') || '';
                    const bString = b.doshaTypes?.join(', ') || '';
                    if (aString < bString) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (aString > bString) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [exercises, searchTerm, filterDosha, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    if (isLoading && !isCreating && !editingExercise) return <p>Lade Übungen...</p>;

    return (
        <div>
            <h2>Yoga-Übungen verwalten</h2>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

            {!isCreating && !editingExercise && (
                <button onClick={handleCreateNew} className={styles.createButton}>Neue Yoga-Übung erstellen</button>
            )}

            {(isCreating || editingExercise) && (
                <form onSubmit={handleSubmit} className={styles.adminForm}>
                    <h3>{isCreating ? 'Neue Übung' : 'Übung bearbeiten'}</h3>
                    <label>Titel: <input name="title" value={formData.title} onChange={handleFormChange} required /></label>
                    <label>Vorschau-Beschreibung: <textarea name="previewDescription" value={formData.previewDescription} onChange={handleFormChange} /></label>
                    <label>Ausführliche Beschreibung: <textarea name="description" value={formData.description} onChange={handleFormChange} rows="4" /></label>
                    <label>Video hochladen: <input type="file" onChange={handleVideoFileChange} accept="video/mp4,video/webm" /></label>
                    {formData.videoUrl && !selectedVideoFile && <video
                        key={formData.videoUrl}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ width: '150px', marginTop: '10px' }}
                    >
                        <source src={formData.videoUrl} type="video/mp4" />
                        Dein Browser unterstützt das Video-Tag nicht.
                    </video>}
                    <label>Vorschau-Bild: <input type="file" onChange={handleFileChange} ref={fileInputRef} accept="image/*" /></label>
                    {imagePreview && <img src={imagePreview} alt="Vorschau" style={{ width: '150px', marginTop: '10px' }} />}

                    <h4>Dosha-Typen</h4>
                    {doshaTypeOptions.map(d => (
                        <label key={d.value} className={styles.checkboxLabel}>
                            <input type="checkbox" name="doshaTypes" value={d.value} checked={formData.doshaTypes.includes(d.value)} onChange={handleFormChange} /> {d.label}
                        </label>
                    ))}

                    <h4>Wirkung</h4>
                    {formData.effects.map((item, index) => (
                        <div key={index} className={styles.formGroupRepeat}>
                            <input value={item.text} onChange={(e) => handleSimpleListChange(index, 'effects', e.target.value)} placeholder={`Wirkung ${index + 1}`} />
                            <button type="button" onClick={() => removeSimpleListItem(index, 'effects')} className={styles.removeButton}>-</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addSimpleListItem('effects')} className={styles.addButton}>Wirkung hinzufügen</button>

                    <h4>Zusätzliche Tipps</h4>
                    {formData.tips.map((item, index) => (
                        <div key={index} className={styles.formGroupRepeat}>
                            <input value={item.text} onChange={(e) => handleSimpleListChange(index, 'tips', e.target.value)} placeholder={`Tipp ${index + 1}`} />
                            <button type="button" onClick={() => removeSimpleListItem(index, 'tips')} className={styles.removeButton}>-</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addSimpleListItem('tips')} className={styles.addButton}>Tipp hinzufügen</button>

                    <h4>Anleitung</h4>
                    {formData.steps.map((step, stepIndex) => (
                        <div key={stepIndex} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                            <div className={styles.formGroupRepeat}>
                                <strong>Schritt {stepIndex + 1}</strong>
                                <input value={step.title} onChange={e => handleStepChange(stepIndex, 'title', e.target.value)} placeholder="Titel des Schritts" />
                                <button type="button" onClick={() => removeStep(stepIndex)} className={styles.removeButton}>Hauptschritt löschen</button>
                            </div>
                            <textarea value={step.description} onChange={e => handleStepChange(stepIndex, 'description', e.target.value)} placeholder="Beschreibung des Hauptschritts" style={{ width: '100%', boxSizing: 'border-box' }} />

                            <h5 style={{ marginTop: '10px', marginBottom: '5px' }}>Teilschritte:</h5>
                            {step.subSteps.map((subStep, subStepIndex) => (
                                <div key={subStepIndex} className={styles.formGroupRepeat} style={{ marginLeft: '20px' }}>
                                    <input value={subStep.description} onChange={e => handleSubStepChange(stepIndex, subStepIndex, e.target.value)} placeholder={`Teilschritt ${subStepIndex + 1}`} />
                                    <button type="button" onClick={() => removeSubStep(stepIndex, subStepIndex)} className={styles.removeButton}>-</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addSubStep(stepIndex)} className={styles.addButton} style={{ marginLeft: '20px' }}>Teilschritt hinzufügen</button>
                        </div>
                    ))}
                    <button type="button" onClick={addStep} className={styles.addButton}>Hauptschritt hinzufügen</button>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.saveButton} disabled={isLoading}>Speichern</button>
                        <button type="button" onClick={resetFormAndState} className={styles.cancelButton} disabled={isLoading}>Abbrechen</button>
                    </div>
                </form>
            )}

            {!isCreating && !editingExercise && (
                <>
                    <div className={styles.tableControls}>
                        <input
                            type="text"
                            placeholder="Suche nach Titel..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select value={filterDosha} onChange={(e) => setFilterDosha(e.target.value)}>
                            <option value="all">Alle Dosha-Typen</option>
                            {doshaTypeOptions.map(dosha => (
                                <option key={dosha.value} value={dosha.value}>{dosha.label}</option>
                            ))}
                        </select>
                        <p>Treffer: {filteredExercises.length}</p>
                    </div>
                    <table className={styles.adminTable}>
                        <thead><tr>
                            <th className={styles.sortableHeader} onClick={() => requestSort('title')}>Titel {getSortIndicator('title', sortConfig)}</th>
                            <th className={styles.sortableHeader} onClick={() => requestSort('doshaTypes')}>Doshas {getSortIndicator('doshaTypes', sortConfig)}</th>
                            <th>Aktionen</th>
                        </tr></thead>
                        <tbody>
                            {filteredExercises.map(ex => (
                                <tr key={ex.id}>
                                    <td>{ex.title}</td>
                                    <td>{ex.doshaTypes?.join(', ')}</td>
                                    <td className={styles.actionsCell}>
                                        <button onClick={() => handleEdit(ex.id)} className={styles.editButton}>Bearbeiten</button>
                                        <button onClick={() => handleDelete(ex.id)} className={styles.deleteButton}>Löschen</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

const getSortIndicator = (key, sortConfig) => {
    if (sortConfig.key !== key) return '↕';
    if (sortConfig.direction === 'ascending') return '↑';
    return '↓';
  };

export default ManageYoga;