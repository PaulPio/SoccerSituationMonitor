"use client";

import { useEffect, useRef } from "react";
import type { DashboardData, MarketMover } from "@/lib/soccer/types";

type Props = {
  hotspots: DashboardData["hotspots"];
  signals: MarketMover[];
  onSelectSignal: (signal: MarketMover) => void;
};

const EUROPE_CENTER: [number, number] = [50, 10];
const EUROPE_ZOOM = 4;

const hotspotColors: Record<string, { color: string; bgColor: string }> = {
  match: { color: "#2ea67f", bgColor: "#2ea67f" },
  transfer: { color: "#d29922", bgColor: "#d29922" },
};

function convertToLatLon(x: number, y: number): [number, number] {
  const lon = -2 + ((x - 24) / 48) * 16.3;
  const lat = 53.5 - ((y - 37) / 29) * 12.2;
  return [lat, lon];
}

function getSignalForHotspot(signals: MarketMover[], region: string): MarketMover | null {
  const regionSignals = signals.filter((s) => s.region === region);
  if (regionSignals.length === 0) return null;
  const ranks: Record<string, number> = { Shock: 4, Move: 3, Monitor: 2, Noise: 1 };
  return regionSignals.sort((a, b) => (ranks[b.severity] ?? 0) - (ranks[a.severity] ?? 0))[0];
}

export function MapInner({ hotspots, signals, onSelectSignal }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      if (!mounted) return;

      const L = await import("leaflet");

      const container = document.getElementById("soccer-map-container");
      if (!container || mapRef.current) return;

      const mapInstance = L.map("soccer-map-container", {
        center: EUROPE_CENTER,
        zoom: EUROPE_ZOOM,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(mapInstance);

      mapRef.current = mapInstance;

      hotspots.forEach((hotspot) => {
        const [lat, lon] = convertToLatLon(hotspot.x, hotspot.y);
        const signal = getSignalForHotspot(signals, hotspot.region);
        const colors = hotspotColors[hotspot.dominantMarketType];
        const size = 12 + (hotspot.intensity / 100) * 16;

        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background: ${colors.bgColor}30;
              border: 2px solid ${colors.color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 0 0 ${hotspot.intensity / 10}px ${colors.color}50;
              transition: transform 0.2s;
            ">
              <div style="
                width: 40%;
                height: 40%;
                background: ${colors.color};
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([lat, lon], { icon }).addTo(mapInstance);

        marker.bindPopup(`
          <div style="min-width: 160px; padding: 4px; background: #161b22; border-radius: 6px;">
            <strong style="font-size: 14px; color: #e6edf3;">${hotspot.city}</strong>
            <div style="margin-top: 6px; font-size: 12px; color: #8b949e;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: ${colors.color};">●</span>
                <span style="text-transform: uppercase; font-size: 10px;">${hotspot.dominantMarketType}</span>
              </div>
              <div style="margin-top: 4px;">
                <span style="font-weight: 600; color: #e6edf3;">${hotspot.activeSignals}</span> active signals
              </div>
              <div style="margin-top: 4px; color: #6e7681;">${hotspot.topEntity}</div>
              <div style="margin-top: 2px; font-size: 11px;">${hotspot.country}</div>
            </div>
          </div>
        `);

        if (signal) {
          marker.on("click", () => {
            onSelectSignal(signal);
          });
        }
      });
    };

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [hotspots, signals, onSelectSignal]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#30363d]">
      <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded bg-[#161b22]/90 px-3 py-2 backdrop-blur-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-[#2ea67f] animate-pulse" />
        <span className="text-xs font-medium text-[#e6edf3]">European Market Map</span>
        <span className="text-xs text-[#6e7681]">• {hotspots.length} zones</span>
      </div>
      <div className="absolute left-3 bottom-3 z-[1000] flex items-center gap-4 rounded bg-[#161b22]/90 px-3 py-2 backdrop-blur-sm text-[10px] text-[#8b949e]">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full border border-[#2ea67f] bg-[#2ea67f]/30" />
          <span>Match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full border border-[#d29922] bg-[#d29922]/30" />
          <span>Transfer</span>
        </div>
      </div>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div id="soccer-map-container" className="h-72 w-full" />
    </div>
  );
}