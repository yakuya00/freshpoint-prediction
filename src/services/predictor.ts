import { DataPoint, AlgorithmParam } from "../types/prediction.js";

/**
 * Bezpečně vyhledá a načte číselnou hodnotu parametru podle názvu.
 * Pokud parametr neexistuje nebo nemá číselnou hodnotu, vrátí výchozí hodnotu.
 *
 * @param params Pole dostupných parametrů algoritmu.
 * @param name Název hledaného parametru (např. 'alpha', 'beta', 'phi').
 * @param def Výchozí hodnota (fallback), pokud parametr nebyl nalezen.
 * @returns Číselná hodnota parametru nebo výchozí hodnota.
 */
const getParam = (
  params: AlgorithmParam[] | undefined,
  name: string,
  def: number,
): number => {
  const p = params?.find((x) => x.name === name);
  return typeof p?.value === "number" ? p.value : def;
};

/**
 * Přičte k zadanému ISO datu specifikovaný počet týdnů.
 *
 * @param date Výchozí datum ve formátu ISO 8601.
 * @param weeks Počet týdnů k přičtení.
 * @returns Nové datum ve formátu ISO 8601 řetězce.
 */
const addWeeks = (date: string, weeks: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + 7 * weeks);
  return d.toISOString();
};

/**
 * Počítá vyhlazení a predikci časové řady pomocí tlumené Holtovy metody
 * (Damped Holt's Linear Trend Exponential Smoothing).
 *
 * Model nejprve prochází historická data (in-sample fitted values) a následně
 * vygeneruje predikci na dalších 10 týdnů dopředu (out-of-sample forecast).
 *
 * @param data Pole historických bodů časové řady (`DataPoint[]`). Očekává se chronologické seřazení.
 * @param params Volitelné konfigurační parametry algoritmu (`alpha`, `beta`, `phi`).
 * @returns Původní vyhlazená řada doplněná o 10 budoucích predikovaných bodů s týdenním krokem.
 */
export const predict = (data: DataPoint[], params?: AlgorithmParam[]) => {
  const alpha = getParam(params, "alpha", 0.9);
  const beta = getParam(params, "beta", 0.8);
  const phi = getParam(params, "phi", 0.9);

  let level: number = data[0].value;
  let trend: number = 0;

  const result: DataPoint[] = [];
  for (const item of data) {
    const guess = level + phi * trend;
    result.push({ timestamp: item.timestamp, value: Math.round(guess) });

    const prevLevel = level;
    level = alpha * item.value + (1 - alpha) * guess;
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  const lastDate = data[data.length - 1].timestamp;

  let trendSum = 0;
  for (let i = 1; i <= 10; i++) {
    trendSum += Math.pow(phi, i);
    result.push({
      timestamp: addWeeks(lastDate, i),
      value: Math.round(level + trendSum * trend),
    });
  }

  return result;
};
