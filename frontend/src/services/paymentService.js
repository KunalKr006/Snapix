import api from './api';

/**
 * Create a Razorpay payment order for a wallpaper
 * @param {string} wallpaperId - The ID of the wallpaper to purchase
 * @returns {Promise<Object>} Order details including Razorpay order ID
 */
export const createPaymentOrder = async (wallpaperId) => {
  try {
    const response = await api.post(`/api/payments/create-order/${wallpaperId}`);
    return response.data;
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};

/**
 * Verify payment after successful Razorpay transaction
 * @param {Object} paymentData - Payment verification data from Razorpay
 * @returns {Promise<Object>} Verification result
 */
export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post('/api/payments/verify-payment', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Check if user has already paid for a wallpaper
 * @param {string} wallpaperId - The ID of the wallpaper
 * @returns {Promise<Object>} Payment status
 */
export const checkPaymentStatus = async (wallpaperId) => {
  try {
    const response = await api.get(`/api/payments/status/${wallpaperId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

/**
 * Get user's payment history
 * @returns {Promise<Array>} Array of user's payments
 */
export const getPaymentHistory = async () => {
  try {
    const response = await api.get('/api/payments/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};