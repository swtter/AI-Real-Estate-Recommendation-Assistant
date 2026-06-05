# AI Property Recommendation Assistant

This project is a Streamlit-based property recommendation assistant prototype for a data analyst internship final project.

The app helps prospective renters or buyers filter properties and view ranked recommendations based on budget, location, room type, pet preference, school zone preference, and commute time.

## Project Structure

```text
AI-Property-Recommendation-Assistant/
├── app.py
├── data/properties.csv
├── pages/
│   ├── 1_Property_Search.py
│   ├── 2_User_Testing.py
│   └── 3_Project_Analytics.py
├── utils/
│   ├── data_loader.py
│   ├── recommendation_engine.py
│   └── map_utils.py
├── assets/property_images/
├── requirements.txt
└── README.md
```

## Features

- Streamlit frontend
- Folium map embedded with `streamlit-folium`
- Property data stored in `data/properties.csv`
- Filters for budget, property type, room type, suburb, pet friendly, school zone, and commute time
- Match score out of 100
- Properties sorted by match score
- Property cards with image, name, price, suburb, room type, and score
- User testing page for collecting satisfaction scores
- Project analytics page with feedback charts

## How To Run Locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the Streamlit app:

```bash
streamlit run app.py
```

Streamlit will open the app in your browser. If it does not open automatically, use the local URL shown in the terminal, usually:

```text
http://localhost:8501
```

## Notes

This is a frontend prototype only. It does not include a backend database or chatbot yet. User testing feedback is stored in Streamlit session state during the current app session.
