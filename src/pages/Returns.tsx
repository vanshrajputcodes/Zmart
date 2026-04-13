import { motion } from 'framer-motion';
import { RotateCcw, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const steps = [
  { step: 1, title: 'Request Return', desc: 'Go to Order History → Select the item → Click "Return"' },
  { step: 2, title: 'Pack the Item', desc: 'Use original packaging if possible. Include the invoice.' },
  { step: 3, title: 'Schedule Pickup', desc: 'Our delivery partner will pick up within 2 business days.' },
  { step: 4, title: 'Refund Processed', desc: 'Refund credited within 5-7 business days after quality check.' },
];

export default function Returns() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Returns & Refunds</h1>
        <p className="text-muted-foreground mb-10">Hassle-free returns within 7 days of delivery. Your satisfaction is our priority.</p>
      </motion.div>

      {/* Policy highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Clock, label: '7-Day Returns', desc: 'From delivery date' },
          { icon: RotateCcw, label: 'Free Returns', desc: 'No return shipping fee' },
          { icon: CheckCircle2, label: 'Easy Process', desc: 'Doorstep pickup' },
          { icon: AlertTriangle, label: 'Quick Refund', desc: '5-7 business days' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 text-center space-y-2">
              <item.icon className="h-6 w-6 text-accent mx-auto" />
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How to return */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>How to Return an Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((s) => (
              <div key={s.step} className="relative p-4 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold mb-3">
                  {s.step}
                </div>
                <h4 className="font-medium text-sm mb-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Eligible / Not eligible */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" /> Eligible for Return
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>✓ Defective or damaged items</p>
            <p>✓ Wrong item delivered</p>
            <p>✓ Item doesn't match description</p>
            <p>✓ Size/fit issues (clothing & footwear)</p>
            <p>✓ Missing parts or accessories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" /> Not Eligible
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>✗ Items used or altered after delivery</p>
            <p>✗ Items without original tags/packaging</p>
            <p>✗ Innerwear, swimwear, or personal care items</p>
            <p>✗ Customized/personalized products</p>
            <p>✗ Items returned after 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Refund info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Refund Methods</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong className="text-foreground">UPI / Net Banking:</strong> Refund to original payment source within 5-7 business days.</p>
          <p><strong className="text-foreground">Cash on Delivery:</strong> Refund via bank transfer. You'll be asked for bank details.</p>
          <p><strong className="text-foreground">Zmart Credits:</strong> Opt for instant store credits (bonus 5% added).</p>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-4">Need help with a return?</p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link to="/contact">Contact Support <ArrowRight className="h-4 w-4 ml-2" /></Link>
        </Button>
      </div>
    </div>
  );
}
