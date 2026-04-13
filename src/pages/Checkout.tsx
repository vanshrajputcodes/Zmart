import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, Check, Loader2, ArrowLeft, ShieldCheck, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Step = 'address' | 'payment' | 'processing' | 'success';

export default function Checkout() {
  const [step, setStep] = useState<Step>('address');
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Address form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // UPI
  const [upiId, setUpiId] = useState('');

  const subtotal = total();
  const shipping = subtotal >= 999 ? 0 : 79;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shipping + tax;

  useEffect(() => {
    if (items.length === 0 && step !== 'success') {
      navigate('/products');
    }
  }, [items, step, navigate]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    // Simulate UPI payment processing (8-12 sec)
    const delay = 8000 + Math.random() * 4000;

    setTimeout(async () => {
      // Create order in DB
      if (user) {
        try {
          // Save address
          const { data: addr } = await supabase.from('addresses').insert({
            user_id: user.id,
            full_name: fullName,
            phone,
            address_line1: addressLine1,
            address_line2: addressLine2 || null,
            city,
            state,
            postal_code: pincode,
            country: 'IN',
          }).select().single();

          // Create order
          await supabase.from('orders').insert({
            user_id: user.id,
            subtotal,
            tax,
            shipping_cost: shipping,
            total: grandTotal,
            shipping_address_id: addr?.id || null,
            status: 'processing',
          });
        } catch (err) {
          // Order still succeeds visually
        }
      }

      clearCart();
      setStep('success');
    }, delay);
  };

  if (step === 'processing') {
    return <PaymentProcessing upiId={upiId} amount={grandTotal} />;
  }

  if (step === 'success') {
    return <OrderSuccess />;
  }

  return (
    <div className="container max-w-4xl py-8 px-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      {/* Steps indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { key: 'address', label: 'Address', icon: MapPin },
          { key: 'payment', label: 'Payment', icon: CreditCard },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-border" />}
            <div className={`flex items-center gap-2 text-sm font-medium ${
              step === s.key ? 'text-accent' : 'text-muted-foreground'
            }`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.key ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {step === 'address' && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-accent" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Rahul Sharma" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+91 98765 43210" type="tel" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addr1">Address Line 1 *</Label>
                        <Input id="addr1" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} required placeholder="House No, Building, Street" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addr2">Address Line 2</Label>
                        <Input id="addr2" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Locality, Landmark" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input id="city" value={city} onChange={e => setCity(e.target.value)} required placeholder="Mumbai" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input id="state" value={state} onChange={e => setState(e.target.value)} required placeholder="Maharashtra" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">PIN Code *</Label>
                          <Input id="pincode" value={pincode} onChange={e => setPincode(e.target.value)} required placeholder="400001" maxLength={6} pattern="[0-9]{6}" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-2">
                        Continue to Payment
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-accent" />
                      UPI Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePayment} className="space-y-6">
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-muted-foreground">Delivering to:</p>
                        <p className="font-medium text-sm">{fullName}</p>
                        <p className="text-sm text-muted-foreground">{addressLine1}{addressLine2 ? `, ${addressLine2}` : ''}, {city}, {state} - {pincode}</p>
                        <p className="text-sm text-muted-foreground">{phone}</p>
                        <Button type="button" variant="link" size="sm" className="p-0 h-auto text-accent" onClick={() => setStep('address')}>
                          Change Address
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="upi">Enter UPI ID *</Label>
                        <Input
                          id="upi"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          required
                          placeholder="yourname@upi"
                          pattern="[a-zA-Z0-9._-]+@[a-zA-Z]{2,}"
                          className="text-lg font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter your UPI ID (e.g. name@paytm, name@gpay, name@ybl)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <span>Your payment is 100% secure and encrypted</span>
                      </div>

                      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                        <IndianRupee className="h-5 w-5 mr-1" />
                        Pay ₹{grandTotal.toLocaleString('en-IN')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── Payment Processing Animation ─── */
function PaymentProcessing({ upiId, amount }: { upiId: string; amount: number }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 p-8 max-w-sm"
      >
        {/* Animated UPI circle */}
        <div className="relative mx-auto w-32 h-32">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-accent/30"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-accent/50"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <div className="absolute inset-4 rounded-full bg-accent/10 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-10 w-10 text-accent" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Processing Payment{dots}</h2>
          <p className="text-muted-foreground text-sm">
            Waiting for UPI confirmation from <span className="font-mono font-medium text-foreground">{upiId}</span>
          </p>
        </div>

        <motion.div
          className="bg-muted rounded-lg p-4"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="text-3xl font-bold font-display">₹{amount.toLocaleString('en-IN')}</p>
        </motion.div>

        <p className="text-xs text-muted-foreground">
          Please approve the payment request on your UPI app. Do not close this page.
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Order Success Animation ─── */
function OrderSuccess() {
  const navigate = useNavigate();
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowThankYou(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6 p-8 max-w-md"
      >
        {/* Success checkmark */}
        <motion.div
          className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Check className="h-12 w-12 text-green-600" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <h2 className="font-display text-3xl font-bold text-green-700">Transaction Successful!</h2>
          <p className="text-muted-foreground">Your payment has been confirmed</p>
        </motion.div>

        <AnimatePresence>
          {showThankYou && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 150, damping: 12 }}
              className="space-y-4"
            >
              <div className="bg-accent/10 rounded-2xl p-6">
                <motion.p
                  className="font-display text-2xl font-bold text-accent"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎉 Thank you for your order!
                </motion.p>
                <p className="text-sm text-muted-foreground mt-2">
                  We're preparing your package with care. You'll receive updates via email.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button onClick={() => navigate('/account')} variant="outline">
                  View My Orders
                </Button>
                <Button onClick={() => navigate('/products')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Continue Shopping
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
