import folium


def build_property_map(properties):
    """Create a Folium map with one clickable marker per matching property."""
    if properties.empty:
        return folium.Map(location=[-33.8688, 151.2093], zoom_start=11)

    center_lat = properties["latitude"].mean()
    center_lon = properties["longitude"].mean()
    property_map = folium.Map(location=[center_lat, center_lon], zoom_start=11)

    for _, row in properties.iterrows():
        popup_html = f"""
        <strong>{row['name']}</strong><br>
        ${int(row['weekly_rent'])}/wk<br>
        {row['room_type']}<br>
        Match Score: {int(row['match_score'])}%
        """
        folium.Marker(
            location=[row["latitude"], row["longitude"]],
            popup=folium.Popup(popup_html, max_width=260),
            tooltip=f"{row['name']} - {int(row['match_score'])}% match",
        ).add_to(property_map)

    return property_map
