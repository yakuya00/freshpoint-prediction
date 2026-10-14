import { Request, Response } from "express";
import { predict } from "../services/predictor.js";
import { storageService } from "../services/storage.js";

/**
 * Zpracuje data, vygeneruje novou predikci a uloží výsledek.
 *
 * @param req Express Request očekávající v těle (`req.body`):
 *   - `data`: Vstupní data pro predikční model.
 *   - `params`: Konfigurační parametry pro výpočet.
 * @param res Express Response vracející JSON s výsledkem predikce (HTTP 200).
 */
export const postPrediction = async (req: Request, res: Response) => {
  const { params, data } = req.body;

  const result = predict(data, params);
  storageService.savePrediction(result, params);

  res.status(200).json(result);
};

/**
 * Vrátí naposledy uloženou predikci z úložiště.
 *
 * @param req Express Request.
 * @param res Express Response vracející JSON s poslední predikcí (HTTP 200).
 */
export const getPrediction = async (req: Request, res: Response) => {
  const result = storageService.getLastPrediction();
  if (result != null) {
    res.status(200).json(result);
  } else {
    res.status(404).json({ error: "No calculation has been performed yet." });
  }
};
