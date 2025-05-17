# Ayurly - Dein täglicher Ayurveda-Begleiter

Ayurly ist eine Microservice-basierte Lifestyle-Plattform, die dich als täglicher Ayurveda-Begleiter motiviert, gesünder zu leben. Du erhältst personalisierte Empfehlungen und kannst deine täglichen Micro-Habits mit Gamification-Elementen tracken. Eine Besonderheit von Ayurly ist die vollständige Orchestrierung aller fachlichen Vorgänge durch BPMN-Prozesse mithilfe von Kogito.

Das aktuelle Ziel ist die Entwicklung eines Minimum Viable Product (MVP). Langfristig soll die Plattform auch als Mobile Web App verfügbar sein.

## Inhaltsverzeichnis

- [Ayurly - Dein täglicher Ayurveda-Begleiter](#ayurly---dein-täglicher-ayurveda-begleiter)
  - [Inhaltsverzeichnis](#inhaltsverzeichnis)
  - [Architektur](#architektur)
  - [Technologie-Stack](#technologie-stack)
  - [Services](#services)
  - [Features (MVP-Fokus)](#features-mvp-fokus)
  - [Repository-Struktur](#repository-struktur)
  - [Automatisierung (CI/CD)](#automatisierung-cicd)
  - [Deployment](#deployment)
  - [Setup \& Entwicklung](#setup--entwicklung)
  - [Beitragen](#beitragen)

## Architektur

Ayurly basiert auf einer Microservice-Architektur. Die einzelnen Services sind lose gekoppelt und kommunizieren miteinander, um die Funktionalität der Plattform bereitzustellen.

Die Kernkomponenten der Architektur sind:

1.  **Nginx Proxy:** Dient als Reverse Proxy und leitet Anfragen an die entsprechenden Backend-Services weiter.
2.  **Frontend (ayurly-frontend):** Die Benutzeroberfläche, mit der die Nutzer interagieren.
3.  **Keycloak:** Verantwortlich für die Authentifizierung und Autorisierung der Benutzer.
4.  **Kogito Process Engine:** Orchestriert alle fachlichen Vorgänge mittels BPMN-Prozessen.
5.  **Data-Service (ayurly-data-service):** Stellt die Schnittstelle zur Datenbank bereit.
6.  **Fachliche Datenbank (PostgreSQL):** Speichert alle relevanten Anwendungsdaten.

## Technologie-Stack

-   **Containerisierung & Orchestrierung:** Docker, Docker Compose
-   **Webserver/Reverse Proxy:** Nginx
-   **Frontend:** React, Vite, JavaScript, CSS Modules
-   **Backend (Data-Service):** Quarkus (Java), REST-APIs
-   **Prozess-Engine:** Kogito (BPMN)
-   **Datenbank:** PostgreSQL
-   **Authentifizierung:** Keycloak
-   **CI/CD:** GitHub Actions
-   **Deployment-Management (Server):** Portainer auf Ubuntu Server

## Services

Eine detailliertere Beschreibung der einzelnen Services und deren spezifische Konfiguration und Startanweisungen sind in den jeweiligen README-Dateien der Service-Verzeichnisse geplant:

-   `ayurly-frontend/`: Enthält den React-basierten Frontend-Service.
-   `ayurly-data-service/`: Enthält den Quarkus-basierten Backend-Service für Daten und Geschäftslogik.

Die Docker-Compose-Dateien für das Starten der Services sind:
-   `docker-compose.frontend.yml`
-   `docker-compose.dataservice.yml`
-   `docker-compose.ayurly-postgres-db.yml`
-   `docker-compose.keyCloak.yml`
-   `docker-compose.nginx-proxy.yml`
-   TODO: Kogito

## Features (MVP-Fokus)

-   **Ayurveda-Begleiter:** Tägliche Unterstützung und Motivation für einen gesünderen Lebensstil.
-   **Personalisierte Empfehlungen:** Auf den Nutzer zugeschnittene Ratschläge.
-   **Micro-Habit Tracking:** Erfassen und Verfolgen von täglichen Gewohnheiten.
-   **Gamification:** Spielerische Elemente zur Steigerung der Motivation.
-   **Dosha-Analyse:** Ermittlung des individuellen Ayurveda-Typs.
-   **Rezeptdatenbank:** Sammlung ayurvedischer Rezepte.
-   **BPMN-gesteuerte Prozesse:** Alle fachlichen Abläufe (z.B. Empfehlungsgenerierung) werden durch die Kogito Process Engine orchestriert.

## Repository-Struktur

Das Repository ist wie folgt strukturiert:

ayurlyapp/
├── .github/workflows/         # GitHub Actions CI/CD Workflows
│   ├── data-service-ci.yml
│   └── frontend-ci.yml
├── ayurly-data-service/       # Quarkus Backend Service
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile.jvm
├── ayurly-db-queries/         # Queries für fachliche DB 
│   └── t_app_user.sql
├── ayurly-frontend/           # React Frontend Service
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.ayurly-postgres-db.yml # Docker Compose für PostgreSQL
├── docker-compose.dataservice.yml        # Docker Compose für den Data-Service
├── docker-compose.frontend.yml           # Docker Compose für das Frontend
├── docker-compose.keyCloak.yml           # Docker Compose für Key Cloak
├── docker-compose.nginx-proxy.yml        # Docker Compose für nginx-proxy
├── README.md                             # Diese Datei
└── ...                                  

## Automatisierung (CI/CD)

Für das Frontend (`ayurly-frontend`) und den Data-Service (`ayurly-data-service`) sind GitHub Actions Workflows eingerichtet:

-   Bei jedem Push auf den `main`-Branch in den jeweiligen Service-Verzeichnissen wird:
    1.  Der Code ausgecheckt.
    2.  Notwendige Build-Schritte durchgeführt (Maven für Data-Service, Vite-Build für Frontend).
    3.  Jeweils ein Docker-Image gebaut.
    4.  Die Docker-Images in die GitHub Container Registry (`ghcr.io`) des Projekts gepusht.
        -   Images werden mit dem Commit-SHA und `latest` (für den `main`-Branch) getaggt.

Details sind in den Workflow-Dateien unter `.github/workflows/` zu finden.

## Deployment

Die Docker-Images werden nach dem erfolgreichen CI-Workflow in der GitHub Container Registry bereitgestellt.
Das Deployment auf dem Remote Ubuntu Server erfolgt durch das Pullen der neuesten Images und das Starten/Aktualisieren der Container, typischerweise verwaltet durch Portainer und die entsprechenden Docker-Compose-Dateien.

## Setup & Entwicklung

Für die lokale Entwicklungsumgebung ist Docker essentiell.

1.  **Voraussetzungen:**
    * Docker & Docker Compose
    * Node.js & npm (für die Frontend-Entwicklung)
    * Java JDK (Version siehe `pom.xml` im `ayurly-data-service`) & Maven (für die Backend-Entwicklung)
    * Git

2.  **Klonen des Repositories:**
    ```bash
    git clone https://github.com/thi-projekte/ayurlyApp
    cd ayurlyapp
    ```

3.  **Starten der Services mit Docker Compose:**
    Die einzelnen Services können über ihre jeweiligen `docker-compose.*.yml` Dateien gestartet werden. Diese werden jeweils über externe Netzwerke miteinander vernetzt. Diese Netzwerke müssen vorher über Docker erstellt werden.

    Beispielhaftes Starten eines einzelnen Service (z.B. Datenbank):
    ```bash
    docker-compose -f docker-compose.ayurly-postgres-db.yml up -d
    ```
    *(Hinweis: Umgebungsvariablen, insbesondere für Datenbank-Credentials und Keycloak-Verbindungen, müssen ggf. in einer `.env`-Datei im Hauptverzeichnis oder den entsprechenden Service-Verzeichnissen bereitgestellt werden.*

4.  **Frontend-Entwicklung (lokal ohne Docker für schnellere Iteration):**
    ```bash
    cd ayurly-frontend
    npm install 
    npm run dev 
    ```

5.  **Backend-Entwicklung (lokal ohne Docker für schnellere Iteration):**
    ```bash
    cd ayurly-data-service
    ./mvnw quarkus:dev
    ```

Detaillierte Anweisungen für die Entwicklung und Konfiguration der einzelnen Services sind in den README-Dateien der jeweiligen Verzeichnisse (`ayurly-frontend/README.md`, `ayurly-data-service/README.md`) geplant.

## Beitragen

Informationen zum Beitragen zum Projekt werden hier noch ergänzt (z.B. Coding Conventions, Branching-Modell, Pull Request Prozess).

---

*Diese README ist ein lebendiges Dokument und wird mit dem Fortschritt des Projekts aktualisiert.*