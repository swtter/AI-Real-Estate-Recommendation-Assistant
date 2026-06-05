from pathlib import Path

import pandas as pd
import streamlit as st


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "properties.csv"


@st.cache_data
def load_properties() -> pd.DataFrame:
    """Load property data from CSV and normalize expected column types."""
    df = pd.read_csv(DATA_PATH)

    numeric_columns = [
        "weekly_rent",
        "bedrooms",
        "bathrooms",
        "parking",
        "commute_time",
        "latitude",
        "longitude",
    ]
    for column in numeric_columns:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    return df
