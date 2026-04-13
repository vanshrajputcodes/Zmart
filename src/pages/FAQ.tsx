import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    category: 'Orders & Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept UPI (GPay, PhonePe, Paytm, etc.), net banking, debit/credit cards, and Cash on Delivery (up to ₹10,000). All payments are secured with 256-bit encryption.' },
      { q: 'Can I cancel my order?', a: 'Yes, you can cancel your order within 2 hours of placing it from your Order History page. Once the order is shipped, cancellation is not possible — you can request a return instead.' },
      { q: 'How do I track my order?', a: 'Go to My Account → Order History. Click on any order to see real-time tracking with delivery partner details. You\'ll also receive SMS and email updates.' },
      { q: 'Do you offer Cash on Delivery?', a: 'Yes, COD is available for orders up to ₹10,000 with a ₹49 handling fee. COD is not available for remote/island locations.' },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Metro cities: 2-3 days (standard) or same-day (express). Tier 1 cities: 3-5 days. Other locations: 5-10 days. Check our Shipping Info page for full details.' },
      { q: 'Is shipping free?', a: 'Yes! Free shipping on all prepaid orders above ₹999. Orders below ₹999 have a flat ₹79 shipping charge.' },
      { q: 'Do you deliver to my PIN code?', a: 'We deliver to 29,000+ PIN codes across India. Enter your PIN code at checkout to verify serviceability.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: '7-day easy returns from the date of delivery. Items must be unused, unwashed, with original tags and packaging intact. Visit our Returns page for details.' },
      { q: 'How long does a refund take?', a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. You\'ll get an email confirmation once the refund is initiated.' },
      { q: 'Can I exchange instead of return?', a: 'Currently we process returns and you can place a new order. We\'re working on a direct exchange feature — coming soon!' },
    ],
  },
  {
    category: 'Account & General',
    items: [
      { q: 'How do I create an account?', a: 'Click the user icon in the top navigation or visit the Sign Up page. Enter your email, create a password, and you\'re all set — no email verification needed!' },
      { q: 'Is my personal information safe?', a: 'Absolutely. We use industry-standard encryption and never share your data with third parties. Read our Privacy Policy for more details.' },
      { q: 'How do I apply a coupon code?', a: 'At checkout, you\'ll see a "Have a coupon?" field. Enter your code and click Apply. The discount will be reflected in your order total.' },
      { q: 'How can I contact customer support?', a: 'Email us at support@zmart.in, call 1800-123-4567 (Mon-Sat 9AM-7PM IST), or use our Contact Us page to send a message.' },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="container max-w-3xl py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-accent" />
          <h1 className="font-display text-3xl md:text-4xl font-bold">FAQs</h1>
        </div>
        <p className="text-muted-foreground mb-10">Find answers to commonly asked questions below.</p>
      </motion.div>

      <div className="space-y-8">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="font-display text-xl font-semibold mb-4">{section.category}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {section.items.map((faq, i) => (
                <AccordionItem key={i} value={`${section.category}-${i}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-sm font-medium text-left hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="text-center mt-12 p-8 rounded-lg bg-muted/50">
        <h3 className="font-display text-xl font-semibold mb-2">Still have questions?</h3>
        <p className="text-muted-foreground text-sm mb-4">Our support team is happy to help.</p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link to="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  );
}
