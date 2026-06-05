import streamlit as st


st.set_page_config(
    page_title="AI Property Recommendation Assistant",
    layout="wide",
)


property_search_page = st.Page(
    "pages/1_Property_Search.py",
    title="Property Recommendations",
)
user_testing_page = st.Page(
    "pages/2_User_Testing.py",
    title="User Testing",
)
analytics_page = st.Page(
    "pages/3_Project_Analytics.py",
    title="Project Analytics",
)

with st.sidebar:
    st.markdown("### HomeMatch AI")
    st.caption("Personalized property recommendations")
    with st.expander("Admin / Evaluation", expanded=False):
        show_evaluation_pages = st.checkbox("Show evaluation pages")

if show_evaluation_pages:
    navigation = st.navigation(
        {
            "Customer Experience": [property_search_page],
            "Admin / Evaluation": [user_testing_page, analytics_page],
        }
    )
else:
    navigation = st.navigation(
        {
            "Customer Experience": [property_search_page],
        }
    )

navigation.run()
