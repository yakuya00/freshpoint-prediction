# Freshpoint Sales Prediction API

Jednoduchá REST API služba pro predikci týdenních prodejů na 10 týdnů dopředu na základě historických dat časových řad.

---

## 1. Spuštění

### Požadavky

- Node.js v18+
- npm

```bash
npm install
npm start        # server běží na portu 3000
```

## 2. API

### POST `/predict`

Vstup: volitelné `params` a pole `data` (týdenní prodeje v kusech).
Výstup: `data` obsahující zpětné proložení historie (jedna hodnota pro každý vstupní týden) a dalších 10 týdnů predikce.

Pro 144 vstupních týdnů tedy odpověď obsahuje 154 záznamů.

### Parametry algoritmu

| Parametr | Výchozí | Význam                                                                                                 |
| -------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `alpha`  | 0.9     | Váha nové hodnoty při aktualizaci úrovně (0 až 1). Vyšší hodnota znamená rychlejší reakci.             |
| `beta`   | 0.8     | Rychlost aktualizace trendu (0 až 1).                                                                  |
| `phi`    | 0.9     | Tlumení trendu. Hodnota 1 znamená netlumený trend, nižší hodnota znamená rychlejší vyrovnání prognózy. |

### GET `/prediction`

Vrací poslední spočítanou predikci společně s použitými parametry a časem výpočtu (`calculatedAt`). Pokud ještě žádná predikce neproběhla, vrací 404.

## 3. Diskuze přístupů k predikci

Cílem case study bylo navrhnout a implementovat spolehlivý algoritmus pro predikci budoucích týdenních prodejů na 10 týdnů dopředu. Vzhledem k povaze vstupních dat (týdenní časové řady) a požadavku na vlastní implementaci bez závislosti na robustních externích frameworcích jsem analyzoval základní statistické přístupy vhodné pro tento typ úlohy:

### 1) Klouzavý průměr (Moving Average)

- **Výhody:** Jednoduchý a odolný vůči šumu.
- **Nevýhody:** Na rostoucí řadě ale systematicky zaostává a pro budoucnost dává konstantní hodnotu, takže růst vůbec nepromítne do prognózy.

### 2) Lineární regrese (nejmenší čtverce) na posledních N týdnech

- **Výhody:** Snadno vysvětlitelná a dobře extrapoluje trend.
- **Nevýhody:** Jedna přímka nezachytí změny tempa růstu a jednotlivé extrémní týdny (Vánoce, Velikonoce, Covid) ji výrazně vychylují, protože se chyby umocňují.

### 3) Exponenciální vyhlazování

Rodina metod, které udržují odhad úrovně a trendu a s každým týdnem je upravují podle nové hodnoty.

- **Výhody:** Přiděluje exponenciálně klesající váhu starším pozorováním, s rozšířením o trendovou složku dokáže modelovat směr vývoje.
- **Nevýhody:** Vyžaduje citlivou kalibraci vyhlazovacích parametrů, aby nedocházelo k přestřelení extrapolace při delším horizontu predikce.

### Zvolené řešení

Implementoval jsem **Holtovu metodu s tlumeným trendem**, která je jedním z druhů exponenciálního vyhlazování. V každém týdnu `t` se provedou tři kroky:

```
odhad:   ŷ_t = level + phi * trend
level:   level_t = alpha * y_t + (1 - alpha) * ŷ_t
trend:   trend_t = beta * (level_t - level_(t-1)) + (1 - beta) * phi * trend_(t-1)
```

Odhady `ŷ_t` pro historické týdny tvoří zpětné proložení požadované zadáním. Pro `h` týdnů dopředu platí:

```
ŷ_(n+h) = level_n + (phi + phi^2 + ... + phi^h) * trend_n
```

Důvod výběru: metoda zachycuje směr růstu, na rozdíl od regrese se průběžně přizpůsobuje a tlumení udržuje prognózu realistickou na horizontu 10 týdnů.

## 4. Vyhodnocení a validace

Kvalita modelu byla ověřena zpětným testováním (backtestingem) na dodaných historických datech.

- **Metodika:** Posledních 10 týdnů řady bylo vyjmuto jako testovací sada. Model byl natrénován na předchozím období a predikoval těchto 10 skrytých týdnů.
- **Metrika:** MAPE (Mean Absolute Percentage Error).
- **Výchozí parametry:** `alpha = 0.9`, `beta = 0.8`, `phi = 0.88`. Hodnoty jsem zvolil na základě výsledku na posledních 10 týdnech.
- **Výsledek:** MAPE na tomto testovacím vzorku je **4.67 %**.

### Omezení tohoto vyhodnocení

Výsledek 4.67 % platí pro jedno konkrétní okno (posledních 10 týdnů) a pro parametry laděné právě na něm. Neověřoval jsem ho na dalších oknech. Při jiných parametrech nebo na delším úseku historie se výsledek může výrazně změnit, protože agresivní nastavení (vysoké alpha a beta) rychle reaguje na poslední týdny, ale je citlivé na výkyvy (svátky, anomálie poptávky).

## 5. Známá omezení

- **Výjimečné týdny nejsou ošetřeny.** Vánoce, Velikonoce, jaro 2020 (COVID) a jednotlivé výpadky ovlivňují odhady úrovně a trendu.
- **Sezónnost není modelována**.
- **Ukládání je v paměti.** Po restartu serveru `GET /prediction` nevrací nic, dokud neproběhne nové volání `/predict`.
