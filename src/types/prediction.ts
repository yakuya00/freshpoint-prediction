/**
 * Reprezentuje jeden časový bod (pozorování nebo predikci) v časové řadě.
 */
export interface DataPoint {
  timestamp: string;
  value: number;
}

/**
 * Konfigurační parametr předávaný predikčnímu algoritmu.
 */
export interface AlgorithmParam {
  name: string;
  value: number | string;
}

/**
 * Kompletní perzistentní stav naposledy provedeného výpočtu predikce.
 */
export interface SavedPredictionState {
  calculatedAt: string;
  params: AlgorithmParam[];
  result: DataPoint[];
}
