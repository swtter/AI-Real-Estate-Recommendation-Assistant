import pandas as pd


def apply_filters_and_scores(df: pd.DataFrame, preferences: dict) -> pd.DataFrame:
    """Filter properties, calculate match scores, and sort best matches first."""
    scored = df.copy()
    scored["match_score"] = scored.apply(
        lambda row: calculate_match_score(row, preferences), axis=1
    )

    visible = scored[
        (scored["weekly_rent"].between(preferences["min_budget"], preferences["max_budget"]))
        & (scored["commute_time"] <= preferences["max_commute"])
    ]

    if preferences["property_type"] != "Any":
        visible = visible[visible["property_type"] == preferences["property_type"]]
    if preferences["room_type"] != "Any":
        visible = visible[visible["room_type"] == preferences["room_type"]]
    if preferences["suburb"] != "Any":
        visible = visible[visible["suburb"] == preferences["suburb"]]
    if preferences["pet_friendly"] != "Any":
        visible = visible[visible["pet_friendly"] == preferences["pet_friendly"]]
    if preferences["school_zone"] != "Any":
        visible = visible[visible["school_zone"] == preferences["school_zone"]]

    return visible.sort_values(["match_score", "weekly_rent"], ascending=[False, True])


def calculate_match_score(property_row: pd.Series, preferences: dict) -> int:
    """Calculate a transparent match score out of 100."""
    score = 0
    score += budget_score(
        property_row["weekly_rent"],
        preferences["min_budget"],
        preferences["max_budget"],
    )
    score += option_score(property_row["property_type"], preferences["property_type"], 15)
    score += option_score(property_row["room_type"], preferences["room_type"], 15)
    score += option_score(property_row["suburb"], preferences["suburb"], 10)
    score += option_score(property_row["pet_friendly"], preferences["pet_friendly"], 10)
    score += option_score(property_row["school_zone"], preferences["school_zone"], 10)
    score += commute_score(property_row["commute_time"], preferences["max_commute"])
    return int(round(score))


def option_score(actual: str, preferred: str, weight: int) -> int:
    if preferred == "Any":
        return weight
    return weight if actual == preferred else 0


def budget_score(rent: float, min_budget: float, max_budget: float) -> int:
    if rent < min_budget or rent > max_budget:
        return 0

    budget_range = max(max_budget - min_budget, 1)
    position = (rent - min_budget) / budget_range
    return round(15 + (1 - position) * 10)


def commute_score(commute_time: float, max_commute: float) -> int:
    if commute_time > max_commute:
        return 0

    commute_ratio = commute_time / max(max_commute, 1)
    return round(5 + (1 - commute_ratio) * 10)


def short_match_reason(property_row: pd.Series, preferences: dict) -> str:
    reasons = []

    if preferences["min_budget"] <= property_row["weekly_rent"] <= preferences["max_budget"]:
        reasons.append("budget")
    if preferences["room_type"] != "Any" and property_row["room_type"] == preferences["room_type"]:
        reasons.append("room type")
    if preferences["property_type"] != "Any" and property_row["property_type"] == preferences["property_type"]:
        reasons.append("property type")
    if preferences["suburb"] != "Any" and property_row["suburb"] == preferences["suburb"]:
        reasons.append("location")
    if preferences["pet_friendly"] != "Any" and property_row["pet_friendly"] == preferences["pet_friendly"]:
        reasons.append("pet preference")
    if preferences["school_zone"] != "Any" and property_row["school_zone"] == preferences["school_zone"]:
        reasons.append("school zone")
    if property_row["commute_time"] <= preferences["max_commute"]:
        reasons.append("commute")

    top_reasons = reasons[:3]
    if not top_reasons:
        return "Potential match based on your current filters."

    if len(top_reasons) == 1:
        reason_text = top_reasons[0]
    elif len(top_reasons) == 2:
        reason_text = f"{top_reasons[0]} and {top_reasons[1]}"
    else:
        reason_text = f"{top_reasons[0]}, {top_reasons[1]}, and {top_reasons[2]}"

    suffix = "" if len(top_reasons) == 1 else "s"
    return f"Good match for your {reason_text} preference{suffix}."
