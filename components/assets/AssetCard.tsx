import Image from 'next/image';
import { GameAsset } from './types';

type AssetCardProps = {
  asset: GameAsset;
  owned?: boolean;
};

const AssetCard = ({ asset, owned = false }: AssetCardProps) => {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border bg-slate-900/50 shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-emerald-300/60 hover:bg-slate-900 ${
        owned ? 'border-emerald-400/60' : 'border-white/10'
      }`}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={asset.image}
          alt={asset.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-105"
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-0 transition group-hover:opacity-100" />
        {owned && (
          <span className="absolute right-4 top-4 rounded-full bg-emerald-400/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 shadow-lg">
            Owned
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h2 className="text-lg font-semibold text-white">{asset.name}</h2>
          <p className="mt-1 text-sm text-slate-300">{asset.description}</p>
        </div>
        <div className="mt-auto rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-300">
          <p className="font-semibold uppercase tracking-wide text-slate-400">Owner</p>
          <p className="text-wrap break-words font-mono">{asset.owner}</p>
        </div>
      </div>
    </article>
  );
};

export default AssetCard;
