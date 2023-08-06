import { Router } from "express";
import { identify } from "../controller/index.controller";
const router = Router();

router.post("/identify", identify);

export default router;
