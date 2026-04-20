export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-slate-900 text-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold tracking-wide sm:text-xl">AQI Chat Bot</h1>
        <p className="text-xs text-slate-300 sm:text-sm">City Air Quality Insights</p>
      </div>
    </header>
  );
}
