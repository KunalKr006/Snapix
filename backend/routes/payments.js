const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { auth } = require('../middleware/auth');
const Wallpaper = require('../models/Wallpaper');
const Payment = require('../models/Payment');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
router.post('/create-order/:wallpaperId', auth, async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.wallpaperId);
    if (!wallpaper) {
      return res.status(404).json({ message: 'Wallpaper not found' });
    }

    // Check if wallpaper is free
    if (!wallpaper.price || wallpaper.price === 0) {
      return res.status(400).json({ message: 'This wallpaper is free to download' });
    }

    // Check if user already has a payment for this wallpaper
    const existingPayment = await Payment.findOne({
      user: req.user.id,
      wallpaper: wallpaper._id
    });

    if (existingPayment) {
      if (existingPayment.status === 'completed') {
        return res.status(400).json({ message: 'You have already paid for this wallpaper' });
      }
      // If pending or failed, delete it and create a new order
      await Payment.deleteOne({ _id: existingPayment._id });
    }

    // Convert price to paise (Razorpay works with paise)
    const amountInPaise = Math.round(wallpaper.price * 100);

    // Generate a unique receipt within 40 character limit
    const shortId = req.user.id.slice(-8); // Last 8 chars of user ID
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const receipt = `rcpt_${shortId}_${timestamp}`.slice(0, 40); // Ensure under 40 chars

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      payment_capture: 1, // Auto capture
    };

    const order = await razorpay.orders.create(options);

    // Create payment record in database
    const payment = new Payment({
      user: req.user.id,
      wallpaper: wallpaper._id,
      razorpayOrderId: order.id,
      amount: wallpaper.price,
      status: 'pending'
    });

    await payment.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      wallpaper: {
        _id: wallpaper._id,
        title: wallpaper.title,
        price: wallpaper.price
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

// Verify payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: 'completed'
      },
      { new: true }
    ).populate('wallpaper');

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    res.json({
      message: 'Payment verified successfully',
      payment: {
        _id: payment._id,
        wallpaper: payment.wallpaper.title,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// Check payment status for a wallpaper
router.get('/status/:wallpaperId', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      user: req.user.id,
      wallpaper: req.params.wallpaperId,
      status: 'completed'
    });

    res.json({
      hasPaid: !!payment,
      payment: payment ? {
        _id: payment._id,
        amount: payment.amount,
        createdAt: payment.createdAt
      } : null
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ message: 'Error checking payment status' });
  }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.id,
      status: 'completed'
    })
    .populate('wallpaper', 'title imageUrl')
    .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ message: 'Error fetching payment history' });
  }
});

module.exports = router;