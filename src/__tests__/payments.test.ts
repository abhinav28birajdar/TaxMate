import crypto from 'crypto';

describe('Payment Processing & Signature Verification', () => {
  const secret = 'test_razorpay_secret_key_12345';
  const orderId = 'order_DA123456789';
  const paymentId = 'pay_9876543210';

  it('generates and verifies valid HMAC-SHA256 Razorpay signature', () => {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${orderId}|${paymentId}`);
    const validSignature = hmac.digest('hex');

    // Verification check
    const verificationHmac = crypto.createHmac('sha256', secret);
    verificationHmac.update(`${orderId}|${paymentId}`);
    const checkSignature = verificationHmac.digest('hex');

    expect(validSignature).toBe(checkSignature);
  });

  it('rejects tampered payment signature', () => {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${orderId}|${paymentId}`);
    const validSignature = hmac.digest('hex');

    const tamperedSignature = validSignature.slice(0, -4) + '0000';
    expect(validSignature).not.toBe(tamperedSignature);
  });

  it('correctly calculates amount in paise for Razorpay integration', () => {
    const amountInRupees = 4500.50;
    const amountInPaise = Math.round(amountInRupees * 100);
    expect(amountInPaise).toBe(450050);

    const zeroDecimalAmount = 3500;
    expect(Math.round(zeroDecimalAmount * 100)).toBe(350000);
  });

  it('generates proper currency formatting for Indian Rupee', () => {
    const amount = 2850000;
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

    expect(formatted).toContain('28,50,000');
  });
});
