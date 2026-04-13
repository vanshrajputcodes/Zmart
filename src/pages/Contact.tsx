import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Store the contact message in store_settings as a simple approach
    const { error } = await supabase.from('store_settings').insert({
      key: `contact_${Date.now()}`,
      value: { name, email, subject, message, submitted_at: new Date().toISOString() },
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Failed to send', description: 'Please try again or email us directly.', variant: 'destructive' });
    } else {
      setSent(true);
      toast({ title: 'Message sent!', description: 'We\'ll get back to you within 24 hours.' });
    }
  };

  return (
    <div className="container max-w-5xl py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-10">We'd love to hear from you. Reach out and we'll respond within 24 hours.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: 'support@zmart.in', href: 'mailto:support@zmart.in' },
            { icon: Phone, label: 'Phone', value: '+91 1800-123-4567', href: 'tel:+911800123456' },
            { icon: MapPin, label: 'Office', value: 'Sector 62, Noida, UP 201301, India', href: null },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-start gap-3 p-4">
                <item.icon className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <MessageSquare className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Business Hours</p>
                <p className="text-sm text-muted-foreground">Mon – Sat: 9 AM – 7 PM IST</p>
                <p className="text-sm text-muted-foreground">Sun: 10 AM – 5 PM IST</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-lg border p-12 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Send className="h-7 w-7 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold">Message Sent!</h2>
              <p className="text-muted-foreground">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              <Button variant="outline" onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}>
                Send Another Message
              </Button>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required placeholder="Tell us more..." rows={6} />
                  </div>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
