const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createDonation = async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_order_${Math.random() * 1000}`,
      payment_capture: 1,
    });
    res.status(200).json({ orderId: order.id, currency: order.currency, amount: order.amount });
  } catch (err) {
    res.status(500).json({ message: 'Order creation failed', error: err.message });
  }
};

exports.verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    res.status(200).json({ message: 'Payment verification successful' });
  } else {
    res.status(400).json({ message: 'Invalid signature' });
  }
};
