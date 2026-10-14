import {
  AlgorithmParam,
  DataPoint,
  SavedPredictionState,
} from "../types/prediction.js";

/**
 * In-memory služba pro ukládání a čtení stavu poslední predikce.
 */
class StorageService {
  private lastState: SavedPredictionState | null = null;

  /**
   * Uloží výsledek predikce a použité parametry s aktuálním časovým razítkem.
   *
   * @param result Výsledná časová řada predikce (`DataPoint[]`).
   * @param params Pole parametrů algoritmu použitých při výpočtu (výchozí: `[]`).
   */
  public savePrediction = (
    result: DataPoint[],
    params: AlgorithmParam[] = [],
  ) => {
    this.lastState = {
      calculatedAt: new Date().toISOString(),
      params,
      result,
    };
  };

  /**
   * Získá naposledy uložený stav predikce.
   *
   * @returns Objekt `SavedPredictionState` s výsledkem a metadaty,
   *          nebo `null`, pokud zatím žádná predikce neproběhla.
   */
  public getLastPrediction = (): SavedPredictionState | null => {
    return this.lastState;
  };
}

export const storageService = new StorageService();
