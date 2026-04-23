"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Position = {
    latitude: number;
    longitude: number;
};

type MapRestaurant = {
    id: number;
    name: string;
    imageUrl: string | null;
    address: {
        street: string;
        city: string;
        country: string;
        latitude: number | null;
        longitude: number | null;
    };
};

type LeafletMapProps = {
    restaurants: MapRestaurant[];
    selectedRestaurantId: number | null;
    highlightedRestaurantId: number | null;
    onSelectRestaurant: (restaurantId: number) => void;
    onMapReady?: () => void;
    userLocation: Position | null;
    center: Position;
    zoom: number;
};

type LeafletMapInstance = {
    setView: (center: [number, number], zoom?: number) => LeafletMapInstance;
    remove: () => void;
    on: (event: string, handler: () => void) => LeafletMapInstance;
    off: (event: string, handler: () => void) => LeafletMapInstance;
    getContainer: () => HTMLElement;
    invalidateSize: () => LeafletMapInstance;
    addLayer: (layer: LeafletLayer) => LeafletMapInstance;
    removeLayer: (layer: LeafletLayer) => LeafletMapInstance;
};

type LeafletLayer = {
    addTo: (map: LeafletMapInstance) => LeafletLayer;
    remove: () => void;
    bindPopup?: (content: HTMLElement | string) => LeafletLayer;
    openPopup?: () => void;
    closePopup?: () => void;
    setLatLng?: (latLng: [number, number]) => LeafletLayer;
};

type LeafletMarker = LeafletLayer & {
    setIcon: (icon: LeafletDivIcon) => LeafletMarker;
    on: (event: string, handler: () => void) => LeafletMarker;
    off: (event: string, handler: () => void) => LeafletMarker;
    bindPopup: (content: HTMLElement | string) => LeafletMarker;
    openPopup: () => LeafletMarker;
    closePopup: () => LeafletMarker;
    setLatLng: (latLng: [number, number]) => LeafletMarker;
};

type LeafletTileLayer = LeafletLayer;

type LeafletDivIcon = unknown;

type LeafletGlobal = {
    map: (element: HTMLElement, options: { center: [number, number]; zoom: number; zoomControl?: boolean; scrollWheelZoom?: boolean }) => LeafletMapInstance;
    tileLayer: (url: string, options: { attribution: string }) => LeafletTileLayer;
    marker: (latLng: [number, number], options?: { icon?: LeafletDivIcon; interactive?: boolean }) => LeafletMarker;
    divIcon: (options: { className: string; html: string; iconSize: [number, number]; iconAnchor: [number, number] }) => LeafletDivIcon;
};

declare global {
    interface Window {
        L?: LeafletGlobal;
    }
}

function getLeaflet() {
    return typeof window === "undefined" ? undefined : window.L;
}

function createRestaurantIcon(leaflet: LeafletGlobal, active: boolean) {
    return leaflet.divIcon({
        className: "",
        html: `<span class="leaflet-restaurant-marker ${active ? "is-active" : ""}"></span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
}

function createUserIcon(leaflet: LeafletGlobal) {
    return leaflet.divIcon({
        className: "",
        html: '<span class="leaflet-user-marker"></span>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
}

export default function LeafletMap({
    restaurants,
    selectedRestaurantId,
    highlightedRestaurantId,
    onSelectRestaurant,
    onMapReady,
    userLocation,
    center,
    zoom,
}: LeafletMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<LeafletMapInstance | null>(null);
    const markerLayerRef = useRef<{ remove: () => void }[]>([]);
    const [leaflet, setLeaflet] = useState<LeafletGlobal | null>(null);

    const markers = useMemo(
        () => restaurants.filter((restaurant) => restaurant.address.latitude != null && restaurant.address.longitude != null),
        [restaurants],
    );

    useEffect(() => {
        let cancelled = false;

        const resolveLeaflet = () => {
            const nextLeaflet = getLeaflet();
            if (!cancelled && nextLeaflet) {
                setLeaflet(nextLeaflet);
                return true;
            }
            return false;
        };

        if (!resolveLeaflet()) {
            const interval = window.setInterval(() => {
                if (resolveLeaflet()) {
                    window.clearInterval(interval);
                }
            }, 50);

            return () => {
                cancelled = true;
                window.clearInterval(interval);
            };
        }

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!leaflet || !containerRef.current || mapRef.current) {
            return;
        }

        const map = leaflet.map(containerRef.current, {
            center: [center.latitude, center.longitude],
            zoom,
            zoomControl: false,
            scrollWheelZoom: true,
        });

        leaflet
            .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            })
            .addTo(map);

        mapRef.current = map;
        onMapReady?.();

        return () => {
            markerLayerRef.current.forEach((layer) => layer.remove());
            markerLayerRef.current = [];
            map.remove();
            mapRef.current = null;
        };
    }, [center.latitude, center.longitude, leaflet, onMapReady, zoom]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }

        mapRef.current.setView([center.latitude, center.longitude], zoom);
    }, [center.latitude, center.longitude, zoom]);

    useEffect(() => {
        if (!mapRef.current || !leaflet) {
            return;
        }

        markerLayerRef.current.forEach((layer) => layer.remove());
        markerLayerRef.current = [];

        const map = mapRef.current;

        markers.forEach((restaurant) => {
            const latitude = restaurant.address.latitude as number;
            const longitude = restaurant.address.longitude as number;
            const isActive = restaurant.id === selectedRestaurantId || restaurant.id === highlightedRestaurantId;
            const marker = leaflet.marker([latitude, longitude], {
                icon: createRestaurantIcon(leaflet, isActive),
            });

            marker.on("click", () => onSelectRestaurant(restaurant.id));

            const popup = document.createElement("div");
            popup.className = "min-w-[180px]";

            const title = document.createElement("p");
            title.className = "font-semibold text-[#141414]";
            title.textContent = restaurant.name;

            const address = document.createElement("p");
            address.className = "mt-1 text-xs text-black/65";
            address.textContent = `${restaurant.address.street}, ${restaurant.address.city}`;

            popup.append(title, address);

            marker.bindPopup(popup);
            marker.addTo(map);
            markerLayerRef.current.push(marker);
        });

        if (userLocation) {
            const userMarker = leaflet.marker([userLocation.latitude, userLocation.longitude], {
                icon: createUserIcon(leaflet),
                interactive: false,
            });

            userMarker.addTo(map);
            markerLayerRef.current.push(userMarker);
        }
    }, [highlightedRestaurantId, leaflet, markers, onSelectRestaurant, selectedRestaurantId, userLocation]);

    return <div ref={containerRef} className="h-full w-full" />;
}
