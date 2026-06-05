import pandas as pd
import plotly.express as px
import streamlit as st

from utils.data_loader import load_properties


st.set_page_config(page_title="Project Analytics", layout="wide")

st.title("Project Analytics")
st.caption("Review property data and prototype feedback results.")

properties = load_properties()

st.subheader("Property Dataset Overview")
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Properties", len(properties))
col2.metric("Average Rent", f"${properties['weekly_rent'].mean():.0f}/wk")
col3.metric("Average Commute", f"{properties['commute_time'].mean():.0f} min")
col4.metric("Pet Friendly", int((properties["pet_friendly"] == "Yes").sum()))

chart_col1, chart_col2 = st.columns(2)
with chart_col1:
    type_counts = properties["property_type"].value_counts().reset_index()
    type_counts.columns = ["property_type", "count"]
    st.plotly_chart(
        px.bar(type_counts, x="property_type", y="count", title="Properties By Type"),
        use_container_width=True,
    )

with chart_col2:
    st.plotly_chart(
        px.scatter(
            properties,
            x="commute_time",
            y="weekly_rent",
            color="property_type",
            hover_name="name",
            title="Rent vs Commute Time",
        ),
        use_container_width=True,
    )

st.subheader("User Testing Feedback")
feedback = pd.DataFrame(st.session_state.get("feedback", []))

if feedback.empty:
    st.info("No live testing feedback found. Showing sample feedback for demonstration.")
    feedback = pd.DataFrame(
        [
            {"tester_name": "Tester A", "satisfaction": 4, "ease_of_use": 5, "recommendation_quality": 4},
            {"tester_name": "Tester B", "satisfaction": 5, "ease_of_use": 4, "recommendation_quality": 5},
            {"tester_name": "Tester C", "satisfaction": 3, "ease_of_use": 4, "recommendation_quality": 3},
        ]
    )

metric_col1, metric_col2, metric_col3 = st.columns(3)
metric_col1.metric("Avg Satisfaction", f"{feedback['satisfaction'].mean():.1f}/5")
metric_col2.metric("Avg Ease Of Use", f"{feedback['ease_of_use'].mean():.1f}/5")
metric_col3.metric("Avg Recommendation Quality", f"{feedback['recommendation_quality'].mean():.1f}/5")

feedback_long = feedback.melt(
    id_vars=["tester_name"],
    value_vars=["satisfaction", "ease_of_use", "recommendation_quality"],
    var_name="metric",
    value_name="score",
)

st.plotly_chart(
    px.bar(
        feedback_long,
        x="metric",
        y="score",
        color="tester_name",
        barmode="group",
        title="User Testing Scores",
    ),
    use_container_width=True,
)
