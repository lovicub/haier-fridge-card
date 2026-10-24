# Audyt karty Haier Fridge Premium

## Zakres

Źródłem jest niezmieniony plik `haier-fridge-card.js` (SHA-256: `5adabf7cc584b4a33410668defa61da9a6e3caee1fd71f7d6a61effaccc10e5d`). Nagłówek i komunikat w konsoli deklarują v5.0.0. Oryginał został zapisany w pierwszym commicie `421c542` („Preserve original Haier Fridge Premium Card v5.0.0”). W tym etapie nie zmieniono kodu karty.

## Funkcje i konfiguracja

Karta renderuje własną ilustrację SVG lodówki, pięć kafelków z odczytami, stan drzwi, status połączenia i opcjonalny czas aktualizacji oraz przycisk historii. Wymiary kontenera zmieniają układ przez klasy compact (<700 px), tight (<520 px) i stacked (<360 px). Drzwi mają animowane otwieranie. Obsługiwane jest `prefers-reduced-motion`.

| Opcja | Domyślna | Znaczenie |
| --- | --- | --- |
| `title` | `Haier Fridge` | Tytuł karty |
| `model` | `HDPW5620ANPD` | Opis modelu nad SVG |
| `entity_fridge_target` / alias `fridge_entity` | brak w `setConfig`; stub proponuje ID modelu | Zadana temperatura chłodziarki |
| `entity_my_zone_target` / alias `my_zone_entity` | jw. | Zadana temperatura strefy My Zone |
| `entity_freezer_target` / alias `freezer_entity` | jw. | Zadana temperatura zamrażarki |
| `entity_humidity` / alias `humidity_entity` | jw. | Wilgotność |
| `entity_door_fridge` / alias `door_entity` | jw. | Stan drzwi |
| `show_history_button` | `true` | Pokaż odnośnik historii dla encji chłodziarki |
| `show_last_updated` | `true` | Pokaż czas aktualizacji |
| `animate` | `true` | Wyłączenie ustawia klasę bez animacji |
| `type` | brak w `setConfig`; stub zwraca `custom:haier-fridge-card` | Typ Lovelace |

`getStubConfig(hass)` szuka encji po fragmentach niemieckich nazw `zieltemperatur`, `kuhlschrank`, `gefrierschrank`, `my_zone`, `luftfeuchtigkeit` i `tur_offen`; w przeciwnym razie proponuje konkretne ID modelu HDPW5620ANPD. Wyszukiwanie wybiera pierwsze pasujące ID bez sprawdzania domeny, urządzenia ani jednostki. Inni użytkownicy mogą ręcznie zmienić encje, ale domyślny stub jest specyficzny dla nazewnictwa/modelu.

## HA, encje i zachowanie stanów

Źródło nie zawiera stałych ID używanych do odczytu po konfiguracji; wszystkie pięć encji bierze z konfiguracji (plus aliasy zgodności). Stub wprowadza przykładowe ID modelu. Karta korzysta z `hass.states`, a jednostki pobiera z `attributes.unit_of_measurement`; dla temperatur domyślnie pokazuje `°C`, dla wilgotności `%`.

`unknown`, `unavailable`, `none`, pusty tekst i brak encji dostają placeholder `–`. Wartości drzwi `on/open/true/1/offen/opened` uznaje za otwarte. Pozostałe znane wartości uznaje za zamknięte. Przy nieznanych drzwiach pokazuje „Unbekannt”, neutralizuje animowany stan drzwi i oznacza SVG jako nieznany. Status „Verbunden” ustawia, gdy istnieje co najmniej jedna dostępna encja; inne cztery encje mogą być brakujące. Gdy wszystkie są brakujące/niedostępne, wyświetla „Keine Daten”.

Temperatury parsuje `parseFloat`, więc akceptowane są również teksty z numerycznym prefiksem. Brak aktualizacji czasu w tle: `Letzte Aktualisierung` odświeża się wraz z wejściem `hass`. Nieprawidłowy `last_updated` może dać tekst `NaN` w liczbie minut. `getCardSize()` zwraca stałe 8.

## Usługi, sieć i prywatność

Nie znaleziono `callService`, API HA, fetch/XHR ani adresu hosta zdalnego. Kliknięcie kafelka emituje `hass-more-info` dla skonfigurowanego ID; przycisk historii robi `history.pushState` na `/history?entity_id=…` i emituje `location-changed`. To nie steruje urządzeniem, ale prawdziwa karta w HA otwiera dialog i stronę historii. Podgląd przechwytuje te zachowania w lokalnym dzienniku. Fikcyjny `callService` w fixture tylko zapisuje argumenty; runner wykrywa także każdą próbę wyjścia poza dozwolone pliki i ją przerywa. Przebieg sprawdził też zatrzymanie nawigacji do `blocked.invalid`. Brak prób sieciowych podczas działania aplikacji.

Ilustracja jest wbudowanym SVG, a style są wstrzykniętym CSS; brak obrazów, zewnętrznych fontów lub bibliotek runtime. `ha-icon` i komponenty edytora pochodzą normalnie z Home Assistant, lecz odizolowany podgląd zastępuje wyłącznie `ha-icon` lokalną atrapą. Nie stwierdzono tokenów, prywatnych adresów ani identyfikatorów użytkownika w źródle. Fixture zawiera tylko syntetyczne ID `demo_*`.

## DOM, zdarzenia i edytor

Karta używa light DOM, `innerHTML` przy renderze początkowym/konfiguracji i aktualizuje kafelki tekstowo bez przebudowy DOM przy aktualizacji `hass`. Tytuł, model i ID encji trafiające do atrybutów są escapowane. Każdy kafelek dostaje listener kliknięcia, przycisk historii osobny listener. `ResizeObserver` jest tworzony przy podłączeniu i odłączany w `disconnectedCallback`. W źródle nie ma timerów ani interwałów. Ustawienie nowego configu ponownie renderuje kartę i przypisuje listenery do nowych elementów.

Edytor oferuje dwa pola tekstowe, pięć pickerów (trzy domeny `number`, jedna `sensor`, jedna `binary_sensor`) i trzy przełączniki: animacje, historia oraz aktualizacja. Wysyła `config-changed`. Ma dwa potwierdzone problemy do rozwiązania przed publicznym wydaniem:

1. Setter `hass` od razu renderuje. Gdy HA dostarczy `hass` przed `setConfig`, `render()` później indeksuje `this.config[key]`, choć config nie został ustawiony; odtworzony kontrakt rzucił `TypeError`.
2. Każda aktualizacja `hass` w edytorze ponownie ustawia całe `innerHTML`. Może utracić wpisywany tekst, fokus i stan kontrolek.

Podgląd nie ładuje ani nie symuluje prawdziwych `ha-entity-picker`, `ha-textfield` lub `ha-switch`; funkcjonalność edytora wymaga sprawdzenia w docelowym HA.

## Wyniki wykonane

Ograniczony zestaw podstawowy: **14/14 zaliczonych** — siedem sprawdzeń na desktopie (1440×1000) i siedem na telefonicznym viewportcie (390×844): izolacja, stan normalny, otwarte drzwi, brak encji, aktualizacja `hass` i zachowanie DOM, dokładne zdarzenia kontrolek oraz runtime/sieć. Pięć kliknięć kafelków wysłało dokładnie po jednym `hass-more-info` z oczekiwanym `entityId`; historia została wywołana raz z oczekiwanym URL. W obu widokach licznik `callService` wyniósł zero. Weryfikacja odbyła się przez klikanie Chromium, nie test dotykowy na telefonie.

Przeglądarka: lokalny Chromium headless 156.0.8078.4. Wynik maszynowy z fingerprintem źródła i suite jest ignorowanym `test-results/results.json`; zrzuty obu widoków są w `test-results/desktop.png` i `test-results/mobile.png`.

## Niewykonane

Nie przetestowano prawdziwego Home Assistant, rzeczywistej integracji Haier, prawdziwych usług/urządzeń, dialogów `more-info`, routingu historii ani komponentów edytora HA. Nie wykonano testu manualnego, testu na fizycznym telefonie, klawiatury screen readera, dużych fontów ani pełnego audytu dostępności. Nie weryfikowano innych modeli ani jednostek, HACS, CI, wymagań publikacji ani praw/licencji. Nie wykonano testów nieprawidłowych wartości, `last_updated`, czasu upływającego, zmiany konfiguracji w aktywnej karcie ani pozostałych wariantów responsive.

## Blokery wydania publicznego

- Edytor może rzucić wyjątek przy kolejności dostarczenia `hass`/config i gubi stan pól przy aktualizacji.
- Domyślne propozycje encji zależą od niemieckich nazw i modelowego ID.
- Komunikat „Verbunden” sugeruje pełną łączność także przy częściowo brakujących encjach; zakres jest nieokreślony.
- Czas „ostatniej aktualizacji” nie aktualizuje się bez zdarzenia `hass`; walidacja daty i parsowania temperatur jest łagodna.
- Nieustalona jest zgodność z rzeczywistym HA/integracją i modelami innych użytkowników. Należy ją potwierdzić w izolowanym frontendzie.
- Brak zatwierdzonej licencji i przeglądu praw do kodu/oznaczeń Haier. Nie dodano licencji.

Brak sekretów lub prywatnych danych w przygotowanych fixture i raporcie. Ocena bazuje na statycznym przeglądzie jednego pliku i wskazanym zestawie symulacji, nie jest certyfikacją integracji.
