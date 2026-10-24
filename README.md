# Haier Fridge Premium Card — przygotowanie wydania

Źródło: `haier-fridge-card.js`, deklarowana wersja 5.0.0. Na tym etapie zachowano oryginalny kod. [AUDIT.md](AUDIT.md) opisuje zachowanie, ograniczenia i wyniki; [ROADMAP.md](ROADMAP.md) proponuje kolejne etapy.

## Bezpieczny podgląd

W katalogu projektu:

```sh
python3 preview/serve.py
```

Otwórz `http://127.0.0.1:8123`. Zatrzymaj przez Ctrl+C. Opcjonalnie: `--port 8124`.

Serwer nasłuchuje wyłącznie na loopback i udostępnia pięć jawnie dozwolonych plików (w tym stronę główną). Nie udostępnia `.git`, raportów ani dowolnych ścieżek. Nie przekazuje żądań dalej. CSP blokuje połączenia, ramki, workery, formularze, obrazy i fonty sieciowe. Atrapy transportów blokują fetch/XHR/WebSocket/EventSource/beacon/WebRTC/WebTransport/workery. Dane są fikcyjne. `callService` tylko rejestruje argumenty; pozostałe API HA odrzucają wywołania. Przyciski karty zapisują zdarzenia w dzienniku zamiast otwierać prawdziwy HA. Ikony są lokalnymi symbolami zastępczymi; nie są reprodukcją ikon HA. Podgląd nie ładuje komponentów edytora HA.

Nie podawaj tokenów, adresów HA ani danych prawdziwych urządzeń. Nie otwieraj pliku HTML przez `file://`, bo pomija to nagłówki CSP serwera. Kod izolacji jest przeznaczony dla przejrzanego źródła, nie stanowi sandboxu do uruchamiania złośliwych skryptów.

## Testy przeglądarkowe

Wymagania: Python, Playwright i jego Chromium oraz lokalne czcionki systemowe. Instalacja zależności wymaga dostępu do Internetu; same testy są offline:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r tests/requirements.txt
.venv/bin/python -m playwright install chromium --only-shell
.venv/bin/python tests/run.py
```

Na Linuksie mogą być wymagane biblioteki systemowe Chromium i fonty (np. DejaVu). Runner akceptuje `--executable /sciezka/do/chromium` lub zmienną `CHROMIUM_EXECUTABLE`. Nie trzeba uruchamiać serwera: przeglądarka otrzymuje lokalne bajty plików pod fikcyjną domeną, a każde inne żądanie jest przerywane. Service workers są wyłączone. Test izolacji poprzedza interakcje. Końcowy wynik i zrzuty trafiają do ignorowanego `test-results/`. Niezerowy kod wyjścia oznacza niepowodzenie. Zestaw obejmuje podstawowe scenariusze karty w dwóch viewportach; nie sprawdza pełnego edytora HA.

Polecenie użyte w obecnym środowisku (istniejący runtime, bez instalowania zależności):

```sh
FONTCONFIG_FILE=/home/adam/.cache/aigosmart-v014b3/fonts.conf \
LD_LIBRARY_PATH=/home/adam/.cache/aigosmart-v014b3/libs/root/usr/lib/x86_64-linux-gnu \
PYTHONPATH=/home/adam/.cache/aigosmart-v014b3/runtime \
/home/adam/projects/aigosmart/.venv/bin/python tests/run.py \
  --executable /home/adam/.cache/aigosmart-v014b3/browsers/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell
```

Te ścieżki dotyczą wyłącznie narzędzi lokalnego środowiska. W typowej instalacji użyj polecenia `.venv/bin/python tests/run.py`.
