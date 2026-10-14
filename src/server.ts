import express from "express";
import {
  postPrediction,
  getPrediction,
} from "./controllers/predict.controller.js";
import { validate } from "./middlewares/validate.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/prediction", getPrediction);
app.post("/prediction", validate, postPrediction);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
