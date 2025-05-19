import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import apiRequest from '../../services/apiService';
import styles from '../../pages/AdminPage.module.css';

const API_BASE_URL_RECIPES = '/api/recipes';
const API_BASE_URL_LOOKUPS = '/api/lookups';
const API_BASE_URL_UPLOADS = '/api/admin/uploads'; 

const initialRecipeFormState = {
  title: '',
  imageUrl: '', // Wird durch den Upload-Pfad ersetzt
  previewDescription: '',
  description: '',
  doshaTypes: [],
  benefits: [{ text: '' }], 
  preparationTimeMinutes: 0,
  numberOfPortions: 1,
  ingredients: [{ name: '', quantity: '', unit: '', notes: '' }],
  preparationSteps: [{ stepNumber: 1, description: '' }],
};

const ManageRecipes = () => {
  const { keycloakInstance } = useUser();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(initialRecipeFormState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);


  // Lookup-Daten
  const [doshaTypeOptions, setDoshaTypeOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);

  const fetchRecipes = useCallback(async () => {
    if (!keycloakInstance || !keycloakInstance.token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(API_BASE_URL_RECIPES, 'GET', null, keycloakInstance.token);
      setRecipes(data || []);
    } catch (err) {
      setError(err.message || 'Fehler beim Laden der Rezepte.');
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, [keycloakInstance]);

  const fetchLookups = useCallback(async () => {
    if (!keycloakInstance || !keycloakInstance.token) return;
    try {
      const [doshas, units] = await Promise.all([
        apiRequest(`${API_BASE_URL_LOOKUPS}/dosha-types`, 'GET', null, keycloakInstance.token),
        apiRequest(`${API_BASE_URL_LOOKUPS}/units`, 'GET', null, keycloakInstance.token)
      ]);
      setDoshaTypeOptions(doshas || []);
      setUnitOptions(units || []);
    } catch (err) {
      setError(err.message || 'Fehler beim Laden der Lookup-Daten.');
    }
  }, [keycloakInstance]);

  useEffect(() => {
    fetchRecipes();
    fetchLookups();
  }, [fetchRecipes, fetchLookups]);

  const handleCreateNew = () => {
    setEditingRecipe(null);
    setFormData(initialRecipeFormState);
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Input-Feld zurücksetzen
    }
    setIsCreating(true);
    setError(null);
    setSuccessMessage('');
  };

  const handleEdit = async (recipeId) => {
    setIsLoading(true);
    setError(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    try {
      const recipeToEdit = await apiRequest(`${API_BASE_URL_RECIPES}/${recipeId}`, 'GET', null, keycloakInstance.token);
      if (recipeToEdit) {
        setFormData({
          title: recipeToEdit.title || '',
          imageUrl: recipeToEdit.imageUrl || '', // Bestehende URL anzeigen
          previewDescription: recipeToEdit.previewDescription || '',
          description: recipeToEdit.description || '',
          doshaTypes: recipeToEdit.doshaTypes || [],
          benefits: recipeToEdit.benefits && recipeToEdit.benefits.length > 0
            ? recipeToEdit.benefits.map(b => ({ text: b, id: Date.now() + Math.random() }))
            : [{ text: '', id: Date.now() }],
          preparationTimeMinutes: recipeToEdit.preparationTimeMinutes || 0,
          numberOfPortions: recipeToEdit.numberOfPortions || 1,
          ingredients: recipeToEdit.ingredients && recipeToEdit.ingredients.length > 0 ? recipeToEdit.ingredients.map(ing => ({...ing, id: ing.id || Date.now() + Math.random() })) : [{ name: '', quantity: '', unit: '', notes: '', id: Date.now() }],
          preparationSteps: recipeToEdit.preparationSteps && recipeToEdit.preparationSteps.length > 0 ? recipeToEdit.preparationSteps.map(step => ({...step, id: step.id || Date.now() + Math.random() })) : [{ stepNumber: 1, description: '', id: Date.now() }],
        });
        setImagePreview(recipeToEdit.imageUrl || null); // Vorschau für bestehendes Bild
        setEditingRecipe(recipeToEdit);
        setIsCreating(false);
      } else {
        setError("Rezept nicht gefunden.");
      }
    } catch (err) {
      setError(err.message || 'Fehler beim Laden des Rezepts für die Bearbeitung.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!keycloakInstance || !keycloakInstance.token) return;
    if (window.confirm('Möchten Sie dieses Rezept wirklich löschen?')) {
      setIsLoading(true);
      setError(null);
      try {
        await apiRequest(`${API_BASE_URL_RECIPES}/${id}`, 'DELETE', null, keycloakInstance.token);
        setSuccessMessage('Rezept erfolgreich gelöscht.');
        fetchRecipes();
      } catch (err) {
        setError(err.message || 'Fehler beim Löschen des Rezepts.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      // Wenn keine neue Datei ausgewählt, aber eine alte imageUrl existiert, diese wieder anzeigen
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
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value, 10) : value
      }));
    }
  };

  // --- Benefits ---
  const handleBenefitChange = (index, e) => {
    const { value } = e.target;
    const newBenefits = formData.benefits.map((benefit, i) =>
      i === index ? { ...benefit, text: value } : benefit
    );
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, { text: '', id: Date.now() }]
    }));
  };

  const removeBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };


  // --- Ingredients & Steps ---
  const handleIngredientChange = (index, e) => {
    const { name, value } = e.target;
    const newIngredients = formData.ingredients.map((ing, i) =>
      i === index ? { ...ing, [name]: value } : ing
    );
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '', notes: '', id: Date.now() }]
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleStepChange = (index, e) => {
    const { name, value } = e.target;
    const newSteps = formData.preparationSteps.map((step, i) =>
      i === index ? { ...step, [name]: value } : step
    );
    const numberedSteps = newSteps.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    setFormData(prev => ({ ...prev, preparationSteps: numberedSteps }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      preparationSteps: [...prev.preparationSteps, { stepNumber: prev.preparationSteps.length + 1, description: '', id: Date.now() }]
    }));
  };

  const removeStep = (index) => {
    const newSteps = formData.preparationSteps.filter((_, i) => i !== index);
    const renumberedSteps = newSteps.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    setFormData(prev => ({ ...prev, preparationSteps: renumberedSteps }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!keycloakInstance || !keycloakInstance.token) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    let uploadedImageUrl = formData.imageUrl; // Bestehende URL oder leeren String verwenden

    // 1. Bild hochladen, falls ein neues ausgewählt wurde
    if (selectedFile) {
      const imageUploadFormData = new FormData();
      imageUploadFormData.append('file', selectedFile);
      imageUploadFormData.append('subfolder', 'recipes'); // Optional, um Bilder zu organisieren

      try {
        // Verwende fetch direkt für FormData, da apiService für JSON konfiguriert ist
        const uploadResponse = await fetch(`${API_BASE_URL_UPLOADS}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${keycloakInstance.token}`,
            // 'Content-Type': 'multipart/form-data' WIRD VOM BROWSER GESETZT bei FormData
          },
          body: imageUploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ message: uploadResponse.statusText }));
          throw new Error(errorData.message || `Bild-Upload fehlgeschlagen: ${uploadResponse.status}`);
        }
        const uploadResult = await uploadResponse.json();
        uploadedImageUrl = uploadResult.filePath; // Pfad vom Backend verwenden
      } catch (uploadError) {
        setError(`Fehler beim Bild-Upload: ${uploadError.message}`);
        setIsLoading(false);
        return;
      }
    }

    // 2. Rezeptdaten speichern
    const payload = {
      ...formData,
      imageUrl: uploadedImageUrl, // Aktualisierte imageUrl
      benefits: formData.benefits.map(b => b.text).filter(text => text.trim() !== ''), // Nur Text der Benefits senden
      ingredients: formData.ingredients.filter(ing => ing.name.trim() !== ''),
      preparationSteps: formData.preparationSteps.filter(step => step.description.trim() !== ''),
      preparationTimeMinutes: parseInt(formData.preparationTimeMinutes, 10) || 0,
      numberOfPortions: parseInt(formData.numberOfPortions, 10) || 1,
    };

    const method = isCreating ? 'POST' : 'PUT';
    const url = isCreating ? API_BASE_URL_RECIPES : `${API_BASE_URL_RECIPES}/${editingRecipe.id}`;

    try {
      await apiRequest(url, method, payload, keycloakInstance.token);
      setSuccessMessage(`Rezept erfolgreich ${isCreating ? 'erstellt' : 'aktualisiert'}.`);
      setEditingRecipe(null);
      setIsCreating(false);
      setFormData(initialRecipeFormState);
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchRecipes();
    } catch (err) {
      setError(err.message || `Fehler beim ${isCreating ? 'Erstellen' : 'Aktualisieren'} des Rezepts.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !editingRecipe && !isCreating) {
    return <p>Lade Rezepte...</p>;
  }

  return (
    <div>
      <h2>Rezepte verwalten</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      {(!editingRecipe && !isCreating) && (
        <button onClick={handleCreateNew} className={styles.createButton}>Neues Rezept erstellen</button>
      )}

      {(editingRecipe || isCreating) && (
        <form onSubmit={handleSubmit} className={styles.adminForm}>
          <h3>{isCreating ? 'Neues Rezept erstellen' : `Rezept bearbeiten: ${editingRecipe?.title || ''}`}</h3>

          <div>
            <label htmlFor="title">Titel:</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleFormChange} required />
          </div>

          <div>
            <label htmlFor="imageUpload">Bild hochladen:</label>
            <input type="file" id="imageUpload" name="imageUpload" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif, image/webp" ref={fileInputRef} />
            {imagePreview && (
              <div className={styles.imagePreviewContainer}>
                <img src={imagePreview} alt="Rezept Vorschau" style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }}/>
              </div>
            )}
            {formData.imageUrl && !selectedFile && !imagePreview && ( // Zeige existierende URL, wenn keine neue Datei ausgewählt
                 <div className={styles.imagePreviewContainer}>
                    <p>Aktuelles Bild:</p>
                    <img src={formData.imageUrl} alt="Aktuelles Rezeptbild" style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }}/>
                </div>
            )}
          </div>

          <div>
            <label htmlFor="previewDescription">Vorschau-Beschreibung (kurz):</label>
            <textarea id="previewDescription" name="previewDescription" value={formData.previewDescription} onChange={handleFormChange}></textarea>
          </div>
          <div>
            <label htmlFor="description">Ausführliche Beschreibung:</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleFormChange} style={{minHeight: '100px'}}></textarea>
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

          <h4>Vorteile/Wirkung</h4>
          {formData.benefits.map((benefit, index) => (
            <div key={benefit.id || index} className={styles.formGroupRepeat}>
              <input
                type="text"
                name="benefit_text"
                placeholder={`Vorteil ${index + 1}`}
                value={benefit.text}
                onChange={(e) => handleBenefitChange(index, e)}
              />
              <button type="button" onClick={() => removeBenefit(index)} className={styles.removeButton}>-</button>
            </div>
          ))}
          <button type="button" onClick={addBenefit} className={styles.addButton}>Vorteil hinzufügen</button>


          <div>
            <label htmlFor="preparationTimeMinutes">Zubereitungszeit (Minuten):</label>
            <input type="number" id="preparationTimeMinutes" name="preparationTimeMinutes" value={formData.preparationTimeMinutes} onChange={handleFormChange} min="0" />
          </div>
          <div>
            <label htmlFor="numberOfPortions">Portionen:</label>
            <input type="number" id="numberOfPortions" name="numberOfPortions" value={formData.numberOfPortions} onChange={handleFormChange} min="1" />
          </div>

          <h4>Zutaten</h4>
          {formData.ingredients.map((ing, index) => (
            <div key={ing.id || index} className={styles.formGroupRepeat}>
              <input type="text" name="name" placeholder="Zutat" value={ing.name} onChange={(e) => handleIngredientChange(index, e)} />
              <input type="text" name="quantity" placeholder="Menge" value={ing.quantity} onChange={(e) => handleIngredientChange(index, e)} />
              <select name="unit" value={ing.unit} onChange={(e) => handleIngredientChange(index, e)}>
                <option value="">Einheit wählen</option>
                {unitOptions.map(unit => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
              </select>
              <input type="text" name="notes" placeholder="Notiz (optional)" value={ing.notes} onChange={(e) => handleIngredientChange(index, e)} />
              <button type="button" onClick={() => removeIngredient(index)} className={styles.removeButton}>-</button>
            </div>
          ))}
          <button type="button" onClick={addIngredient} className={styles.addButton}>Zutat hinzufügen</button>

          <h4>Zubereitungsschritte</h4>
          {formData.preparationSteps.map((step, index) => (
            <div key={step.id || index} className={styles.formGroupRepeat}>
              <span>Schritt {step.stepNumber}:</span>
              <textarea name="description" placeholder="Beschreibung des Schritts" value={step.description} onChange={(e) => handleStepChange(index, e)} required />
              <button type="button" onClick={() => removeStep(index)} className={styles.removeButton}>-</button>
            </div>
          ))}
          <button type="button" onClick={addStep} className={styles.addButton}>Schritt hinzufügen</button>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton} disabled={isLoading}>
              {isLoading ? 'Speichern...' : 'Rezept Speichern'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={() => { setEditingRecipe(null); setIsCreating(false); setFormData(initialRecipeFormState); setSelectedFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = "";}} disabled={isLoading}>
              Abbrechen
            </button>
          </div>
        </form>
      )}

       {/* Tabellenansicht */}
       {(!editingRecipe && !isCreating && recipes.length > 0) && (
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Bild</th>
              <th>Titel</th>
              <th>Doshas</th>
              <th>Portionen</th>
              <th>Zeit (Min)</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map(recipe => (
              <tr key={recipe.id}>
                <td>
                  {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.title} style={{width: '70px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} onError={(e) => e.target.style.display='none'}/>}
                </td>
                <td>{recipe.title}</td>
                <td>{recipe.doshaTypes?.join(', ') || '-'}</td>
                <td>{recipe.numberOfPortions || '-'}</td>
                <td>{recipe.preparationTimeMinutes || '-'}</td>
                <td className={styles.actionsCell}>
                  <button onClick={() => handleEdit(recipe.id)} className={styles.editButton}>Bearbeiten</button>
                  <button onClick={() => handleDelete(recipe.id)} className={styles.deleteButton}>Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(!editingRecipe && !isCreating && !isLoading && recipes.length === 0) && (
        <p>Keine Rezepte gefunden. Erstellen Sie das erste Rezept!</p>
      )}
    </div>
  );
};

export default ManageRecipes;