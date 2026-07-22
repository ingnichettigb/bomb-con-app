import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const App = lazy(() => import("../app/App"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BOMB-CON TARATURA — Calibrazione Serbatoi" },
      {
        name: "description",
        content:
          "BOMB-CON TARATURA: calcolo geometrico, tabella di taratura e certificato PDF per serbatoi cilindrici verticali.",
      },
      { property: "og:title", content: "BOMB-CON TARATURA" },
      {
        property: "og:description",
        content:
          "Applicazione per la calibrazione e taratura di serbatoi con generazione del certificato PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Caricamento BOMB-CON TARATURA…
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
          Caricamento BOMB-CON TARATURA…
        </div>
      }
    >
      <App />
    </Suspense>
  );
}
