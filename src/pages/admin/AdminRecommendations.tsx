import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function AdminRecommendations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Recommendations</h1>
        <p className="text-sm text-muted-foreground">ML-powered recommendation engine insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendation Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p>Recommendation data will appear as the engine learns from user interactions</p>
              <p className="text-xs mt-2">The engine uses collaborative filtering, content similarity, and popularity signals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
