"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Container, Typography, Box } from "@mui/material"
import axios from "axios"
import MapComponent from "./components/MapComponent.jsx"
import SearchFilters from "./components/SearchFilters.jsx"
import LocationControls from "./components/LocationControls.jsx"
import ResultsList from "./components/ResultsList.jsx"

function App() {
  const [ geoData, setGeoData ] = useState([])
  const [ search, setSearch ] = useState("")
  const [ filterType, setFilterType ] = useState("Tất cả")
  const [ userLocation, setUserLocation ] = useState(null)
  const [ loadingLocation, setLoadingLocation ] = useState(false)
  const [ locationError, setLocationError ] = useState(null)
  const [ routingTarget, setRoutingTarget ] = useState(null)
  const routingTimeoutRef = useRef(null)

  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị.")
      return
    }
    setLoadingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([ pos.coords.latitude, pos.coords.longitude ])
        setLoadingLocation(false)
      },
      (err) => {
        setLocationError("Không thể lấy vị trí: " + err.message)
        setLoadingLocation(false)
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 300000, // 5 minutes
      },
    )
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/data/hanoi_health.geojson")
        setGeoData(response.data.features)
      } catch (error) {
        console.error("Error fetching geo data:", error)
        setLocationError("Không thể tải dữ liệu bản đồ")
      }
    }

    fetchData()
    fetchUserLocation()
  }, [ fetchUserLocation ])

  const filteredData = geoData.filter((item) => {
    const matchesName = item.properties.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === "Tất cả" || item.properties.type === filterType
    return matchesName && matchesType
  })

  const uniqueTypes = [ ...new Set(geoData.map((item) => item.properties.type)) ]

  const handleRouteTo = (item) => {
    try {
      if (routingTimeoutRef.current) {
        clearTimeout(routingTimeoutRef.current)
      }

      // Clear existing route immediately
      setRoutingTarget(null)

      // Set new route after delay to prevent conflicts
      routingTimeoutRef.current = setTimeout(() => {
        const newTarget = [ item.geometry.coordinates[ 1 ], item.geometry.coordinates[ 0 ] ]
        setRoutingTarget(newTarget)
      }, 300)
    } catch (error) {
      console.error("Error setting route target:", error)
    }
  }

  const handleClearRoute = () => {
    if (routingTimeoutRef.current) {
      clearTimeout(routingTimeoutRef.current)
    }
    setRoutingTarget(null)
  }

  const handleSearchChange = () => {
    if (routingTimeoutRef.current) {
      clearTimeout(routingTimeoutRef.current)
    }
    setRoutingTarget(null)
  }

  const handleFilterChange = () => {
    if (routingTimeoutRef.current) {
      clearTimeout(routingTimeoutRef.current)
    }
    setRoutingTarget(null)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (routingTimeoutRef.current) {
        clearTimeout(routingTimeoutRef.current)
      }
    }
  }, [])

  return (
    <Container
      maxWidth="lg"
      sx={{
        my: 3,
        fontFamily: "'Roboto', sans-serif",
        backgroundColor: "#f5f7fa",
        borderRadius: 3,
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        p: 3,
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Bản đồ cơ sở Y tế Hà Nội
      </Typography>

      <Box display={'flex'} sx={{ mb: 3 }} gap={2}>
        <Box width={'70%'} sx={{ display: "flex", gap: 2, mb: 2 }}>
          <SearchFilters
            search={search}
            setSearch={setSearch}
            filterType={filterType}
            setFilterType={setFilterType}
            uniqueTypes={uniqueTypes}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
          />
        </Box>

        <LocationControls
          loadingLocation={loadingLocation}
          locationError={locationError}
          routingTarget={routingTarget}
          onFetchLocation={fetchUserLocation}
          onClearRoute={handleClearRoute}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, height: "80vh" }}>
        <ResultsList filteredData={filteredData} onItemClick={handleRouteTo} />
        <Box sx={{ flexGrow: 1 }}>
          <MapComponent data={filteredData} userLocation={userLocation} routingTarget={routingTarget} />
        </Box>
      </Box>
    </Container>
  )
}

export default App
