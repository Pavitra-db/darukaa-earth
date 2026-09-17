from datetime import date, timedelta

import requests


NASA_POWER_URL = (
    "https://power.larc.nasa.gov/api/temporal/daily/point"
)


# NASA POWER uses -999 as a missing/invalid value.
MISSING_VALUE = -999


def is_valid_value(value):
    """
    Check whether a NASA POWER value is valid.
    """
    return (
        value is not None
        and float(value) != MISSING_VALUE
    )


def fetch_latest_weather(
    latitude: float,
    longitude: float,
):
    """
    Fetch the latest available valid daily
    weather data from NASA POWER.

    Parameters:
        latitude: Monitoring site latitude
        longitude: Monitoring site longitude

    Returns:
        Latest valid temperature and rainfall data.
    """

    # Look back 14 days because NASA POWER
    # near-real-time data can have a delay.
    end_date = date.today()
    start_date = end_date - timedelta(days=14)

    params = {
        "parameters": "T2M,PRECTOTCORR",
        "community": "AG",
        "longitude": longitude,
        "latitude": latitude,
        "start": start_date.strftime("%Y%m%d"),
        "end": end_date.strftime("%Y%m%d"),
        "format": "JSON",
    }

    response = requests.get(
        NASA_POWER_URL,
        params=params,
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    parameters = (
        data
        .get("properties", {})
        .get("parameter", {})
    )

    temperature_data = parameters.get(
        "T2M",
        {}
    )

    rainfall_data = parameters.get(
        "PRECTOTCORR",
        {}
    )

    if not temperature_data:
        raise ValueError(
            "NASA POWER returned no temperature data."
        )

    # Sort newest -> oldest
    available_dates = sorted(
        temperature_data.keys(),
        reverse=True
    )

    # Find the newest date with valid data.
    for current_date in available_dates:

        temperature = temperature_data.get(
            current_date
        )

        rainfall = rainfall_data.get(
            current_date
        )

        # We need at least temperature to be valid.
        if is_valid_value(temperature):

            # Rainfall may independently be missing.
            if not is_valid_value(rainfall):
                rainfall = None

            return {
                "date": current_date,
                "temperature": float(temperature),
                "rainfall": (
                    float(rainfall)
                    if rainfall is not None
                    else None
                ),
            }

    raise ValueError(
        "NASA POWER did not return any valid "
        "weather values for the requested period."
    )