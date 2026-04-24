# Football Analyser

Angular standalone -sovellus jalkapallodatan selaamiseen API-Footballin kautta.

## Käynnistys

Asenna riippuvuudet:

```bash
npm install
```

Käynnistä kehityspalvelin:

```bash
npm start
```

Avaa selaimessa:

`http://localhost:4200`

## API keyn asetus (Vercel)

API-avainta ei tallenneta frontend-koodiin. Sovellus käyttää Vercel serverless -proxya (`/api/football/...`), joka lisää API-avaimen palvelinpuolella.

Aseta Verceliin nämä Environment Variables:

- `API_FOOTBALL_KEY` - oma API-Football avain
- `APP_GATE_USER` - appin kirjautumisen käyttäjätunnus
- `APP_GATE_PASSWORD` - sovelluksen aloitussalasana (syötetään loginissa)

Login-sivu tallentaa käyttäjätunnuksen ja salasanan sessioon ja jokainen API-kutsu kulkee proxyn kautta headereilla `x-app-user` ja `x-app-password`. Jos tunnus tai salasana on väärä, proxy palauttaa 401.

Suositus: laita Vercel Dashboardista lisäksi **Deployment Protection / Password Protection** päälle (site-level suojaus).

## Paikallinen kehitys

Paikallisesti voit ajaa Angularin normaalisti:

```bash
npm start
```

`npm start` lukee `API_FOOTBALL_KEY`-arvon tiedostosta `.env.local` ja proxyaa `/api/football/*`-kutsut API-Footballiin.

Jos haluat testata proxya myös lokaalisti, käytä Vercel CLI:tä:

```bash
vercel dev
```

## Vercel deploy (GitHub)

1. Pushaa repo GitHubiin.
2. Vercelissa: **Add New Project** -> valitse repo.
3. Build asetukset:
   - Build Command: `npm run build`
   - Output Directory: `dist/football-analyser`
4. Lisää Environment Variables:
   - `API_FOOTBALL_KEY`
   - `APP_GATE_USER`
   - `APP_GATE_PASSWORD`
5. (Suositus) Ota Project Settingsista käyttöön Password Protection.
6. Redeploy.

## Tärkeimmät komennot

```bash
npm start
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

## Reitit

- `/login` - kevyt kirjautumisnäkymä (gate)
- `/` - Etusivu, päivän ottelut
- `/search` - Haku (matches, teams, players)
- `/standings` - Sarjataulukot
- `/matches/:id` - Ottelun detailit
- `/players/:id` - Pelaajan detailit
- `/teams/:id` - Joukkueen detailit

## Arkkitehtuuri

Projektin rakenne on feature-pohjainen:

- `src/app/core/` - API-tyypit, konfiguraatio, HTTP-palvelut
- `src/app/shared/` - layout, yhteiset UI-komponentit, utilityt
- `src/app/features/home/` - etusivun ottelut
- `src/app/features/search/` - hakunäkymä
- `src/app/features/standings/` - sarjataulukot
- `src/app/features/matches/` - match details
- `src/app/features/players/` - player details
- `src/app/features/teams/` - team details

Kullakin featurellä on tyypillisesti:

- `data/` - service + mapper + view model
- `pages/` - route-tason standalone-komponentit
- `components/` - uudelleenkäytettävät feature-komponentit (tarvittaessa)

## Toteutetut laaturatkaisut

- standalone-komponentit + lazy route-level code splitting
- service-tason kevyt retry ja feature-kohtaiset cachet
- loading/empty/error-tilat kaikissa pääsivuissa
- utilityt päivä/aika/status/score-muotoiluun
- OnPush-change detection tärkeimmissä komponenteissa
- perus saavutettavuus (aria-labelit, focus-visible)

## Jatkokehitysehdotukset

- suosikit (joukkueet, liigat, pelaajat)
- push-ilmoitukset live-tilanteista
- live-match näkymä websocket/polling-päivityksillä
- käyttäjän tallentamat liigat ja oletusnäkymä
- dark mode / theme switcher
