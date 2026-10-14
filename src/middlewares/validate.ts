import { Request, Response, NextFunction } from "express";

/**
 * Express middleware pro validaci vstupních dat časové řady.
 *
 * Kontroluje:
 * 1. Zda tělo požadavku obsahuje neprázdné pole `data`.
 * 2. Zda každý prvek pole obsahuje číselnou hodnotu `value` a platné datum `timestamp`.
 *
 * @param req Express Request očekávající v těle (`req.body`):
 *   - `data`: Neprázdné pole objektů `{ timestamp: string, value: number }`.
 * @param res Express Response vracející HTTP 400 při neplatném formátu.
 * @param next Funkce pro předání řízení dalšímu middleware/handleru.
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const { data } = req.body;
  if (!data || !Array.isArray(data) || data.length === 0) {
    return res
      .status(400)
      .json({ error: 'Body must contain non-empty "data" array.' });
  }

  const isInvalid = data.some(
    (point) =>
      typeof point.value !== "number" || isNaN(Date.parse(point.timestamp)),
  );
  if (isInvalid) {
    return res.status(400).json({
      error:
        'Each data item must have a valid ISO "timestamp" and numeric "value".',
    });
  }

  next();
};
