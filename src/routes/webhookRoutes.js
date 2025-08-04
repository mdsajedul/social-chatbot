const router = require('express').Router();
const {verifyWebhookFacebook, handleWebhookFacebook} = require('../controllers/facebookController');
const {verifyWebhookWhatsapp, handleWebhookWhatsapp} = require('../controllers/whatsappController');


router.get("/webhook", verifyWebhookFacebook);
router.post("/webhook", handleWebhookFacebook);

router.get("/webhook-whatsapp", verifyWebhookWhatsapp);
router.post("/webhook-whatsapp", handleWebhookWhatsapp);


module.exports = router;