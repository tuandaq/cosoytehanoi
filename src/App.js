import React, { useEffect, useState, useCallback, memo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import {
  Container,
  Typography,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [ 25, 41 ],
  iconAnchor: [ 12, 41 ],
  popupAnchor: [ 1, -34 ],
});

function SetView({ coords, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, zoom);
    }
  }, [ coords, zoom, map ]);
  return null;
}

const Routing = ({ from, to }) => {
  const map = useMap();

  useEffect(() => {
    if (!from || !to || !map) return;

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
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        try {
          map.removeControl(routingControl);
        } catch (error) {
          console.warn("Không thể xoá routing control:", error);
        }
      }
    };
  }, [ from, to, map ]);

  return null;
};

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
      {userLocation && (
        <Circle
          center={userLocation}
          radius={100}
          pathOptions={{ color: "blue", fillOpacity: 0.2 }}
        />
      )}
      {routingTarget && userLocation && (
        <Routing from={userLocation} to={routingTarget} />
      )}
      {data.map((item, index) => (
        <Marker
          key={index}
          position={[
            item.geometry.coordinates[ 1 ],
            item.geometry.coordinates[ 0 ],
          ]}
          icon={customIcon}
        >
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
  );
});

function App() {
  const [ geoData, setGeoData ] = useState([]);
  const [ search, setSearch ] = useState("");
  const [ filterType, setFilterType ] = useState("Tất cả");
  const [ userLocation, setUserLocation ] = useState(null);
  const [ loadingLocation, setLoadingLocation ] = useState(false);
  const [ locationError, setLocationError ] = useState(null);
  const [ routingTarget, setRoutingTarget ] = useState(null);

  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    setLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([ pos.coords.latitude, pos.coords.longitude ]);
        setLoadingLocation(false);
      },
      (err) => {
        setLocationError("Không thể lấy vị trí: " + err.message);
        setLoadingLocation(false);
      }
    );
  }, []);

  useEffect(() => {
    axios.get("/data/hanoi_health.geojson").then((res) => {
      setGeoData(res.data.features);
    });
    fetchUserLocation();
  }, [ fetchUserLocation ]);

  const filteredData = geoData.filter((item) => {
    const matchesName = item.properties.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "Tất cả" || item.properties.type === filterType;
    return matchesName && matchesType;
  });

  const uniqueTypes = [ ...new Set(geoData.map((item) => item.properties.type)) ];

  const handleRouteTo = (item) => {
    setRoutingTarget([
      item.geometry.coordinates[ 1 ],
      item.geometry.coordinates[ 0 ],
    ]);
  };

  const handleClearRoute = () => setRoutingTarget(null);

  return (
    <Container maxWidth="lg" sx={{
      my: 3,
      fontFamily: "'Roboto', sans-serif",
      backgroundColor: "#f5f7fa",
      borderRadius: 3,
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      p: 3,
    }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Bản đồ cơ sở Y tế Hà Nội
      </Typography>

      <Box sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        mb: 3,
        alignItems: "center",
      }}>
        <TextField
          label="Tìm kiếm cơ sở y tế"
          variant="outlined"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setRoutingTarget(null);
          }}
          sx={{
            flex: "1 1 320px",
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
          }}
        />
        <FormControl sx={{
          minWidth: 160,
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
        }}>
          <InputLabel>Loại hình</InputLabel>
          <Select
            value={filterType}
            label="Loại hình"
            onChange={(e) => {
              setFilterType(e.target.value);
              setRoutingTarget(null);
            }}
          >
            <MenuItem value="Tất cả">Tất cả</MenuItem>
            {uniqueTypes.map((type, idx) => (
              <MenuItem key={idx} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={fetchUserLocation}
          disabled={loadingLocation}
          sx={{
            height: 56,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {loadingLocation ? <CircularProgress size={24} /> : "Định vị lại"}
        </Button>
        {routingTarget && (
          <Button
            variant="outlined"
            onClick={handleClearRoute}
            sx={{
              height: 56,
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Xoá chỉ đường
          </Button>
        )}
      </Box>

      {locationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {locationError}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, height: "80vh" }}>
        <Box sx={{
          width: "320px",
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 1,
          p: 2,
          bgcolor: "#f9f9f9",
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Danh sách kết quả ({filteredData.length})
          </Typography>
          {filteredData.length > 0 ? (
            <List>
              {filteredData.map((item, idx) => (
                <ListItem
                  key={idx}
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleRouteTo(item)}
                >
                  <ListItemText
                    primary={item.properties.name}
                    secondary={
                      item.properties.address +
                      " | Loại hình: " +
                      item.properties.type
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2">Không tìm thấy cơ sở y tế phù hợp.</Typography>
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <MapComponent
            data={filteredData}
            userLocation={userLocation}
            routingTarget={routingTarget}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default App;
