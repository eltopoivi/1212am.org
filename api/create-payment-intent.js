const stripe = require('stripe')('sk_test_51OSyRzJBofJrA2IJcTBY5PMi7iBGPSYj7NJYuehSja0JlfnHHnlSZ50D1UXe92vFFYiTk50Dh1FeNAysyswq6ppR00pW7m0Xua');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { items } = req.body;
      
      // Calculamos el total en el servidor por seguridad (para que nadie modifique el precio en el navegador)
      let totalAmount = 0;
      items.forEach(item => {
        totalAmount += (item.price * item.qty);
      });

      // Stripe requiere el precio en centavos (ej: $39.00 -> 3900)
      const amountInCents = Math.round(totalAmount * 100);

      // Creamos el intento de pago
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Le devolvemos el "secreto del cliente" al frontend para que abra el formulario
      res.status(200).send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
