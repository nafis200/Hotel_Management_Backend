<!-- stripe -->

<!-- documentation -->

<!-- developers/documentation -->

<!-- create stripe at payment -->

<!-- Accpet online payment -->

<!-- copy secret key -->

<!-- helper create stripe.ts  -->

<!-- different api or create appointment then initiate -->

<!-- webhooks -->

<!-- https://docs.stripe.com/webhooks/quickstart -->

<!-- webhook code -->

<!-- for verify -->
<!-- paid or unpaid -->
<!-- different module -->
<!-- payment no routes -->

<!-- stripe dashboard to take webhooks -->

<!-- developers webhooks -->

<!-- Add destination -->

<!-- select all events -->

<!-- webhook endpoints -->

<!-- continue -->

<!-- webhooks sent request but our backend cors not pass so we make route at app before cors  -->

<!-- app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent
); -->

at app



<!-- test local webhooks -->

<!-- download stripe Cli -->

<!-- download the zip file -->

<!-- stripe login --> (cmd command)

<!-- cmd command -->

<!-- access success -->

Please note: this key will expire after 90 days, at which point you'll need to re-authenticate.

<!-- paste this -->

stripe listen --forward-to localhost:4242/webhook

but my port 5000 and app.ts use /webhook

if use payment/webhook then link is 

<!-- stripe listen --forward-to localhost:4242/payment/webhook -->

my port is 

stripe listen --forward-to localhost:5000/webhook

<!-- get a secret -->

<!-- secret key must be running webhook for listen forward at server -->

run only for localhost server is just give url link

<!-- very very important -->

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

sstripe verify want raw data but express.json make it javascript object so error

<!-- dashboard er events theke dekha jay -->