// src/components/MapComponent.tsx

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";
import { provider as readProvider } from "@/utils/web3Config"; // 

import { useMap } from "react-leaflet";
import L from "leaflet";

// 📍 Regiones predefinidas
const REGIONS: Record<string, { center: [number, number]; zoom: number }> = {
  España: { center: [40.4168, -3.7038], zoom: 6 },
  Baleares: { center: [39.6953, 3.0176], zoom: 8 },
  Canarias: { center: [28.2916, -16.6291], zoom: 7 },
  Europa: { center: [54.526, 15.2551], zoom: 4 },
};

// 🎨 Iconos personalizados
let icons: any = {};
if (typeof window !== "undefined") {
  const pinIcon = (file: string) =>
    new L.Icon({
      iconUrl: `/pins/${file}`,
      iconSize: [25, 25],
      iconAnchor: [12, 25],
    });

  icons = {
    conservation: pinIcon("green-pin.png"),
    forest: pinIcon("red-pin.png"),
    carbon: pinIcon("blue-pin.png"),
    project: pinIcon("orange-pin.png"),
  };
}

function MapUpdater({ region }: { region: keyof typeof REGIONS }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.whenReady(() => {
      const { center, zoom } = REGIONS[region];
      map.flyTo(center, zoom, { duration: 1.5 });
    });
  }, [region, map]);
  return null;
}

function ResponsiveIcons() {
  const map = useMap();
  useEffect(() => {
    const updateIcons = () => {
      const zoom = map.getZoom();
      const size = Math.min(Math.max(zoom * 2, 15), 50);

      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && layer.options.icon?.options.iconUrl) {
          const newIcon = L.icon({
            iconUrl: layer.options.icon.options.iconUrl,
            iconSize: [size, size],
            iconAnchor: [size / 2, size],
          });
          layer.setIcon(newIcon);
        }
      });
    };

    map.on("zoomend", updateIcons);
    updateIcons();
    return () => {
      map.off("zoomend", updateIcons);
    };
  }, [map]);
  return null;
}

// 🚀 Componentes dinámicos react-leaflet (solo cliente)
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

export default function MapComponent() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<keyof typeof REGIONS>("España");

  useEffect(() => {
  if (typeof window === "undefined") return;

  (async () => {
    try {
      // 👇 Provider: signer si hay wallet, sino público
      let activeProvider: any;
      if ((window as any).ethereum) {
        const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
        activeProvider = browserProvider;
      } else {
        activeProvider = readProvider; // ✅ fallback público
      }

      const contract721 = new ethers.Contract(addresses.Plantarum721, Plantarum721ABI, activeProvider);
      const contract1155 = new ethers.Contract(addresses.Plantarum1155, Plantarum1155ABI, activeProvider);

      const results: any[] = [];

      // 🔴 Forest / Conservation (721)
      try {
        const ids721: bigint[] = await contract721.getAllTokens();
        for (const id of ids721) {
          try {
            const meta = await contract721.getTokenMeta(id);
            const uri = await contract721.tokenURI(id);
            const url = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
            const res = await fetch(url);
            const data = await res.json();

            if (meta.coords) {
              const [lat, lng] = meta.coords.split(",").map((c: string) => parseFloat(c.trim()));
              results.push({
                id: id.toString(),
                coords: [lat, lng] as [number, number],
                type: data.tipoActivo || "forest", // 👈 usar tipoActivo del JSON
                titulo: data.titulo || "Activo Forestal",
                estado: data.estado || "No definido", // 👈 uniforme
                tokenURI: uri,
              });
            }
          } catch {}
        }
      } catch {}

      // 🔵 Carbon + Projects (1155)
      try {
        const ids1155: bigint[] = await contract1155.getAllTokens();
        for (const id of ids1155) {
          try {
            const uri = await contract1155.uri(id);
            const url = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
            const res = await fetch(url);
            const data = await res.json();

            if ((data.tipoActivo === "project" || data.tipoActivo === "carbon") && data.coords) {
              const [lat, lng] = data.coords.split(",").map((c: string) => parseFloat(c.trim()));
              results.push({
                id: id.toString(),
                coords: [lat, lng] as [number, number],
                type: data.tipoActivo, // 👈 usar tipoActivo
                titulo: data.titulo || "Proyecto",
                estado: data.estado || "No definido", // 👈 uniforme
                tokenURI: uri,
              });
            }
          } catch {}
        }
      } catch {}

      setTokens(results);
    } catch (err) {
      console.error("❌ Error cargando tokens en el mapa:", err);
    } finally {
      setLoading(false);
    }
  })();
}, []);

  const { center, zoom } = REGIONS[region];

  return (
    <div>
      <div className="flex justify-center gap-4 mb-4">
        {Object.keys(REGIONS).map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r as keyof typeof REGIONS)}
            className={`px-4 py-2 rounded-lg ${
              region === r ? "bg-green-600 text-white" : "bg-green-900 text-green-300 hover:bg-green-700"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-yellow-400">⏳ Cargando tokens...</p>
      ) : (
        <div className="max-w-full mx-auto border border-green-700 rounded-xl overflow-hidden shadow-lg">
          <MapContainer key={region} center={center} zoom={zoom} style={{ height: "650px", width: "100%" }}>
            <MapUpdater region={region} />
            <ResponsiveIcons />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {tokens.map((t, idx) => {
              const icon =
                t.type === "forest"
                  ? icons.forest
                  : t.type === "carbon"
                  ? icons.carbon
                  : t.type === "project"
                  ? icons.project
                  : icons.conservation;

              return (
                <Marker key={idx} position={t.coords} icon={icon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{t.titulo}</p>
                      <p>📍 {t.coords[0]}, {t.coords[1]}</p>
                      <p>📌 Estado: {t.estado}</p>
                      <p>ID: {t.id}</p>
                      <a
                        href={`https://ipfs.io/ipfs/${t.tokenURI.replace("ipfs://", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 underline"
                      >
                        🌐 Ver Metadata en IPFS
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
