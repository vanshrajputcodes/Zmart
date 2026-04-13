import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Package, IndianRupee, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const shippingZones = [
  { zone: 'Metro Cities', cities: 'Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad', standard: '2-3 days', express: '1 day', cost: 'Free above ₹999' },
  { zone: 'Tier 1 Cities', cities: 'Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh', standard: '3-5 days', express: '1-2 days', cost: 'Free above ₹999' },
  { zone: 'Tier 2 & 3 Cities', cities: 'All other serviceable locations', standard: '5-7 days', express: '2-3 days', cost: 'Free above ₹999' },
  { zone: 'Remote Areas', cities: 'North-East, J&K, Himachal, Islands', standard: '7-10 days', express: '3-5 days', cost: '₹149 flat' },
];

export default function ShippingInfo() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Shipping Information</h1>
        <p className="text-muted-foreground mb-10">Everything you need to know about our delivery services across India.</p>
      </motion.div>

      {/* Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Truck, label: 'Free Shipping', desc: 'Orders above ₹999' },
          { icon: Clock, label: 'Express Delivery', desc: 'Same-day in metros' },
          { icon: MapPin, label: 'Pan-India', desc: '29,000+ PIN codes' },
          { icon: ShieldCheck, label: 'Safe Packaging', desc: 'Tamper-proof' },
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

      {/* Zones table */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Delivery Zones & Timelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Zone</th>
                  <th className="text-left py-3 px-2 font-medium">Standard</th>
                  <th className="text-left py-3 px-2 font-medium">Express</th>
                  <th className="text-left py-3 px-2 font-medium">Shipping Cost</th>
                </tr>
              </thead>
              <tbody>
                {shippingZones.map((zone) => (
                  <tr key={zone.zone} className="border-b last:border-0">
                    <td className="py-3 px-2">
                      <p className="font-medium">{zone.zone}</p>
                      <p className="text-xs text-muted-foreground">{zone.cities}</p>
                    </td>
                    <td className="py-3 px-2">{zone.standard}</td>
                    <td className="py-3 px-2">{zone.express}</td>
                    <td className="py-3 px-2">{zone.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" /> Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Once your order is shipped, you'll receive an email and SMS with a tracking link. You can also track from your account's Order History page.</p>
            <p>Our delivery partners include BlueDart, Delhivery, DTDC, and India Post for remote areas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-accent" /> Cash on Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>COD is available on orders up to ₹10,000. An additional ₹49 COD handling fee applies.</p>
            <p>COD is not available for remote/island locations. Prepaid orders get priority processing.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
