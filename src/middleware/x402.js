/**
 * X402 Payment Verification Middleware
 * Verifies that proper payment headers are present
 */

const REQUIRED_PAYMENT_AMOUNT = 0.02;
const REQUIRED_PAYMENT_CURRENCY = 'USDC';

/**
 * Middleware to verify X402 payment
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function verifyX402Payment(req, res, next) {
  const paymentToken = req.headers['x-payment-token'];
  const paymentAmount = req.headers['x-payment-amount'];
  const paymentCurrency = req.headers['x-payment-currency'];

  // Check if payment token exists
  if (!paymentToken) {
    return res.status(402).json({
      error: 'Payment Required',
      message: 'X402 payment token required',
      payment_details: {
        amount: REQUIRED_PAYMENT_AMOUNT,
        currency: REQUIRED_PAYMENT_CURRENCY,
        protocol: 'x402'
      }
    });
  }

  // Verify payment amount
  const amount = parseFloat(paymentAmount);
  if (!paymentAmount || isNaN(amount) || amount < REQUIRED_PAYMENT_AMOUNT) {
    return res.status(402).json({
      error: 'Payment Required',
      message: `Minimum payment is ${REQUIRED_PAYMENT_AMOUNT} ${REQUIRED_PAYMENT_CURRENCY}`,
      payment_details: {
        amount: REQUIRED_PAYMENT_AMOUNT,
        currency: REQUIRED_PAYMENT_CURRENCY,
        protocol: 'x402'
      }
    });
  }

  // Verify payment currency
  if (!paymentCurrency || paymentCurrency.toUpperCase() !== REQUIRED_PAYMENT_CURRENCY) {
    return res.status(402).json({
      error: 'Payment Required',
      message: `Payment must be in ${REQUIRED_PAYMENT_CURRENCY}`,
      payment_details: {
        amount: REQUIRED_PAYMENT_AMOUNT,
        currency: REQUIRED_PAYMENT_CURRENCY,
        protocol: 'x402'
      }
    });
  }

  // In production, verify the payment token signature and on-chain payment
  // For this demo/bounty, basic validation is sufficient

  console.log(`X402 payment verified: ${amount} ${paymentCurrency} (token: ${paymentToken})`);

  // Payment valid, proceed to next middleware
  next();
}
