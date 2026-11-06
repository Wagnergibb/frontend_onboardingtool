# frontend_onboardingtool

Frontend des rollenbasierten Onboarding-Tools (DTR II / WEB I, Klasse 25B, gibb HF).

## Technik

- HTML, CSS und JavaScript ohne Framework (ES-Module, `fetch`)
- Backend: [backend_onboardingtool](https://github.com/Wagnergibb/backend_onboardingtool), Quarkus mit PostgreSQL, REST-API unter `http://localhost:8080/api`

## Starten

Voraussetzungen: Java 17, Docker Desktop (für die Datenbank) und Python 3 oder VS Code mit der Erweiterung Live Server.

1. **Backend starten.** Im Backend-Repository, Docker muss laufen:

   ```bash
   ./mvnw quarkus:dev
   ```

   Quarkus startet die Datenbank automatisch und legt Testdaten an. Bereit ist das Backend, sobald `Listening on: http://localhost:8080` erscheint.

2. **Frontend starten.** In diesem Repository einen Webserver auf **Port 5500** starten:

   ```bash
   python -m http.server 5500
   ```

   Alternativ in VS Code `index.html` mit «Open with Live Server» öffnen.

3. Im Browser `http://localhost:5500` öffnen.

Port 5500 ist nötig, weil das Backend Anfragen nur von `localhost:5500` und `127.0.0.1:5500` zulässt (CORS). Direkt per Doppelklick (`file://`) funktioniert die Seite nicht, weil Browser JavaScript-Module dort blockieren.

## Testzugänge

Die Zugänge legt das Backend beim Start an (`DataLoader`).

| Rolle | Benutzername | Passwort |
|---|---|---|
| Admin | `admin` | `admin123` |
| Neue Person | `mia` | `test123` |

## Seiten

| Datei | Rolle | Inhalt |
|---|---|---|
| `index.html` | alle | Anmeldung |
| `user-dashboard.html` | Neue Person | Begrüssung, Fortschritt, Buddy, Status, nächster Inhalt |
| `user-contents.html` | Neue Person | Inhalte suchen, nach Kategorie filtern, abhaken, öffnen |
| `admin-users.html` | Admin | Benutzer anzeigen und mit Onboarding-Fall erstellen |
| `admin-contents.html` | Admin | Inhalte erstellen, bearbeiten, deaktivieren, PDF hochladen |

## Aufbau

```
css/style.css          gemeinsames Layout
js/common.js           API-Adresse, Rollenprüfung, Abmelden, escapeHtml
js/<seite>.js          ein Skript pro Seite
```

Die Rolle wird nach der Anmeldung im `sessionStorage` gespeichert. Die Prüfung findet bisher nur im Browser statt. Das Backend schützt die Endpunkte noch nicht.
