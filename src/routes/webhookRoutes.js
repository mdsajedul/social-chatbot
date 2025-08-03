
const rotuer = require('express').Router();
const {verifyWebhookFacebook, handleWebhookFacebook} = require('../controllers/facebookController');
const {verifyWebhookWhatsapp, handleWebhookWhatsapp} = require('../controllers/whatsappController');


rotuer.get("/webhook", verifyWebhookFacebook);
rotuer.post("/webhook", handleWebhookFacebook);

rotuer.get("/webhook-whatsapp", verifyWebhookWhatsapp);
rotuer.post("/webhook-whatsapp", handleWebhookWhatsapp);


module.exports = rotuer;