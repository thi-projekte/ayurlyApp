import React, { useState, useEffect } from 'react';

export default function ProcessTestComponent() {
  const [loading, setLoading] = useState(false);
  const [processResult, setProcessResult] = useState('');
  const [error, setError] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);

  // Stoppt das Polling, wenn die Komponente verlassen wird
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Funktion, die den Prozess startet
  const handleStartProcess = async () => {
    setLoading(true);
    setProcessResult('');
    setError('');

    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    try {
      const startResponse = await fetch('/api/test-prozess/start', { method: 'POST' });
      if (!startResponse.ok) throw new Error('Fehler beim Starten des Prozesses');
      const { instanceId } = await startResponse.json();
      pollForResult(instanceId);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  // Funktion, die alle 500ms nach dem Ergebnis fragt
  const pollForResult = (instanceId) => {
    const interval = setInterval(async () => {
      try {
        const resultResponse = await fetch(`/api/test-prozess/${instanceId}/result`);
        if (resultResponse.status === 200) {
          const { value } = await resultResponse.json();
          setProcessResult(value);
          setLoading(false);
          clearInterval(interval);
          setPollingInterval(null);
        } else if (resultResponse.status !== 204) {
          throw new Error('Fehler beim Abrufen des Ergebnisses.');
        }
      } catch (e) {
        setError(e.message);
        setLoading(false);
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 500);
    setPollingInterval(interval);
  };

  // Eigene Stile für die Test-Komponente
  const styles = {
    container: { border: '2px solid #007bff', padding: '20px', margin: '20px 0', borderRadius: '10px' },
    resultBox: { marginTop: '20px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '5px' },
    errorText: { color: 'red' }
  };

  return (
    <div style={styles.container}>
      <h3>Prozess-Integrationstest</h3>
      <button onClick={handleStartProcess} disabled={loading}>
        {loading ? 'Prozess läuft...' : 'Dynamischen Inhalt laden'}
      </button>
      
      {loading && <p>Warte auf Ergebnis vom External Worker...</p>}
      
      {processResult && (
        <div style={styles.resultBox}>
          <strong>Ergebnis aus dem Prozess:</strong>
          <p>{processResult}</p>
        </div>
      )}

      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
}