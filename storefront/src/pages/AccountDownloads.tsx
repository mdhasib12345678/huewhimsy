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
      <div className="container-page section-y-lg text-center max-w-md">
        <Download className="w-12 sm:w-14 h-12 sm:h-14 mx-auto text-[#525252] mb-5" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a] mb-4">Sign in to access downloads</h1>
        <NavLink
          to="/account"
          className="inline-block rounded-full bg-[#0a0a0a] text-white px-7 py-3 text-sm font-semibold hover:bg-black"
        >
          Sign in
        </NavLink>
      </div>
    );
  }

  return (
    <div className="container-page section-y max-w-4xl">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a0a0a] mb-2">Your Downloads</h1>
      <p className="text-sm sm:text-base text-[#525252] mb-8 sm:mb-10">Activity packs and digital purchases — yours to keep.</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-black/[0.04] animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : activities.filter((a) => !!a.file_url).length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border border-black/[0.07] bg-white shadow-sm rounded-2xl sm:rounded-3xl">
          <Download className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-[#525252] mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] mb-2">Nothing yet</h2>
          <p className="text-sm text-[#525252] mb-5 sm:mb-6">Free activities will appear here once you've subscribed.</p>
          <NavLink
            to="/free-activities"
            className="inline-block rounded-full bg-[#0a0a0a] text-white px-6 py-3 text-sm font-semibold hover:bg-black"
          >
            Browse activities
          </NavLink>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {activities
            .filter((a) => !!a.file_url)
            .map((a) => (
              <Card key={a.id} className="p-4 sm:p-5 border border-black/[0.07] bg-white shadow-sm hover:shadow-md hover:border-black/[0.15] transition-all rounded-2xl">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-[#0a0a0a] mb-1 line-clamp-2">{a.title}</h3>
                    <p className="text-[11px] sm:text-xs text-[#525252]">
                      {a.category}
                      {a.pages ? ` · ${a.pages} pages` : ''}
                      {a.age_range ? ` · Age ${a.age_range}` : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full bg-[#FF5F6D] text-white hover:bg-[#e54756] shrink-0 w-10 h-10"
                    onClick={() => a.file_url && window.open(a.file_url, '_blank')}
                    aria-label="Download"
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
