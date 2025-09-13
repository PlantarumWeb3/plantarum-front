// src/app/marketplace/page.tsx
"use client";

import Link from "next/link";

export default function MarketplacePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-3xl font-extrabold text-green-400 mb-6 text-center">
        🌱 Marketplace Plantarum
      </h2>
      <p className="text-center max-w-3xl mb-12 text-green-200">
        Explora los diferentes mercados forestales: activos tokenizados, proyectos de inversión y créditos de carbono.  
        Haz clic en cada sección para ver los activos disponibles.
      </p>

      <div className="flex flex-col items-center w-full">
        <div className="card-row">
          <Link href="/marketplace/forest" className="card">
            <div className="card-title">🌳 Activos Forestales</div>
            <p className="card-text">
              Compra y vende activos forestales tokenizados con trazabilidad e integridad garantizada.
            </p>
          </Link>

          <Link href="/marketplace/projects" className="card">
            <div className="card-title">🏭 Proyectos Forestales</div>
            <p className="card-text">
              Participa en proyectos de industrialización, explotación y desarrollo forestal.
            </p>
          </Link>

          <Link href="/marketplace/carbon" className="card">
            <div className="card-title">🌍 Créditos de Carbono</div>
            <p className="card-text">
              Invierte en créditos de carbono certificados por estándares internacionales.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
