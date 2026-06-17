const Razorpay = require('razorpay');
require('dotenv').config({ path: '.env.local' });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function test() {
  try {
    const order = await razorpay.orders.create({
      amount: 1000000,
      currency: 'INR',
      notes: {
        user_id: '1',
        invoice_id: '123',
        service_id: '',
        description: 'Invoice KS-2026-0001 — Service Payment',
      },
    });
    console.log("SUCCESS:", order);
  } catch (err) {
    console.error("ERROR:", JSON.stringify(err, null, 2));
  }
}

test();
