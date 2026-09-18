# Frontend Onboarding-Tool

Vue 3 mit Vite. Enthält aktuell den Teil von **Philipp**: die persönliche
Onboarding-Ansicht (US-09) und die rollenbezogene Inhaltsanzeige (US-03).

## Starten

Das Backend (Quarkus) muss auf Port 8080 laufen:

```bash
./mvnw quarkus:dev
```

Danach im Frontend:

```bash
npm install
npm run dev
```

Die Ansicht liegt auf <http://localhost:5173>. Der Onboarding-Fall wird über die
URL gewählt, zum Beispiel `http://localhost:5173/?fall=1`. Eine Anmeldung gibt
es im MVP noch nicht.

## Warum ein Vite-Proxy

Das Backend setzt keine CORS-Header. Ein direkter Aufruf von Port 5173 auf
Port 8080 würde vom Browser blockiert. `vite.config.js` leitet deshalb alle
Anfragen auf `/api` an Quarkus weiter, sodass Frontend und API denselben Origin
haben. Für einen späteren produktiven Betrieb muss das Backend
`quarkus.http.cors=true` setzen.

## Aufbau

| Datei | Zweck |
|---|---|
| `src/api/onboardingApi.js` | Alle Backend-Aufrufe an einer Stelle, inklusive Fehlermeldungen |
| `src/App.vue` | Lädt Daten, hält Filterzustand, verteilt an die Komponenten |
| `src/components/PersonHeader.vue` | Person, Funktion, Status, Ansprechperson, Rollen-Tags |
| `src/components/ProgressBar.vue` | Fortschrittsbalken mit Prozentwert |
| `src/components/ContentFilters.vue` | Kategorie-Auswahl und Suchfeld |
| `src/components/ContentList.vue` | Liste inklusive Lade- und Leerzustand |
| `src/components/ContentCard.vue` | Einzelner Inhalt mit Kategorie, Rollen-Tags und Link |
| `src/styles/base.css` | Farben als Custom Properties, Grundlayout, Raster ab 720 px |

## Verwendete Endpunkte

- `GET /api/onboarding/{id}/dashboard` — Kopfdaten und Fortschritt
- `GET /api/onboarding/{id}/content?category=&search=` — gefilterte Inhalte
- `GET /api/content/{id}/resource` — PDF oder Weiterleitung auf den Link

Die Filterung nach Rollen-Tags passiert im Backend. Das Frontend zeigt nur an,
was es geliefert bekommt, und filtert nicht ein zweites Mal.

## Nicht in diesem Teil enthalten

Das Abhaken von Aufgaben (US-05) und die Statusverwaltung (US-06) gehören zu
Haikos Paket. Der Erledigt-Zustand wird hier nur angezeigt, nicht verändert.
Der passende Endpunkt wäre `POST /api/onboarding/{id}/content/{contentId}/complete`.

## Abhängigkeiten zum Backend

Zwei Punkte sind im Backend offen und wirken sich auf diese Ansicht aus:

1. `firstName` und `lastName` bleiben am Onboarding-Fall leer, wenn der Fall
   über `POST /api/users` angelegt wurde. Die Ansicht zeigt deshalb ersatzweise
   die Funktion an.
2. Der Fortschritt kann über 100 Prozent steigen, wenn bereits erledigte Inhalte
   nachträglich deaktiviert werden. Der Balken ist darum auf 100 Prozent
   begrenzt und zeigt bei Unstimmigkeit einen Hinweis.
