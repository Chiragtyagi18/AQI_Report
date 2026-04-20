export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-4 text-center text-sm text-slate-600 sm:px-6">
        © {new Date().getFullYear()} AQI Chat Bot
      </div>
    </footer>
  );
}
