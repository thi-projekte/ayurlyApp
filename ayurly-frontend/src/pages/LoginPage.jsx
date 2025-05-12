import React, { useState, useEffect } from 'react';
import styles from './LoginPage.module.css';

// Service-Funktionen für API-Aufrufe (später auslagern in src/services/authService.js)
// Diese Funktionen sind Platzhalter und müssen durch echte API-Aufrufe an Quarkus ersetzt werden.
const validateRegistrationEmail = async (email) => {
  console.log(`[Dummy API] Validating email for registration: ${email}`);
  // Simuliere eine API-Antwort
  // In einer echten Anwendung: fetch(`/api/users/check-email?email=${encodeURIComponent(email)}`)
  return new Promise(resolve => setTimeout(() => {
    // Beispiel: Angenommen, 'test@example.com' ist schon registriert
    if (email === 'test@example.com') {
      resolve({ emailExists: true });
    } else {
      resolve({ emailExists: false });
    }
  }, 500));
};

const createUser = async (userData) => {
  console.log('[Dummy API] Creating user:', userData);
  // Simuliere eine API-Antwort
  // In einer echten Anwendung: fetch('/api/users/register', { method: 'POST', body: JSON.stringify(userData), headers: {'Content-Type': 'application/json'} })
  return new Promise(resolve => setTimeout(() => {
    resolve({ success: true, message: 'User created successfully (dummy)' });
  }, 500));
};

const loginUser = async (credentials) => {
  console.log('[Dummy API] Logging in user:', credentials);
  // Simuliere eine API-Antwort
  // In einer echten Anwendung: fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials), headers: {'Content-Type': 'application/json'} })
  return new Promise(resolve => setTimeout(() => {
    if (credentials.email === 'user@example.com' && credentials.password === 'password') {
      resolve({ success: true, message: 'Login successful (dummy)', token: 'dummy-jwt-token' });
    } else {
      resolve({ success: false, message: 'Invalid email or password (dummy)' });
    }
  }, 500));
};


const LoginPage = () => {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [signUpErrorMessage, setSignUpErrorMessage] = useState('');
  const [signInErrorMessage, setSignInErrorMessage] = useState('');

  const handleToggle = () => {
    setIsSignUpActive(!isSignUpActive);
    setSignUpErrorMessage('');
    setSignInErrorMessage('');
  };

  const validateRegistrationForm = (form) => {
    const firstname = form.firstname.value.trim();
    const lastname = form.lastname.value.trim();
    const birthday = form.birthday.value;
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const passwordRepeat = form.passwordRepeat.value.trim();

    if (!firstname) return "Vorname darf nicht leer sein!";
    if (!lastname) return "Nachname darf nicht leer sein!";

    const birthDate = new Date(birthday);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) return "Du musst mindestens 18 Jahre alt sein!";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return "Ungültige E-Mail-Adresse!";
    if (password.length < 6) return "Passwort muss mindestens 6 Zeichen lang sein!"; // Beispiel für Passwortlänge
    if (password !== passwordRepeat) return "Passwörter stimmen nicht überein!";

    return null; // Alles okay
  };

  const handleSignUpSubmit = async (event) => {
    event.preventDefault();
    setSignUpErrorMessage('');
    const form = event.target;
    const validationError = validateRegistrationForm(form);

    if (validationError) {
      setSignUpErrorMessage(validationError);
      return;
    }

    const email = form.email.value.trim();
    try {
      const emailValidation = await validateRegistrationEmail(email);
      if (emailValidation.emailExists) {
        setSignUpErrorMessage("Account existiert bereits! Melde dich an.");
        return;
      }

      const userData = {
        firstname: form.firstname.value.trim(),
        lastname: form.lastname.value.trim(),
        birthday: form.birthday.value,
        email: email,
        password: form.password.value.trim(),
      };

      const creationResponse = await createUser(userData);
      if (creationResponse.success) {
        alert(creationResponse.message); // Später Weiterleitung oder bessere UI-Benachrichtigung
        setIsSignUpActive(false); // Wechsle zur Login-Ansicht
        form.reset();
      } else {
        setSignUpErrorMessage(creationResponse.message || "Registrierung fehlgeschlagen.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setSignUpErrorMessage("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
    }
  };

  const validateSignInForm = (form) => {
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return "Ungültige E-Mail-Adresse!";
    if (!password) return "Passwort darf nicht leer sein!";
    return null;
  }

  const handleSignInSubmit = async (event) => {
    event.preventDefault();
    setSignInErrorMessage('');
    const form = event.target;
    const validationError = validateSignInForm(form);

    if (validationError) {
      setSignInErrorMessage(validationError);
      return;
    }

    const credentials = {
      email: form.email.value.trim(),
      password: form.password.value.trim(),
    };

    try {
      const loginResponse = await loginUser(credentials);
      if (loginResponse.success) {
        alert(loginResponse.message); // Später Speichern des Tokens und Weiterleitung
        // Hier würdest du z.B. den JWT-Token speichern und den Benutzer weiterleiten
        // navigate('/account'); // Beispiel für Weiterleitung mit useNavigate
        form.reset();
      } else {
        setSignInErrorMessage(loginResponse.message || "Anmeldung fehlgeschlagen.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setSignInErrorMessage("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
    }
  };

  return (
    // Die Hauptklasse 'container' wird für das Styling der Login-Seite als Ganzes verwendet
    // und enthält die Logik für den active-Zustand direkt aus `loginStyles.css`
    // Wir mappen die Klassen aus deiner alten `loginStyles.css` auf die CSS-Modul-Klassen
    <div className={`${styles.loginPageContainer} ${isSignUpActive ? styles.active : ''}`}>
      <div className={`${styles.formContainer} ${styles.signUp}`}>
        <form onSubmit={handleSignUpSubmit} noValidate> {/* noValidate, da wir eigene Validierung haben */}
          <h1>Erstelle einen Account!</h1>
          <span>Gib hierzu einfach deinen Namen und deine E-Mail an</span>
          <div className={styles.name}>
            <input type="text" name="firstname" required placeholder="Vorname..." maxLength="30" />
            <input type="text" name="lastname" required placeholder="Nachname..." maxLength="30" />
          </div>
          <input type="date" name="birthday" required />
          <input type="email" name="email" required placeholder="E-Mail..." maxLength="50" />
          <input type="password" name="password" required placeholder="Passwort..." maxLength="30" />
          <input type="password" name="passwordRepeat" required placeholder="Passwort wiederholen..." maxLength="30" />
          {signUpErrorMessage && <span className={styles.errorMessage}>{signUpErrorMessage}</span>}
          <button type="submit">Registrieren</button>
        </form>
      </div>

      <div className={`${styles.formContainer} ${styles.signIn}`}>
        <form onSubmit={handleSignInSubmit} noValidate>
          <h1>Anmelden!</h1>
          <span>Gib dein Passwort und deine E-Mail ein</span>
          <input type="email" name="email" required placeholder="E-Mail..." maxLength="50" />
          <input type="password" name="password" required placeholder="Passwort..." maxLength="30" />
          {signInErrorMessage && <span className={styles.errorMessage}>{signInErrorMessage}</span>}
          <a href="#">Passwort vergessen?</a> {/* Muss später implementiert werden */}
          <button type="submit">Anmelden</button>
        </form>
      </div>

      <div className={styles.switchContainer}>
        <div className={styles.toggle}>
          <div className={`${styles.togglePanel} ${styles.toggleLeft}`}>
            <h1>Hello, wie geht's denn so &#129304;</h1>
            <p>
              Willkommen zurück! Schön, dass du dir wieder Zeit für dich nimmst.
              Deine Balance und dein Wohlbefinden stehen an erster Stelle.
            </p>
            <button type="button" className={styles.hidden} onClick={handleToggle}>Anmelden</button>
          </div>
          <div className={`${styles.togglePanel} ${styles.toggleRight}`}>
            <h1>Willkommen bei <span>Ayurly</span> &#128075;</h1>
            <p>
              Deine Reise zu innerer Balance und Wohlbefinden beginnt hier.
              Registriere dich und entdecke, wie Ayurveda dir hilft, Körper und
              Geist in Einklang zu bringen.
            </p>
            <button type="button" className={styles.hidden} onClick={handleToggle}>Registrieren</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;