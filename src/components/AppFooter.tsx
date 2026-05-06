export function AppFooter() {
  return (
    <footer className="shrink-0 border-t border-zinc-200/90 bg-zinc-50 px-4 py-2.5 text-[12px] text-zinc-600">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-2 sm:grid-cols-3">
        <div className="text-center sm:text-left">
          <span className="font-medium text-zinc-700">Versão 0-51-21-00</span>
        </div>

        <div className="flex justify-center">
          <img
            src="/logo-runtec.png"
            alt="Runtec"
            className="h-5 w-auto object-contain opacity-90"
            loading="lazy"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center sm:justify-end sm:text-right">
          <span>© 2026 — Runtec Informática</span>
          <span className="hidden opacity-60 sm:inline" aria-hidden>·</span>
          <a
            href="#"
            className="underline-offset-4 transition-colors hover:text-zinc-900 hover:underline"
          >
            Política de privacidade
          </a>
        </div>
      </div>
    </footer>
  );
}
