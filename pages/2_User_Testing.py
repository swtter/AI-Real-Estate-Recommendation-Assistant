import pandas as pd
import streamlit as st


st.title("User Testing")
st.caption("Collect quick satisfaction scores from prototype testers.")

if "feedback" not in st.session_state:
    st.session_state.feedback = []

with st.form("user_testing_form"):
    tester_name = st.text_input("Tester Name")
    satisfaction = st.slider("Overall Satisfaction Score", 1, 5, 4)
    ease_of_use = st.slider("Ease Of Use Score", 1, 5, 4)
    recommendation_quality = st.slider("Recommendation Quality Score", 1, 5, 4)
    comments = st.text_area("Short Comments")
    submitted = st.form_submit_button("Submit Feedback")

if submitted:
    st.session_state.feedback.append(
        {
            "tester_name": tester_name or "Anonymous",
            "satisfaction": satisfaction,
            "ease_of_use": ease_of_use,
            "recommendation_quality": recommendation_quality,
            "comments": comments,
        }
    )
    st.success("Feedback saved for this session.")

feedback_df = pd.DataFrame(st.session_state.feedback)

st.subheader("Collected Feedback")
if feedback_df.empty:
    st.info("No feedback has been submitted in this session yet.")
else:
    st.dataframe(feedback_df, use_container_width=True)
    st.download_button(
        "Download Feedback CSV",
        feedback_df.to_csv(index=False),
        file_name="user_testing_feedback.csv",
        mime="text/csv",
    )
