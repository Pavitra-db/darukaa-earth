import math
import requests


GBIF_URL = "https://api.gbif.org/v1/occurrence/search"


def calculate_distance_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """
    Calculate distance between two geographic coordinates
    using the Haversine formula.
    """

    earth_radius_km = 6371.0

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)

    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad)
        * math.cos(lat2_rad)
        * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a),
    )

    return earth_radius_km * c


def fetch_biodiversity(
    latitude: float,
    longitude: float,
    radius_km: float = 25,
):
    """
    Fetch recorded biodiversity observations near a
    monitoring site.

    GBIF records are occurrence records, not a complete
    census of every species present at the site.
    """

    # Approximate geographic bounding box.
    # 1 degree latitude is approximately 111 km.
    lat_delta = radius_km / 111.0

    # Longitude degrees vary with latitude.
    lon_delta = radius_km / (
        111.0 * max(math.cos(math.radians(latitude)), 0.01)
    )

    min_lat = latitude - lat_delta
    max_lat = latitude + lat_delta

    min_lon = longitude - lon_delta
    max_lon = longitude + lon_delta

    params = {
        "decimalLatitude": f"{min_lat},{max_lat}",
        "decimalLongitude": f"{min_lon},{max_lon}",
        "occurrenceStatus": "present",
        "hasCoordinate": "true",
        "limit": 300,
        "offset": 0,
    }

    response = requests.get(
        GBIF_URL,
        params=params,
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    results = data.get("results", [])

    # Keep only observations actually inside
    # the requested radius.
    nearby_records = []

    for record in results:
        record_lat = record.get("decimalLatitude")
        record_lon = record.get("decimalLongitude")

        if record_lat is None or record_lon is None:
            continue

        distance = calculate_distance_km(
            latitude,
            longitude,
            float(record_lat),
            float(record_lon),
        )

        if distance <= radius_km:
            nearby_records.append(record)

    species = {}

    for record in nearby_records:
        scientific_name = record.get("scientificName")

        if not scientific_name:
            continue

        common_name = record.get("vernacularName")
        kingdom = record.get("kingdom")
        phylum = record.get("phylum")
        class_name = record.get("class")
        order = record.get("order")

        if scientific_name not in species:
            species[scientific_name] = {
                "scientific_name": scientific_name,
                "common_name": common_name,
                "kingdom": kingdom,
                "phylum": phylum,
                "class_name": class_name,
                "order": order,
                "observation_count": 0,
            }

        species[scientific_name]["observation_count"] += 1

    species_list = list(species.values())

    kingdom_counts = {}

    for item in species_list:
        kingdom = item.get("kingdom") or "Unknown"

        kingdom_counts[kingdom] = (
            kingdom_counts.get(kingdom, 0) + 1
        )

    return {
        "latitude": latitude,
        "longitude": longitude,
        "radius_km": radius_km,
        "total_occurrences": len(nearby_records),
        "recorded_species": len(species_list),
        "kingdom_counts": kingdom_counts,
        "species": species_list,
    }