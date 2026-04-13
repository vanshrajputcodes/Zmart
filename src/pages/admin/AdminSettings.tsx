import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your store</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input defaultValue="Zmart" />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" placeholder="support@zmart.in" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input defaultValue="INR" />
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tax Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Tax Rate (%)</Label>
              <Input type="number" step="0.01" defaultValue="8.5" />
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Update Tax Rate</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Free Shipping Threshold ($)</Label>
              <Input type="number" step="0.01" defaultValue="100" />
            </div>
            <div className="space-y-2">
              <Label>Standard Shipping Rate ($)</Label>
              <Input type="number" step="0.01" defaultValue="9.99" />
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Update Shipping</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
