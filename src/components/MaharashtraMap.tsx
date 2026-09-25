import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

const habitations = [
  {
    id: "HAB-001",
    name: "Shivapur",
    district: "Raigad",
    lat: 18.08,
    lng: 73.42,
    risk: 92,
    category: "red",
  },
  {
    id: "HAB-002",
    name: "Mahad",
    district: "Raigad",
    lat: 18.08,
    lng: 73.42,
    risk: 78,
    category: "warning",
  },
  {
    id: "HAB-003",
    name: "Satara Village",
    district: "Satara",
    lat: 17.68,
    lng: 73.99,
    risk: 88,
    category: "red",
  },
  {
    id: "HAB-004",
    name: "Pune Rural",
    district: "Pune",
    lat: 18.52,
    lng: 73.85,
    risk: 64,
    category: "warning",
  },
  {
    id: "HAB-005",
    name: "Nashik Village",
    district: "Nashik",
    lat: 20.0,
    lng: 73.78,
    risk: 35,
    category: "safe",
  },
];

function getColor(category: string) {
  if (category === "red") return "red";
  if (category === "warning") return "orange";
  return "green";
}

function MaharashtraMap() {
  return (
    <div className="h-full w-full overflow-hidden rounded-xl">
      <MapContainer
        center={[19.0, 76.0]}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {habitations.map((habitation) => (
          <CircleMarker
            key={habitation.id}
            center={[habitation.lat, habitation.lng]}
            radius={10}
            pathOptions={{
              color: getColor(habitation.category),
              fillColor: getColor(habitation.category),
              fillOpacity: 0.75,
            }}
          >
            <Popup>
              <div>
                <strong>{habitation.name}</strong>

                <br />

                District: {habitation.district}

                <br />

                Risk Score: {habitation.risk}/100

                <br />

                Category: {habitation.category.toUpperCase()}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MaharashtraMap;