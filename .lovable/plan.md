# Report di fattibilità: sì, è fattibile

Ho letto `BOMB-CON_Volume01.jsx` (605 righe): è un componente React autonomo che disegna in SVG il profilo del serbatoio (cono + virola + fondo bombato) con i campi di input posizionati direttamente sul disegno, dentro riquadri collegati da callout, più le quote laterali a catena e il riquadro capacità.

Tutto quello che il file contiene è compatibile con lo stack attuale (React + SVG inline, nessuna libreria nuova). Il lavoro reale non è il disegno, ma l'aggancio delle sue variabili al modello dati e al motore di calcolo già esistenti.

## Corrispondenza variabili (file allegato → app)

| File allegato | App (`TankInput`) | Note |
|---|---|---|
| `dInt` | `dInt` | 1:1 |
| `lCil` | `lCil` | 1:1 |
| `tipoFondo` klopper / korbbogen / custom | `coperchio.type` decinormale / pseudoellittico / custom | Klopper (R=1,0·D, r=0,100·D) coincide esattamente con "decinormale". Korbbogen DIN 28013 è R=0,8·D / r=0,154·D, mentre lo "pseudoellittico" attuale è R=0,833·D / r=0,156·D: sono standard diversi, quindi vanno tenuti come **due voci separate** nel menu (non fusi), altrimenti cambierebbero i volumi già calcolati |
| `rBombatura` / `rToro` | `coperchio.R_custom` / `r_custom` | attivi solo su "Fuori Standard" |
| `hCollettoCoperchio`, `spCoperchio` | `coperchio.hColletto`, `coperchio.sp` | 1:1 |
| `angolo`, `rRaccordoCono`, `hCollettoCono`, `spCono` | `fondo.hCono` (via angolo), `fondo.rRaccordo`, `fondo.hColletto`, `fondo.sp` | vedi sotto |
| `spVirola` | *non esiste* | l'app oggi non ha uno spessore per la virola; lo aggiungo come campo informativo/visivo oppure lo omettiamo |

## Due differenze tecniche da sistemare (nessuna bloccante)

1. **Orientamento del disegno.** Nel file il cono è in alto e il bombato in basso. Nell'app il fondo conico è **in basso** e il coperchio bombato **in alto**: ribalto il path SVG e la posizione di riquadri/callout.
2. **Formule di altezza.** Il file usa formule semplificate (`hCono = (D/2 − r_racc)·tan θ + colletto`, che trascura l'alzata verticale del raccordo). L'app usa il modello a 7 zone con bisezione in `calculations.ts`, che è più preciso e già validato. Quindi: **il disegno diventa solo interfaccia**, mentre altezze, volumi e capacità mostrate nei riquadri vengono prese da `calculateTank()`, non ricalcolate localmente. Così lo schema resta coerente al millimetro con tabella di taratura e PDF.

## Cosa farò

1. Nuovo componente `src/app/components/GeometrySchema.tsx`: porting in TypeScript del disegno SVG allegato (path, quote a catena, callout, riquadri, sotto-componente `MiniField`), ribaltato con cono in basso, con stile allineato al design system e font scalati come il resto dell'app.
2. Props tipizzate: riceve `TankInput` e emette `onChange` sui campi, senza stato duplicato — unica fonte di verità resta lo stato del wizard in `App.tsx`.
3. Altezze/volumi mostrati sul disegno (h coperchio, h cono, h totale, capacità in litri) letti dal risultato di `calculateTank`, arrotondati come già avviene altrove.
4. Doppia modalità altezza/angolo del fondo conico mantenuta: il campo "angolo" sul disegno resta sincronizzato con `hCono` (colletto incluso) usando la stessa conversione già implementata oggi.
5. `App.tsx`, step 3: al posto dell'attuale form numerico viene renderizzato lo schema. Sotto al disegno resta il pannello **Verifica coerenza altezze interne** e la nota "tutte le misure sono interne".
6. Responsività: il disegno è 640×520 in viewBox, quindi scala; su viewport stretti (come i 698 px attuali) va in colonna con scroll orizzontale controllato.
7. Il resto del wizard (step 1, 2, 4-7), PDF, tabella di taratura e salvataggi restano invariati.

## Cosa NON cambia
Nessuna modifica a `calculations.ts`, `pdfGenerator.ts`, ai tipi salvati o ai serbatoi già memorizzati: cambia solo il modo di inserire i dati.
