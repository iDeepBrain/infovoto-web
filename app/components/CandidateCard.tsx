"use client";

interface CandidateCardProps {
  nombre: string;
  partido: string;
  cargo: string;
  foto_url?: string;
  logo_url?: string;
  dni?: string;
}

export default function CandidateCard({ nombre, partido, cargo, foto_url, logo_url }: CandidateCardProps) {
  return (
    <div className="flex items-center gap-3 bg-[#1e293b] border border-[#334155] rounded-xl p-3 my-2">
      {foto_url ? (
        <img
          src={foto_url}
          alt={nombre}
          className="w-12 h-14 object-cover rounded-lg border border-[#334155] shrink-0"
        />
      ) : (
        <div className="w-12 h-14 rounded-lg bg-[#334155] flex items-center justify-center shrink-0">
          <span className="text-gray-500 text-lg">👤</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-white text-sm truncate">{nombre}</h4>
        {cargo && <p className="text-xs text-gray-400 capitalize">{cargo}</p>}
        <div className="flex items-center gap-1.5 mt-0.5">
          {logo_url && (
            <img
              src={logo_url}
              alt={partido}
              className="w-5 h-5 object-contain shrink-0 rounded-sm"
            />
          )}
          {partido && <p className="text-xs text-amber-400 font-semibold truncate">{partido}</p>}
        </div>
      </div>
    </div>
  );
}
