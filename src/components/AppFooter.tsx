export function AppFooter() {
  return (
    <footer className="shrink-0 border-t border-zinc-200/90 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-center gap-2 text-center sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-6 sm:gap-y-2 sm:text-left">
        <p className="text-zinc-600">
          © 2000 – 2026 Runtec Sistema de Informação
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 sm:justify-end" aria-label="Informações legais">
          <a
            href="#"
            className="text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline"
          >
            Política de Privacidade
          </a>
          <a
            href="#"
            className="text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline"
          >
            Canal de Denúncias
          </a>
        </nav>
      </div>
    </footer>
  );
}
