"use client"

import { useEffect, memo, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import L from "leaflet"

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [ 25, 41 ],
  iconAnchor: [ 12, 41 ],
  popupAnchor: [ 1, -34 ],
})

function SetView({ coords, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (coords) {
      map.setView(coords, zoom)
    }
  }, [ coords, zoom, map ])
  return null
}

const Routing = ({ from, to }) => {
  const map = useMap()
  const routingControlRef = useRef(null)
  const isMountedRef = useRef(true)
  const timeoutRef = useRef(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!from || !to || !map || !isMountedRef.current) return

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Clean up existing routing control
    const cleanupExistingControl = () => {
      if (routingControlRef.current && map && isMountedRef.current) {
        try {
          if (map.hasLayer && map.hasLayer(routingControlRef.current)) {
            map.removeControl(routingControlRef.current)
          }
        } catch (error) {
          console.warn("Error removing existing routing control:", error)
        }
        routingControlRef.current = null
      }
    }

    cleanupExistingControl()

    // Add delay before creating new routing control
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current || !map) return

      try {
        const routingControl = L.Routing.control({
          waypoints: [ L.latLng(from), L.latLng(to) ],
          lineOptions: {
            styles: [ { color: "blue", weight: 6 } ],
          },
          routeWhileDragging: false,
          show: false,
          addWaypoints: false,
          draggableWaypoints: false,
          createMarker: () => null,
          router: L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1",
            timeout: 5000, // 5 second timeout
          }),
        })

        // Add error handling
        routingControl.on("routingerror", (e) => {
          console.warn("Routing error:", e.error)
          if (isMountedRef.current && routingControlRef.current) {
            cleanupExistingControl()
          }
        })

        // Handle routing success
        routingControl.on("routesfound", (e) => {
          if (!isMountedRef.current) {
            // If component unmounted, clean up immediately
            try {
              if (map && routingControl) {
                map.removeControl(routingControl)
              }
            } catch (error) {
              console.warn("Cleanup after routesfound:", error)
            }
          }
        })

        // Only add to map if component is still mounted
        if (isMountedRef.current && map) {
          routingControl.addTo(map)
          routingControlRef.current = routingControl
        }
      } catch (error) {
        console.error("Error creating routing control:", error)
      }
    }, 200) // 200ms delay

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Cleanup with additional safety checks
      if (routingControlRef.current && map && isMountedRef.current) {
        try {
          // Use setTimeout to ensure cleanup happens after any pending operations
          setTimeout(() => {
            if (routingControlRef.current && map && map.removeControl) {
              try {
                map.removeControl(routingControlRef.current)
              } catch (error) {
                console.warn("Error in delayed cleanup:", error)
              }
              routingControlRef.current = null
            }
          }, 50)
        } catch (error) {
          console.warn("Error in routing cleanup:", error)
        }
      }
    }
  }, [ from, to, map ])

  // Final cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (routingControlRef.current) {
        // Force cleanup without map checks since component is unmounting
        try {
          if (map && map.removeControl) {
            map.removeControl(routingControlRef.current)
          }
        } catch (error) {
          // Ignore errors during unmount
        }
        routingControlRef.current = null
      }
    }
  }, [ map ])

  return null
}

const MapComponent = memo(function MapComponent({ data, userLocation, routingTarget }) {
  return (
    <MapContainer
      center={userLocation || [ 21.0285, 105.8542 ]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {userLocation && <SetView coords={userLocation} zoom={13} />}
      {userLocation && <Circle center={userLocation} radius={100} pathOptions={{ color: "blue", fillOpacity: 0.2 }} />}
      {routingTarget && userLocation && <Routing from={userLocation} to={routingTarget} />}
      {data.map((item, index) => (
        <Marker key={index} position={[ item.geometry.coordinates[ 1 ], item.geometry.coordinates[ 0 ] ]} icon={customIcon}>
          <Popup>
            <strong>{item.properties.name}</strong>
            <br />
            {item.properties.address}
            <br />
            <em>Loại hình: {item.properties.type}</em>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
})

export default MapComponent
