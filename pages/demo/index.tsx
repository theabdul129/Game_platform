import AssetCard from '@/components/assets/AssetCard';
import type { GameAsset } from '@/components/assets/types';
import { useEffect, useMemo, useState } from 'react';

const MOCK_ADDRESSES = [
  '0xA11CE000000000000000000000000000000C0DE',
  '0xB0B00000000000000000000000000000000000B',
  '0xC0D300000000000000000000000000000000123',
];

const AssetsPage = () => {
  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [filterOwnedOnly, setFilterOwnedOnly] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch('/data/assets.json');
        if (!res.ok) throw new Error('Failed to load assets');
        const data: GameAsset[] = await res.json();
        setAssets(data);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const handleConnect = () => {
    setFilterOwnedOnly(false);
    if (connectedAddress) {
      setConnectedAddress(null);
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * MOCK_ADDRESSES.length);
      setConnectedAddress(MOCK_ADDRESSES[randomIndex]);
      setIsConnecting(false);
    }, 700);
  };

  const assetsToDisplay = useMemo(() => {
    if (!connectedAddress || !filterOwnedOnly) return assets;
    return assets.filter((asset) => asset.owner === connectedAddress);
  }, [assets, connectedAddress, filterOwnedOnly]);

  const ownedCount = useMemo(() => {
    if (!connectedAddress) return 0;
    return assets.filter((asset) => asset.owner === connectedAddress).length;
  }, [assets, connectedAddress]);

  return (
    <main className="min-h-screen  text-white">
      <div className="mx-auto flex w-full  flex-col gap-10 px-4 py-12 sm:px-6 lg:px-10 xl:pl-0">
        <header className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            {/* LEFT SIDE */}
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Dashboard</p>
              <h1 className="text-4xl font-semibold text-white">Game Asset Control Room</h1>
              <p className="mt-2 text-sm text-slate-200">
                Review your collectibles, track wallet ownership, and keep your inventory tidy.
              </p>
            </div>

            {/* RIGHT SIDE - BUTTON GROUP (FIXED) */}
            <div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end xl:self-start">
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-8 
               py-3 text-sm font-semibold text-slate-900 shadow-lg 
               shadow-emerald-500/40 transition hover:bg-emerald-300 disabled:cursor-wait
               disabled:opacity-60 xl:w-auto"
              >
                {connectedAddress ? 'Disconnect Wallet' : isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>

              <button
                type="button"
                disabled={!connectedAddress}
                onClick={() => setFilterOwnedOnly((prev) => !prev)}
                className={`w-full rounded-2xl border px-8 py-3 text-sm font-semibold 
      transition xl:w-auto
      ${
        filterOwnedOnly
          ? 'border-emerald-300 bg-emerald-300/10 text-emerald-200'
          : 'border-white/20 text-white hover:border-emerald-300 hover:text-emerald-200'
      } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {filterOwnedOnly ? 'Showing Owned Assets' : 'Show Owned Only'}
              </button>
            </div>
          </div>
          {connectedAddress && (
            <div className="flex flex-wrap gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-100">
              <span className="font-semibold uppercase tracking-wide text-emerald-300">Connected</span>
              <span className="font-mono text-sm">{connectedAddress}</span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                {ownedCount} Owned
              </span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Assets" value={assets.length} />
            <StatCard label="Unique Owners" value={new Set(assets.map((asset) => asset.owner)).size} />
            <StatCard label="Your Holdings" value={ownedCount} muted={!connectedAddress} />
          </div>
        </header>

        {error ? (
          <div className="rounded-3xl border border-red-400/40 bg-red-500/5 px-4 py-3 text-sm text-red-200">{error}</div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`asset-skeleton-${index}`} />)
              : assetsToDisplay.map((asset) => {
                  const isOwned = asset.owner === connectedAddress;
                  return <AssetCard key={asset.id} asset={asset} owned={isOwned} />;
                })}
            {!loading && assetsToDisplay.length === 0 && (
              <div className="col-span-full rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/70">
                No assets found for this wallet.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

type StatCardProps = {
  label: string;
  value: number;
  muted?: boolean;
};

const StatCard = ({ label, value, muted = false }: StatCardProps) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4">
    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${muted ? 'text-slate-500' : 'text-white'}`}>{value}</p>
  </div>
);

const SkeletonCard = () => (
  <div className="flex animate-pulse flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
    <div className="h-48 w-full bg-white/10" />
    <div className="space-y-3 p-5">
      <div className="h-5 w-3/4 rounded bg-white/10" />
      <div className="h-4 w-full rounded bg-white/10" />
      <div className="h-4 w-2/3 rounded bg-white/10" />
      <div className="h-10 w-full rounded-2xl bg-white/10" />
    </div>
  </div>
);

export default AssetsPage;
