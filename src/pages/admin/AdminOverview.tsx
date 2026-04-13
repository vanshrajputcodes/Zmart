import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Badge } from '@/components/ui/badge';

const CHART_COLORS = [
  'hsl(36, 72%, 52%)',
  'hsl(220, 16%, 36%)',
  'hsl(160, 50%, 40%)',
  'hsl(0, 72%, 51%)',
  'hsl(280, 50%, 50%)',
];

export default function AdminOverview() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [orders, products, customers] = await Promise.all([
        supabase.from('orders').select('id, total, status, created_at'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const allOrders = orders.data ?? [];
      const revenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;

      return {
        revenue,
        orderCount: allOrders.length,
        pendingOrders,
        productCount: products.count ?? 0,
        customerCount: customers.count ?? 0,
        orders: allOrders,
      };
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, profiles!orders_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  // Derive daily sales data
  const dailySales = stats?.orders
    ? Object.entries(
        stats.orders.reduce((acc: Record<string, number>, order) => {
          const day = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[day] = (acc[day] || 0) + Number(order.total);
          return acc;
        }, {})
      ).map(([date, total]) => ({ date, total }))
    : [];

  const statusData = stats?.orders
    ? Object.entries(
        stats.orders.reduce((acc: Record<string, number>, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  const StatCard = ({ title, value, icon: Icon, change }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loadingStats ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold font-body">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Revenue" value={`$${(stats?.revenue ?? 0).toFixed(2)}`} icon={DollarSign} />
        <StatCard title="Orders" value={stats?.orderCount ?? 0} icon={ShoppingCart} />
        <StatCard title="Products" value={stats?.productCount ?? 0} icon={Package} />
        <StatCard title="Customers" value={stats?.customerCount ?? 0} icon={Users} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {dailySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(36, 72%, 52%)"
                    fill="hsl(36, 72%, 52%)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}</p>
                    <p className="text-sm font-medium">{order.profiles?.full_name || 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">${Number(order.total).toFixed(2)}</p>
                    <Badge
                      variant={order.status === 'delivered' ? 'default' : order.status === 'pending' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
