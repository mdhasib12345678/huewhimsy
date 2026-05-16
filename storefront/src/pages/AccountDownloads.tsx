import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRainbow } from '@/components/RainbowContext';
import { listActivities, type FreeActivity } from '@/lib/medusa';

export const AccountDownloads: React.FC = () => {
  const { user, authLoading } = useRainbow();
  const [activities, setActivities] = useState<FreeActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    // For now, fetch all activities (gated ones are unlocked for subscribers).
    // Later: filter to customer's purchased digital products + activities they're subscribed for.
    void listActivities({ limit: 50 })
      .then((res) => setActivities(res.activities))
      .finally(() => setLoading(false));
  }, [user]);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-md">
        <Download className="w-16 h-16 mx-auto text-[#525252] mb-6" />
        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-4">Sign in to access downloads</h1>
        <NavLink
          to="/account"
          className="inline-block rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-8 py-3 font-bold hover:opacity-90 shadow-md"
        >
          Sign in
        </NavLink>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold text-[#0a0a0a] mb-2">Your Downloads</h1>
      <p className="text-[#525252] mb-12">Activity packs and digital purchases — yours to keep.</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : activities.filter((a) => !!a.file_url).length === 0 ? (
        <Card className="p-12 text-center border-black/10 bg-white shadow-sm">
          <Download className="w-12 h-12 mx-auto text-[#525252] mb-4" />
          <h2 className="text-xl font-bold text-[#0a0a0a] mb-2">Nothing yet</h2>
          <p className="text-[#525252] mb-6">Free activities will appear here once you've subscribed.</p>
          <NavLink
            to="/free-activities"
            className="inline-block rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-6 py-3 font-bold hover:opacity-90 shadow-md"
          >
            Browse activities
          </NavLink>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities
            .filter((a) => !!a.file_url)
            .map((a) => (
              <Card key={a.id} className="p-6 border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[#0a0a0a] mb-1">{a.title}</h3>
                    <p className="text-xs text-[#525252]">
                      {a.category}
                      {a.pages ? ` · ${a.pages} pages` : ''}
                      {a.age_range ? ` · Age ${a.age_range}` : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full bg-[#FF5F6D] text-white hover:opacity-90 shrink-0"
                    onClick={() => a.file_url && window.open(a.file_url, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};
