import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import apiRequest from '../../services/apiService';
import styles from '../../pages/AdminPage.module.css';

const API_BASE_URL_PRODUCTS = '/api/products';
const API_BASE_URL_LOOKUPS = '/api/lookups';
const API_BASE_URL_UPLOADS = '/api/admin/uploads';

const initialProductFormState = {
    title: '',
    imageUrl: '',
    previewDescription: '',
    description: '',
    doshaTypes: [],
    price: 0,
    weight: 0,
    unit: 'g',
    externalLink: '',
    benefits: [{ text: '' }],
    activeIngredients: [{ text: '' }],
    applicationSteps: [{ stepNumber: 1, description: '' }],
};

const ManageProducts = () => {
    const { keycloakInstance } = useUser();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [editingProduct, setEditingProduct] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState(initialProductFormState);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [doshaTypeOptions, setDoshaTypeOptions] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDosha, setFilterDosha] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });
 

    const fetchProducts = useCallback(async () => {
        if (!keycloakInstance || !keycloakInstance.token) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiRequest(API_BASE_URL_PRODUCTS, 'GET', null, keycloakInstance.token);
            setProducts(data || []);
        } catch (err) {
            setError(err.message || 'Fehler beim Laden der Produkte.');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [keycloakInstance]);

    const fetchLookups = useCallback(async () => {
        if (!keycloakInstance || !keycloakInstance.token) return;
        try {
            const doshas = await apiRequest(`${API_BASE_URL_LOOKUPS}/dosha-types`, 'GET', null, keycloakInstance.token);
            setDoshaTypeOptions(doshas || []);
        } catch (err) {
            setError(err.message || 'Fehler beim Laden der Dosha-Typen.');
        }
    }, [keycloakInstance]);

    useEffect(() => {
        fetchProducts();
        fetchLookups();
    }, [fetchProducts, fetchLookups]);
    
    // Aufräumen und Reset Logik
    const resetFormAndState = () => {
        setEditingProduct(null);
        setIsCreating(false);
        setFormData(initialProductFormState);
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCreateNew = () => {
        resetFormAndState();
        setIsCreating(true);
        setError(null);
        setSuccessMessage('');
    };

    const handleEdit = async (productId) => {
        setIsLoading(true);
        resetFormAndState();
        setError(null);
        try {
            const productToEdit = await apiRequest(`${API_BASE_URL_PRODUCTS}/${productId}`, 'GET', null, keycloakInstance.token);
            if (productToEdit) {
                setFormData({
                    title: productToEdit.title || '',
                    imageUrl: productToEdit.imageUrl || '',
                    previewDescription: productToEdit.previewDescription || '',
                    description: productToEdit.description || '',
                    doshaTypes: productToEdit.doshaTypes || [],
                    price: productToEdit.price || 0,
                    weight: productToEdit.weight || 0,
                    unit: productToEdit.unit || 'g',
                    externalLink: productToEdit.externalLink || '',
                    benefits: productToEdit.benefits && productToEdit.benefits.length > 0 ? productToEdit.benefits.map(b => ({ text: b })) : [{ text: '' }],
                    activeIngredients: productToEdit.activeIngredients && productToEdit.activeIngredients.length > 0 ? productToEdit.activeIngredients.map(i => ({ text: i })) : [{ text: '' }],
                    applicationSteps: productToEdit.applicationSteps && productToEdit.applicationSteps.length > 0 ? productToEdit.applicationSteps : [{ stepNumber: 1, description: '' }],
                });
                setImagePreview(productToEdit.imageUrl || null);
                setEditingProduct(productToEdit);
                setIsCreating(false);
            } else {
                setError("Produkt nicht gefunden.");
            }
        } catch (err) {
            setError(err.message || 'Fehler beim Laden des Produkts für die Bearbeitung.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Möchten Sie dieses Produkt wirklich löschen?')) {
            setIsLoading(true);
            setError(null);
            try {
                await apiRequest(`${API_BASE_URL_PRODUCTS}/${id}`, 'DELETE', null, keycloakInstance.token);
                setSuccessMessage('Produkt erfolgreich gelöscht.');
                fetchProducts();
            } catch (err) {
                setError(err.message || 'Fehler beim Löschen des Produkts.');
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    // --- Formular-Handler ---
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setImagePreview(formData.imageUrl || null);
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
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
        }
    };

    const handleRepeatableChange = (index, field, e) => {
        const { value } = e.target;
        const newList = formData[field].map((item, i) => i === index ? { ...item, text: value } : item);
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const addRepeatable = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], { text: '' }] }));
    };

    const removeRepeatable = (index, field) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };
    
    const handleStepChange = (index, e) => {
        const { value } = e.target;
        const newSteps = formData.applicationSteps.map((step, i) =>
            i === index ? { ...step, description: value } : step
        );
        setFormData(prev => ({ ...prev, applicationSteps: newSteps }));
    };

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            applicationSteps: [...prev.applicationSteps, { stepNumber: prev.applicationSteps.length + 1, description: '' }]
        }));
    };

    const removeStep = (index) => {
        const newSteps = formData.applicationSteps.filter((_, i) => i !== index);
        const renumberedSteps = newSteps.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
        setFormData(prev => ({ ...prev, applicationSteps: renumberedSteps }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage('');

        let uploadedImageUrl = formData.imageUrl;

        if (selectedFile) {
            const imageUploadFormData = new FormData();
            imageUploadFormData.append('file', selectedFile);
            imageUploadFormData.append('subfolder', 'products');
            try {
                const uploadResponse = await fetch(`${API_BASE_URL_UPLOADS}/image`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${keycloakInstance.token}` },
                    body: imageUploadFormData,
                });
                if (!uploadResponse.ok) throw new Error((await uploadResponse.json()).message || 'Bild-Upload fehlgeschlagen');
                uploadedImageUrl = (await uploadResponse.json()).filePath;
            } catch (uploadError) {
                setError(`Fehler beim Bild-Upload: ${uploadError.message}`);
                setIsLoading(false);
                return;
            }
        }

        const payload = {
            ...formData,
            imageUrl: uploadedImageUrl,
            benefits: formData.benefits.map(b => b.text).filter(text => text.trim() !== ''),
            activeIngredients: formData.activeIngredients.map(i => i.text).filter(text => text.trim() !== ''),
            applicationSteps: formData.applicationSteps.filter(step => step.description.trim() !== ''),
        };

        const method = isCreating ? 'POST' : 'PUT';
        const url = isCreating ? API_BASE_URL_PRODUCTS : `${API_BASE_URL_PRODUCTS}/${editingProduct.id}`;

        try {
            await apiRequest(url, method, payload, keycloakInstance.token);
            setSuccessMessage(`Produkt erfolgreich ${isCreating ? 'erstellt' : 'aktualisiert'}.`);
            resetFormAndState();
            fetchProducts();
        } catch (err) {
            setError(err.message || `Fehler beim Speichern des Produkts.`);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // 1. Filterung nach Dosha
        if (filterDosha !== 'all') {
            filtered = filtered.filter(product => product.doshaTypes?.includes(filterDosha));
        }

        // 2. Suche nach Titel
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(searchTerm.toLowerCase())
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
    }, [products, searchTerm, filterDosha, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    if (isLoading && !editingProduct && !isCreating) {
        return <p>Lade Produkte...</p>;
    }

    return (
        <div>
            <h2>Produkte verwalten</h2>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

            {(!editingProduct && !isCreating) && (
                <button onClick={handleCreateNew} className={styles.createButton}>Neues Produkt erstellen</button>
            )}

            {(editingProduct || isCreating) && (
                <form onSubmit={handleSubmit} className={styles.adminForm}>
                    <h3>{isCreating ? 'Neues Produkt erstellen' : `Produkt bearbeiten: ${editingProduct?.title || ''}`}</h3>

                    {/* --- Basis-Felder --- */}
                    <label>Titel: <input type="text" name="title" value={formData.title} onChange={handleFormChange} required /></label>
                    <label>Bild hochladen: <input type="file" name="imageUpload" onChange={handleFileChange} accept="image/*" ref={fileInputRef} /></label>
                    {imagePreview && <img src={imagePreview} alt="Vorschau" style={{ maxWidth: '200px', margin: '10px 0' }}/>}
                    <label>Vorschau-Beschreibung: <textarea name="previewDescription" value={formData.previewDescription} onChange={handleFormChange}></textarea></label>
                    <label>Beschreibung: <textarea name="description" value={formData.description} onChange={handleFormChange} rows="4"></textarea></label>
                    <label>Preis (€): <input type="number" name="price" value={formData.price} onChange={handleFormChange} step="0.01" /></label>
                    <label>Gewicht/Inhalt: <input type="number" name="weight" value={formData.weight} onChange={handleFormChange} step="any" /></label>
                    <label>Einheit: <select name="unit" value={formData.unit} onChange={handleFormChange}><option value="g">g</option><option value="kg">kg</option></select></label>
                    <label>Externer Link: <input type="text" name="externalLink" value={formData.externalLink} onChange={handleFormChange} placeholder="https://..." /></label>

                    <h4>Dosha-Typen</h4>
                    {doshaTypeOptions.map(dosha => (
                        <label key={dosha.value} className={styles.checkboxLabel}>
                            <input type="checkbox" name="doshaTypes" value={dosha.value} checked={formData.doshaTypes.includes(dosha.value)} onChange={handleFormChange} />
                            {dosha.label}
                        </label>
                    ))}
                    
                    <h4>Vorteile</h4>
                    {formData.benefits.map((item, index) => (
                        <div key={index} className={styles.formGroupRepeat}>
                            <input type="text" placeholder={`Vorteil ${index + 1}`} value={item.text} onChange={(e) => handleRepeatableChange(index, 'benefits', e)} />
                            <button type="button" onClick={() => removeRepeatable(index, 'benefits')} className={styles.removeButton}>-</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addRepeatable('benefits')} className={styles.addButton}>Vorteil hinzufügen</button>

                    <h4>Wirkstoffe</h4>
                    {formData.activeIngredients.map((item, index) => (
                        <div key={index} className={styles.formGroupRepeat}>
                            <input type="text" placeholder={`Wirkstoff ${index + 1}`} value={item.text} onChange={(e) => handleRepeatableChange(index, 'activeIngredients', e)} />
                            <button type="button" onClick={() => removeRepeatable(index, 'activeIngredients')} className={styles.removeButton}>-</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addRepeatable('activeIngredients')} className={styles.addButton}>Wirkstoff hinzufügen</button>
                    
                    <h4>Anwendungsschritte</h4>
                    {formData.applicationSteps.map((step, index) => (
                        <div key={index} className={styles.formGroupRepeat}>
                            <span>Schritt {step.stepNumber}:</span>
                            <textarea placeholder="Beschreibung des Schritts" value={step.description} onChange={(e) => handleStepChange(index, e)} required />
                            <button type="button" onClick={() => removeStep(index)} className={styles.removeButton}>-</button>
                        </div>
                    ))}
                    <button type="button" onClick={addStep} className={styles.addButton}>Schritt hinzufügen</button>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.saveButton} disabled={isLoading}>{isLoading ? 'Speichern...' : 'Produkt Speichern'}</button>
                        <button type="button" className={styles.cancelButton} onClick={resetFormAndState} disabled={isLoading}>Abbrechen</button>
                    </div>
                </form>
            )}

            {(!editingProduct && !isCreating && products.length > 0) && (
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
                    <p>Treffer: {filteredProducts.length}</p>
                </div>
                <table className={styles.adminTable}>
                    <thead>
                            <tr>
                                <th>Bild</th>
                                <th className={styles.sortableHeader} onClick={() => requestSort('title')}>Titel {getSortIndicator('title', sortConfig)}</th>
                                <th className={styles.sortableHeader} onClick={() => requestSort('doshaTypes')}>Doshas {getSortIndicator('doshaTypes', sortConfig)}</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id}>
                                <td>{p.imageUrl && <img src={p.imageUrl} alt={p.title} style={{width: '70px', height: '50px', objectFit: 'cover'}}/>}</td>
                                <td>{p.title}</td>
                                <td>{p.doshaTypes?.join(', ')}</td>
                                <td className={styles.actionsCell}>
                                    <button onClick={() => handleEdit(p.id)} className={styles.editButton}>Bearbeiten</button>
                                    <button onClick={() => handleDelete(p.id)} className={styles.deleteButton}>Löschen</button>
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

export default ManageProducts;