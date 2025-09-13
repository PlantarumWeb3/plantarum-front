// src/app/info/page.tsx
"use client";

export default function InfoPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        📚 Centro de Información Plantarum
      </h2>
      <p className="text-center max-w-2xl mb-12">
        Consulta documentación, enlaces, documentos técnicos y notificaciones
        oficiales de la plataforma Plantarum 🌍.
      </p>

      <div className="flex flex-col items-center">
        {/* Primera fila */}
        <div className="card-row">
          <div className="card cursor-not-allowed opacity-70">
            <div className="card-title">🔗 Enlaces de interés</div>
            <p className="card-text">
              Aquí aparecerán los enlaces publicados desde el panel de
              administración.
            </p>
          </div>
          <div className="card cursor-not-allowed opacity-70">
            <div className="card-title">🌲 Documentos Forestales</div>
            <p className="card-text">
              Archivos PDF y material técnico publicados desde el panel admin.
            </p>
          </div>
        </div>

        {/* Segunda fila */}
        <div className="card-row">
          <div className="card cursor-not-allowed opacity-70">
            <div className="card-title">📖 Plantarum Docs</div>
            <p className="card-text">
              Documentación oficial de la plataforma, cargada desde Admin.
            </p>
          </div>
          <div className="card cursor-not-allowed opacity-70">
            <div className="card-title">🔔 Notificaciones</div>
            <p className="card-text">
              Comunicados y avisos oficiales enviados a la comunidad.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
