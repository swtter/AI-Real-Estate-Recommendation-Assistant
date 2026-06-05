import streamlit as st

st.set_page_config(
    page_title="AI Property Recommendation Assistant",
    layout="wide",
)

st.title("AI Property Recommendation Assistant")
st.caption("A Streamlit prototype for matching renters or buyers with suitable properties.")

st.markdown(
    """
    This internship project demonstrates a simple AI-style recommendation workflow:

    - users enter property preferences,
    - the app filters matching listings,
    - a recommendation engine calculates a match score out of 100,
    - matching properties appear as cards and clickable map markers.

    Use the sidebar navigation to open **Property Search**, **User Testing**, or
    **Project Analytics**.
    """
)

st.info("Start with the Property Search page to explore recommendations.")
