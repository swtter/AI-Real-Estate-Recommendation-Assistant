import streamlit as st
from streamlit_folium import st_folium

from utils.data_loader import load_properties
from utils.map_utils import build_property_map
from utils.recommendation_engine import apply_filters_and_scores, short_match_reason


st.title("Find Your Best-Matched Property")
st.caption("Adjust your preferences to see ranked homes and their locations on the map.")

properties = load_properties()

rent_min = int(properties["weekly_rent"].min())
rent_max = int(properties["weekly_rent"].max())
commute_max = int(properties["commute_time"].max())

with st.sidebar:
    st.header("Your Preferences")
    budget = st.slider("Budget", rent_min, rent_max, (rent_min, rent_max), step=50)
    property_type = st.selectbox(
        "Property Type",
        ["Any"] + sorted(properties["property_type"].unique().tolist()),
    )
    room_type = st.selectbox(
        "Room Type",
        ["Any"] + sorted(properties["room_type"].unique().tolist()),
    )
    suburb = st.selectbox(
        "Suburb",
        ["Any"] + sorted(properties["suburb"].unique().tolist()),
    )
    pet_friendly = st.selectbox("Pet Friendly", ["Any", "Yes", "No"])
    school_zone = st.selectbox("School Zone", ["Any", "Yes", "No"])
    max_commute = st.slider("Maximum Commute Time", 5, commute_max, commute_max, step=5)

preferences = {
    "min_budget": budget[0],
    "max_budget": budget[1],
    "property_type": property_type,
    "room_type": room_type,
    "suburb": suburb,
    "pet_friendly": pet_friendly,
    "school_zone": school_zone,
    "max_commute": max_commute,
}

recommendations = apply_filters_and_scores(properties, preferences)

map_column, summary_column = st.columns([2, 1])
with map_column:
    st.subheader("Map View")
    st_folium(build_property_map(recommendations), width=None, height=430)

with summary_column:
    st.metric("Matching Properties", len(recommendations))
    if not recommendations.empty:
        st.metric("Top Match Score", f"{int(recommendations.iloc[0]['match_score'])}%")
        st.metric("Lowest Weekly Rent", f"${int(recommendations['weekly_rent'].min())}/wk")
    else:
        st.info("No properties match the current filters.")

st.subheader("Property Recommendations")

if recommendations.empty:
    st.warning("Try widening your budget, commute time, or location filters.")
else:
    for _, property_row in recommendations.iterrows():
        with st.container(border=True):
            image_column, detail_column = st.columns([1, 2])

            with image_column:
                st.image(property_row["image_url"], use_container_width=True)

            with detail_column:
                title_column, score_column = st.columns([3, 1])
                with title_column:
                    st.markdown(f"### {property_row['name']}")
                    st.write(f"{property_row['suburb']} | {property_row['property_type']} | {property_row['room_type']}")
                with score_column:
                    st.metric("Match Score", f"{int(property_row['match_score'])}%")

                st.write(f"**${int(property_row['weekly_rent'])}/week**")
                st.write(property_row["short_description"])
                st.caption(short_match_reason(property_row, preferences))

                st.write(
                    f"{int(property_row['bedrooms'])} bed | "
                    f"{int(property_row['bathrooms'])} bath | "
                    f"{int(property_row['parking'])} parking | "
                    f"Pet friendly: {property_row['pet_friendly']} | "
                    f"School zone: {property_row['school_zone']} | "
                    f"{int(property_row['commute_time'])} min commute"
                )
