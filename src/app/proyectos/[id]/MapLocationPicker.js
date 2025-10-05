"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Default center (Mexico City)
const defaultCenter = {
  lat: 19.432608,
  lng: -99.133209,
};

// Custom hook to load Google Maps API
function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for it to load
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Load the script with proper async loading pattern
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => setIsLoaded(true);
    script.onerror = () => setLoadError("Failed to load Google Maps");

    document.head.appendChild(script);

    return () => {
      // Don't remove script on cleanup to avoid reloading
    };
  }, []);

  return { isLoaded, loadError };
}

// Map component using native Google Maps API
function MapComponent({
  mapCenter,
  selectedLocation,
  isEditing,
  searchValue,
  setSearchValue,
  onLocationSelect,
  onMapCenterChange,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const clickListenerRef = useRef(null);

  // Initialize map only once
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    // Don't reinitialize if map already exists
    if (mapInstanceRef.current) return;

    // Create map instance
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 13,
      streetViewControl: false,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: "greedy",
    });

    // Cleanup function
    return () => {
      if (clickListenerRef.current) {
        window.google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array - initialize only once

  // Separate effect for click listener to ensure it updates with current props
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing listener
    if (clickListenerRef.current) {
      window.google.maps.event.removeListener(clickListenerRef.current);
    }

    // Add new click listener with current values
    clickListenerRef.current = mapInstanceRef.current.addListener(
      "click",
      (event) => {
        // console.log("Map clicked, isEditing:", isEditing);
        if (!isEditing) {
          // console.log("Click ignored - not in editing mode");
          return;
        }

        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        // console.log("Location selected:", { lat, lng });

        if (onLocationSelect) {
          onLocationSelect({ lat, lng });
        } else {
          // console.log("onLocationSelect is null");
        }
      }
    );

    return () => {
      if (clickListenerRef.current) {
        window.google.maps.event.removeListener(clickListenerRef.current);
      }
    };
  }, [isEditing, onLocationSelect]); // Update when these values change  // Update map center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && mapCenter) {
      mapInstanceRef.current.setCenter(mapCenter);
    }
  }, [mapCenter]);

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Add new marker if location exists
    if (selectedLocation) {
      markerRef.current = new window.google.maps.Marker({
        position: selectedLocation,
        map: mapInstanceRef.current,
        title: "Ubicación del proyecto",
      });
    }
  }, [selectedLocation]);

  const handleSearch = async () => {
    if (!searchValue.trim() || !window.google) return;

    try {
      // Use the new Places API with text search
      const { Place } = await window.google.maps.importLibrary("places");

      const request = {
        textQuery: searchValue,
        fields: ["displayName", "location"],
        language: "es",
        region: "MX", // Mexico region
      };

      const { places } = await Place.searchByText(request);

      if (places && places.length > 0) {
        const place = places[0];
        if (place.location) {
          const lat = place.location.lat();
          const lng = place.location.lng();

          // Pan map to search result but don't select location
          onMapCenterChange({ lat, lng });

          // Clear search
          setSearchValue("");
        }
      } else {
        alert(
          "No se encontró la ubicación. Intenta con otro término de búsqueda."
        );
      }
    } catch (error) {
      console.error("Error searching location:", error);
      alert("Error al buscar la ubicación. Intenta de nuevo.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search bar for navigation only */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Buscar ubicación para navegar..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Buscar
        </button>
      </div>

      {/* Map container */}
      <div className="border rounded-lg overflow-hidden">
        <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
        <div className="p-3 bg-gray-50 border-t text-sm text-gray-600">
          {isEditing
            ? "💡 Usa la búsqueda para navegar por el mapa y haz clic para seleccionar la ubicación"
            : "📍 Ubicación guardada - Habilita la edición para modificar"}
        </div>
      </div>
    </div>
  );
}

export function MapLocationPicker({
  initialLocation,
  onLocationChange,
  isEditing = false,
  centerOnSave = false,
}) {
  const { isLoaded, loadError } = useGoogleMaps();

  const [mapCenter, setMapCenter] = useState(
    initialLocation?.coordinates?.[0] !== 0 &&
      initialLocation?.coordinates?.[1] !== 0
      ? {
          lat: initialLocation.coordinates[0],
          lng: initialLocation.coordinates[1],
        }
      : defaultCenter
  );

  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation?.coordinates?.[0] !== 0 &&
      initialLocation?.coordinates?.[1] !== 0
      ? {
          lat: initialLocation.coordinates[0],
          lng: initialLocation.coordinates[1],
        }
      : null
  );

  const [manualLat, setManualLat] = useState(
    initialLocation?.coordinates?.[0] || ""
  );
  const [manualLng, setManualLng] = useState(
    initialLocation?.coordinates?.[1] || ""
  );

  const [showMap, setShowMap] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  // Sync internal state with prop changes
  useEffect(() => {
    if (
      initialLocation?.coordinates?.[0] !== 0 &&
      initialLocation?.coordinates?.[1] !== 0
    ) {
      const newLocation = {
        lat: initialLocation.coordinates[0],
        lng: initialLocation.coordinates[1],
      };
      setSelectedLocation(newLocation);
      // Center map if:
      // 1. It's the initial load (no previous selectedLocation), OR
      // 2. We're not in editing mode (viewing saved location)
      if (!selectedLocation || !isEditing) {
        setMapCenter(newLocation);
      }
      setManualLat(initialLocation.coordinates[0].toString());
      setManualLng(initialLocation.coordinates[1].toString());
    } else {
      setSelectedLocation(null);
      if (!selectedLocation || !isEditing) {
        setMapCenter(defaultCenter);
      }
      setManualLat("");
      setManualLng("");
    }
  }, [initialLocation, isEditing]);

  // Center map when save is triggered
  useEffect(() => {
    if (centerOnSave && selectedLocation) {
      setMapCenter(selectedLocation);
    }
  }, [centerOnSave, selectedLocation]);

  // Generate shareable Google Maps link
  const generateMapsLink = (location) => {
    return `https://www.google.com/maps/place/${location.lat},${location.lng}/@${location.lat},${location.lng},15z`;
  };

  // Copy link to clipboard
  const copyMapsLink = async (location) => {
    try {
      const link = generateMapsLink(location);
      await navigator.clipboard.writeText(link);
      setCopyStatus("¡Enlace copiado!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (err) {
      setCopyStatus("Error al copiar");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setManualLat(location.lat.toFixed(6));
    setManualLng(location.lng.toFixed(6));

    // Update parent component
    if (onLocationChange) {
      onLocationChange({
        type: "Point",
        coordinates: [location.lat, location.lng],
      });
    }
  };

  const handleMapCenterChange = (center) => {
    setMapCenter(center);
  };

  const handleManualUpdate = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Por favor ingresa coordenadas válidas");
      return;
    }

    if (lat < -90 || lat > 90) {
      alert("La latitud debe estar entre -90 y 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      alert("La longitud debe estar entre -180 y 180");
      return;
    }

    const newLocation = { lat, lng };
    setSelectedLocation(newLocation);
    setMapCenter(newLocation);

    // Update parent component
    if (onLocationChange) {
      onLocationChange({
        type: "Point",
        coordinates: [lat, lng],
      });
    }
  };

  const handleCenterOnLocation = () => {
    if (selectedLocation) {
      setMapCenter(selectedLocation);
    }
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setManualLat("");
    setManualLng("");

    if (onLocationChange) {
      onLocationChange({
        type: "Point",
        coordinates: [0, 0],
      });
    }
  };

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error cargando Google Maps: {loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Manual Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitud
          </label>
          <Input
            type="number"
            step="any"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            placeholder="Latitud"
            disabled={!isEditing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitud
          </label>
          <Input
            type="number"
            step="any"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            placeholder="Longitud"
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowMap(!showMap)}
          disabled={!isLoaded}
        >
          {showMap ? "Ocultar Mapa" : "Ver Mapa"}
        </Button>
        {isEditing && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualUpdate}
            >
              Actualizar desde Coordenadas
            </Button>
            {selectedLocation && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCenterOnLocation}
                >
                  Centrar Mapa
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={clearLocation}
                >
                  Limpiar Ubicación
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {/* Loading state */}
      {!isLoaded && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-600">Cargando Google Maps...</p>
        </div>
      )}

      {/* Current Location Display */}
      {selectedLocation && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div>
            <p className="text-sm text-blue-800">
              <strong>Ubicación seleccionada:</strong>
              <br />
              Latitud: {selectedLocation.lat.toFixed(6)}
              <br />
              Longitud: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>

          {/* Shareable Link Section */}
          <div className="border-t border-blue-200 pt-3">
            <p className="text-xs text-blue-600 mb-2 font-medium">
              Enlace para compartir ubicación:
            </p>
            <div className="flex gap-2 items-center">
              <div className="flex-1 bg-white border border-blue-300 rounded px-2 py-1">
                <p className="text-xs text-gray-700 truncate">
                  {generateMapsLink(selectedLocation)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyMapsLink(selectedLocation)}
                className="px-3 py-1 text-xs"
              >
                {copyStatus || "Copiar"}
              </Button>
            </div>
            <p className="text-xs text-blue-500 mt-1">
              Comparte este enlace para que otros puedan ver la ubicación en
              Google Maps
            </p>
          </div>
        </div>
      )}

      {/* Map Section */}
      {showMap && isLoaded && (
        <MapComponent
          mapCenter={mapCenter}
          selectedLocation={selectedLocation}
          isEditing={isEditing}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onLocationSelect={handleLocationSelect}
          onMapCenterChange={handleMapCenterChange}
        />
      )}
    </div>
  );
}
