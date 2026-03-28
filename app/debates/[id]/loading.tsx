import Navbar from "../../components/Navbar";

export default function DebateDetailLoading() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] relative">
      <div className="relative z-10">
        <Navbar />
        <article className="pt-28 pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-4 w-20 bg-slate-700/40 rounded animate-pulse mb-8" />
            <div className="h-6 w-32 bg-slate-700/50 rounded-full animate-pulse mb-4" />
            <div className="h-10 w-full bg-slate-700/50 rounded animate-pulse mb-4" />
            <div className="h-5 w-64 bg-slate-700/30 rounded animate-pulse mb-4" />
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-7 w-28 bg-slate-700/40 rounded-full animate-pulse" />
              ))}
            </div>
            <div className="h-64 w-full bg-slate-700/30 rounded-xl animate-pulse mb-8" />
            <div className="h-96 w-full bg-slate-700/20 rounded-xl animate-pulse" />
          </div>
        </article>
      </div>
    </main>
  );
}
