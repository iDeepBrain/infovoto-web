import Navbar from "../components/Navbar";

export default function DebatesLoading() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] relative">
      <div className="relative z-10">
        <Navbar />
        <section className="pt-28 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="h-12 w-96 mx-auto bg-slate-700/50 rounded-lg animate-pulse mb-4" />
              <div className="h-6 w-64 mx-auto bg-slate-700/30 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-8 rounded-2xl border border-slate-700 bg-slate-800/50">
                  <div className="h-6 w-32 bg-slate-700/50 rounded-full animate-pulse mb-4" />
                  <div className="h-7 w-full bg-slate-700/50 rounded animate-pulse mb-3" />
                  <div className="h-4 w-48 bg-slate-700/30 rounded animate-pulse mb-4" />
                  <div className="h-16 w-full bg-slate-700/30 rounded animate-pulse mb-5" />
                  <div className="flex gap-2 mb-6">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-6 w-24 bg-slate-700/40 rounded animate-pulse" />
                    ))}
                  </div>
                  <div className="h-10 w-full bg-slate-700/40 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
