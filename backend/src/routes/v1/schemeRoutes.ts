import { Router } from "express";
import { schemeController } from "../../controllers/schemeController";

const router = Router();

router.get("/", (req, res) => schemeController.getSchemes(req, res));
router.get("/:idOrSlug", (req, res) => schemeController.getSchemeDetails(req, res));
router.post("/:idOrSlug/check-eligibility", (req, res) => schemeController.checkEligibility(req, res));

export default router;
