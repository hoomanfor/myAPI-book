require('dotenv').config();
const axios = require('axios');
const express = require('express');
const stripe = require('stripe')('sk_test_UQj253dJNoxIiCP4mjq2W7Pz00t51pPy3J');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

app.get('/checkout', (req, res) => res.sendFile(__dirname + '/checkout.html'))

app.get("/api/secret", (req, res) => {
    res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  });
  
  const calculateOrderAmount = items => {
    // Replace this constant with a calculation of the order's amount
    // You should always calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
  };
  
app.post("/api/pay", async (req, res) => {
    const { paymentMethodId, paymentIntentId, items, currency, useStripeSdk } = req.body;

    const orderAmount = calculateOrderAmount(items);

    try {
        let intent;
        if (paymentMethodId) {
        // Create new PaymentIntent with a PaymentMethod ID from the client.
        intent = await stripe.paymentIntents.create({
            amount: orderAmount,
            currency: currency,
            payment_method: paymentMethodId,
            confirmation_method: "manual",
            confirm: true,
            // If a mobile client passes `useStripeSdk`, set `use_stripe_sdk=true`
            // to take advantage of new authentication features in mobile SDKs
            use_stripe_sdk: useStripeSdk,
        });
        // After create, if the PaymentIntent's status is succeeded, fulfill the order.
        } else if (paymentIntentId) {
        // Confirm the PaymentIntent to finalize payment after handling a required action
        // on the client.
        intent = await stripe.paymentIntents.confirm(paymentIntentId);
        // After confirm, if the PaymentIntent's status is succeeded, fulfill the order.
        }
        res.send(generateResponse(intent));
    } catch (e) {
        // Handle "hard declines" e.g. insufficient funds, expired card, etc
        // See https://stripe.com/docs/declines/codes for more
        res.send({ error: e.message });
    }
});
  
  const generateResponse = intent => {
    // Generate a response based on the intent's status
    switch (intent.status) {
      case "requires_action":
      case "requires_source_action":
        // Card requires authentication
        return {
          requiresAction: true,
          clientSecret: intent.client_secret
        };
      case "requires_payment_method":
      case "requires_source":
        // Card was not properly authenticated, suggest a new payment method
        return {
          error: "Your card was denied, please provide a new payment method"
        };
      case "succeeded":
        // Payment is complete, authentication not required
        // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
        console.log("💰 Payment received!");
        return { clientSecret: intent.client_secret };
    }
  };

app.post('/api/access-token', (req, res) => {
    axios({
        url: "https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token",
        method: "post",
        data: "grant_type=client_credentials",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + process.env.AUTH_CODE
        }
    }).then(function(response) {
        res.json(response.data);
    }).catch(function(error) {
        console.log(error);
    })
});

app.post('/api/refresh-token', (req, res) => {
    const refreshToken = req.body.refresh_token;
    axios({
        url: "https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token",
        method: "post",
        data: "grant_type=client_credentials&refresh_token=" + refreshToken,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + process.env.AUTH_CODE
        }
    }).then(function(response) {
        res.json(response.data);
    }).catch(function(error) {
        console.log(error);
    })
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

