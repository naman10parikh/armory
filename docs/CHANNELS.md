# Channels

Armory answers on three channels, each running the same ranked catalog search (`web/src/lib/ask-core.ts`):
the web at `/ask`, email, and SMS/WhatsApp. The site's `/identity` page (titled Channels) shows which are
configured: it reads `ARMORY_EMAIL`, `TWILIO_PHONE_NUMBER` and `TWILIO_WHATSAPP_NUMBER`, and says
"Not Configured" for any that is unset.

## Wiring email and SMS/WhatsApp

The page lists two webhook endpoints, `<site>/api/inbound/email` and `<site>/api/inbound/sms`. Paste the
first into the AgentMail console as the `message.received` destination, the second into the Twilio console
as the incoming-message handler for both the SMS number and the WhatsApp sender.
