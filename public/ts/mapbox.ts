import 'mapbox-gl/dist/mapbox-gl.css';

import mapboxgl from 'mapbox-gl';

type Location = {
  description: string;
  type: 'Point';
  coordinates: [number, number];
  day: number;
};

export function displayMap(locations: Location[]) {
  const map = new mapboxgl.Map({
    container: 'map',
    accessToken: import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN,
    style: 'mapbox://styles/bagdenius/cmlijvfhc00iq01qxbx2oc1n9',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    const element = document.createElement('div');
    element.className = 'marker';

    new mapboxgl.Marker({
      element,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    new mapboxgl.Popup({ offset: 30, focusAfterOpen: false })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 },
  });
}
