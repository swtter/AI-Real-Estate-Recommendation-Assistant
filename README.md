# AI Property Recommendation Assistant Prototype

This is a simple web-based property recommendation prototype for a data analyst internship final project. It uses HTML, CSS, JavaScript, Leaflet.js, and sample data from `properties.json`.

## Features

- Property listing cards with images, rent, suburb, type, room type, bedrooms, bathrooms, parking, and short descriptions
- Interactive Leaflet map with property markers
- Filters for property type, room type, budget, suburb, pet-friendly requirement, school zone requirement, and commute time
- Match score out of 100 for each visible property
- Matching properties sorted from highest score to lowest score
- Clicking a card moves the map to that property
- Clicking a marker shows the property name, rent, room type, and match score

## How To Run Locally

Open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then open this address in your browser:

```text
http://localhost:8000
```

If you are using GitHub Codespaces, run the same command in the terminal and open the forwarded port `8000`.

## Why Use A Local Server?

The website loads property data with JavaScript using:

```js
fetch("properties.json")
```

Most browsers block or limit `fetch()` requests when opening `index.html` directly from your computer as a local file. Running a local server makes the project behave like a normal website, so `properties.json`, Leaflet, the map, and the property cards load correctly.

## Project Files

- `index.html` - page structure and filter controls
- `style.css` - modern real estate listing layout and card styles
- `script.js` - filtering, scoring, sorting, map markers, and card interactions
- `properties.json` - sample property data
