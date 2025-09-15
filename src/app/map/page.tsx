// src/app/map/page.tsx

"use client";

import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/components/MapComponent"), {
  ssr: false, // 🚀 Importante: evita que Vercel intente renderizar en el servidor
});

export default function MapPage() {
  return (
    <main className="p-4">
      <h1 className="text-3xl font-extrabold text-green-500 text-center mb-6">
        🗺️ Mapa de Activos Tokenizados
      </h1>
      <DynamicMap />
    </main>
  );
}
