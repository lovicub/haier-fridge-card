# Propozycja etapów publikacji

## 1. Analiza i izolacja — bieżący etap

Zachować oryginalny JS w lokalnym commicie; przygotować offline fixture, testy i AUDIT.md. Bez zmian działania lub wyglądu, bez GitHub, release i wyboru licencji. Wyniki zachowania nie są deklaracją zgodności z pełnym frontendem HA.

## 2. Przenośna konfiguracja i stabilny edytor — proponowane następne zadanie

Najpierw zatwierdzić zakres zmian funkcjonalnych. Usunąć zależność stubu od modelowych identyfikatorów i dopasowania przypadkowych niemieckich nazw. Zapewnić jawny wybór encji z właściwej jednostki urządzenia; pozostawić aliasy kompatybilności. Obsłużyć obie kolejności `hass`/`setConfig` edytora i zachować jego DOM/fokus podczas aktualizacji HA. Dodać testy regresji odpowiadające wykrytym defektom. Nie zmieniać stylu karty przy tej pracy.

Kryterium: brak wyjątku dla `hass` przed konfiguracją, brak utraty edytowanego pola przy aktualizacji, konfiguracja innego modelu bez ręcznego wyszukiwania modelowych nazw; istniejące testy karty nadal przechodzą.

## 3. Semantyka danych i zgodność HA

Ustalić komunikat częściowej dostępności, ścisłość walidacji temperatur i dat oraz odświeżanie czasu ostatniej zmiany. Potwierdzić docelową wersję HA, działanie `ha-entity-picker`, `ha-textfield`, `ha-switch`, ikon, `hass-more-info` i historii w odizolowanym pełnym frontendzie. Zweryfikować ograniczenia domen edytora i scenariusze dla innych integracji. Sprawdzić mobilny kontener 360–519 px (dwie kolumny), długie nazwy, klawiaturę, kontrast i reduced motion. Nie sterować urządzeniami.

## 4. Pakiet repozytorium do przeglądu

Przygotować dokumentację użytkownika z fikcyjnym YAML, opisem encji, instalacji ręcznej, opcjami i zakresem zgodności; CHANGELOG, sensowną wersję wydania, CI oraz materiały prezentacyjne z fixture. Zweryfikować historię Git, pliki i artefakty pod kątem prywatności. Ustalić autorstwo i prawa do źródła, grafiki/marki oraz decyzję właściciela o licencji — licencja nie jest wybrana w tym etapie. Zdecydować, czy i kiedy przygotować HACS; nie deklarować zgodności bez walidacji wymagań.

## 5. Publikacja dopiero jako osobne zadanie

Po przeglądzie przygotowanego pakietu i wyraźnej autoryzacji utworzyć/podłączyć repozytorium GitHub, wysłać commity, następnie osobno przygotować tag i release. Przed publikacją potwierdzić zawartość artefaktu, wersję i wyniki wymaganych kontroli. Nie wykonywano tych czynności w etapie 1.
