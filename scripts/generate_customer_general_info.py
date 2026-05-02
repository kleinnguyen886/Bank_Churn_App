"""
Generate synthetic, geography-consistent customer general information for Churn_Modelling.csv.

Added fields:
SyntheticFirstName, CustomerFullName, CountryISO2, Locale, TimeZone, LocalCurrency,
Region, City, PostalCode, StreetAddress, PhoneCountryCode, SyntheticPhone,
SyntheticEmail, CustomerAgeGroup
"""

from __future__ import annotations

import argparse
import hashlib
import re
from pathlib import Path
from random import Random
from typing import Any, Dict, List, Tuple

import pandas as pd


# ----------------------------
# Geography-based rule tables
# ----------------------------
COUNTRY_RULES: Dict[str, Dict[str, Any]] = {
    "France": {
        "iso2": "FR",
        "locale": "fr_FR",
        "timezone": "Europe/Paris",
        "currency": "EUR",
        "phone_code": "+33",
        "email_domain": "fr.demo-bank.example",
        "street_types": ["Rue", "Avenue", "Boulevard", "Allée"],
        "street_names": [
            "Victor Hugo", "Jean Jaurès", "de la République", "Pasteur", "Voltaire",
            "Gambetta", "des Lilas", "du Moulin", "de la Paix", "Carnot"
        ],
        "cities": [
            ("Île-de-France", "Paris", "75001"),
            ("Auvergne-Rhône-Alpes", "Lyon", "69001"),
            ("Provence-Alpes-Côte d'Azur", "Marseille", "13001"),
            ("Occitanie", "Toulouse", "31000"),
            ("Provence-Alpes-Côte d'Azur", "Nice", "06000"),
            ("Pays de la Loire", "Nantes", "44000"),
            ("Nouvelle-Aquitaine", "Bordeaux", "33000"),
            ("Hauts-de-France", "Lille", "59000"),
            ("Grand Est", "Strasbourg", "67000"),
            ("Occitanie", "Montpellier", "34000"),
        ],
        "first_names": {
            "Female": ["Camille", "Chloé", "Emma", "Léa", "Manon", "Julie", "Sarah", "Clara", "Marie", "Inès"],
            "Male": ["Lucas", "Hugo", "Louis", "Jules", "Gabriel", "Arthur", "Nathan", "Thomas", "Nicolas", "Antoine"],
        },
    },
    "Germany": {
        "iso2": "DE",
        "locale": "de_DE",
        "timezone": "Europe/Berlin",
        "currency": "EUR",
        "phone_code": "+49",
        "email_domain": "de.demo-bank.example",
        "street_types": ["Straße", "Allee", "Weg", "Platz"],
        "street_names": [
            "Haupt", "Bahnhof", "Goethe", "Schiller", "Linden", "Berliner",
            "Garten", "Kirch", "Park", "Friedrich"
        ],
        "cities": [
            ("Berlin", "Berlin", "10115"),
            ("Hamburg", "Hamburg", "20095"),
            ("Bavaria", "Munich", "80331"),
            ("North Rhine-Westphalia", "Cologne", "50667"),
            ("Hesse", "Frankfurt am Main", "60311"),
            ("Baden-Württemberg", "Stuttgart", "70173"),
            ("North Rhine-Westphalia", "Düsseldorf", "40213"),
            ("Saxony", "Leipzig", "04109"),
            ("North Rhine-Westphalia", "Dortmund", "44135"),
            ("North Rhine-Westphalia", "Essen", "45127"),
        ],
        "first_names": {
            "Female": ["Anna", "Laura", "Sophie", "Marie", "Lena", "Lea", "Julia", "Mia", "Hannah", "Clara"],
            "Male": ["Ben", "Paul", "Leon", "Finn", "Jonas", "Felix", "Lukas", "Max", "Noah", "Tim"],
        },
    },
    "Spain": {
        "iso2": "ES",
        "locale": "es_ES",
        "timezone": "Europe/Madrid",
        "currency": "EUR",
        "phone_code": "+34",
        "email_domain": "es.demo-bank.example",
        "street_types": ["Calle", "Avenida", "Paseo", "Plaza"],
        "street_names": [
            "Mayor", "Real", "de la Paz", "Gran Vía", "de la Constitución",
            "San José", "del Sol", "Cervantes", "Goya", "Velázquez"
        ],
        "cities": [
            ("Community of Madrid", "Madrid", "28001"),
            ("Catalonia", "Barcelona", "08001"),
            ("Valencian Community", "Valencia", "46001"),
            ("Andalusia", "Seville", "41001"),
            ("Aragon", "Zaragoza", "50001"),
            ("Andalusia", "Málaga", "29001"),
            ("Region of Murcia", "Murcia", "30001"),
            ("Balearic Islands", "Palma", "07001"),
            ("Basque Country", "Bilbao", "48001"),
            ("Valencian Community", "Alicante", "03001"),
        ],
        "first_names": {
            "Female": ["Lucía", "María", "Sofía", "Martina", "Paula", "Julia", "Daniela", "Valeria", "Carmen", "Claudia"],
            "Male": ["Hugo", "Lucas", "Martín", "Mateo", "Leo", "Daniel", "Pablo", "Alejandro", "Álvaro", "Adrián"],
        },
    },
}

DEFAULT_FIRST_NAMES = {
    "Female": ["Alex", "Sam", "Jordan", "Taylor", "Morgan"],
    "Male": ["Alex", "Sam", "Jordan", "Taylor", "Morgan"],
}


def stable_rng(*parts: Any, global_seed: int = 42) -> Random:
    """Create a deterministic random generator from row-specific values."""
    joined = "|".join(str(part) for part in parts)
    digest = hashlib.sha256(f"{global_seed}|{joined}".encode("utf-8")).hexdigest()
    return Random(int(digest[:16], 16))


def clean_token(value: Any) -> str:
    """Normalize a value for use in synthetic email addresses."""
    text = str(value).strip().lower()
    replacements = {
        "é": "e", "è": "e", "ê": "e", "ë": "e", "á": "a", "à": "a", "â": "a",
        "ä": "a", "í": "i", "ì": "i", "î": "i", "ï": "i", "ó": "o", "ò": "o",
        "ô": "o", "ö": "o", "ú": "u", "ù": "u", "û": "u", "ü": "u", "ñ": "n",
        "ç": "c", "ß": "ss",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r"[^a-z0-9]+", ".", text).strip(".")
    return text or "customer"


def age_group(age: Any) -> str:
    """Create a simple age group from the Age column."""
    try:
        age_num = int(age)
    except Exception:
        return "Unknown"
    if age_num < 25:
        return "18-24"
    if age_num < 35:
        return "25-34"
    if age_num < 45:
        return "35-44"
    if age_num < 55:
        return "45-54"
    if age_num < 65:
        return "55-64"
    return "65+"


def make_phone(geography: str, rng: Random) -> str:
    """Generate a synthetic phone number following simplified country-specific patterns."""
    if geography == "France":
        # Mobile-like FR format: +33 6/7 xx xx xx xx
        first = rng.choice([6, 7])
        pairs = [f"{rng.randint(0, 99):02d}" for _ in range(4)]
        return f"+33 {first} {' '.join(pairs)}"
    if geography == "Germany":
        # Simplified German mobile-like format: +49 15x xxxxxxx
        prefix = rng.choice([151, 152, 157, 160, 162, 163, 170, 171, 172, 173, 174, 175, 176])
        number = rng.randint(1_000_000, 9_999_999)
        return f"+49 {prefix} {number}"
    if geography == "Spain":
        # Spanish mobile-like format: +34 6xx xxx xxx / 7xx xxx xxx
        first_block = rng.choice([6, 7]) * 100 + rng.randint(0, 99)
        return f"+34 {first_block:03d} {rng.randint(0, 999):03d} {rng.randint(0, 999):03d}"
    return f"+00 {rng.randint(100, 999)} {rng.randint(100000, 999999)}"


def enrich_customer_info(df: pd.DataFrame, global_seed: int = 42) -> pd.DataFrame:
    """Return a copy of df enriched with synthetic geography-based customer information."""
    required = {"Geography"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required column(s): {sorted(missing)}")

    out = df.copy()
    new_rows: List[Dict[str, Any]] = []

    for idx, row in out.iterrows():
        geography = str(row.get("Geography", "")).strip()
        rules = COUNTRY_RULES.get(geography)
        rng = stable_rng(row.get("CustomerId", idx), row.get("RowNumber", idx), geography, global_seed=global_seed)

        if rules is None:
            rules = {
                "iso2": "XX",
                "locale": "unknown",
                "timezone": "unknown",
                "currency": "unknown",
                "phone_code": "+00",
                "email_domain": "unknown.demo-bank.example",
                "street_types": ["Street"],
                "street_names": ["Central"],
                "cities": [("Unknown", "Unknown", "00000")],
                "first_names": DEFAULT_FIRST_NAMES,
            }

        gender = str(row.get("Gender", "")).strip().title()
        if gender not in {"Female", "Male"}:
            gender = rng.choice(["Female", "Male"])

        first_name = rng.choice(rules["first_names"].get(gender, DEFAULT_FIRST_NAMES[gender]))
        surname = str(row.get("Surname", "Customer")).strip() or "Customer"
        full_name = f"{first_name} {surname}"

        region, city, postal_code = rng.choice(rules["cities"])
        house_number = rng.randint(1, 199)
        street_type = rng.choice(rules["street_types"])
        street_name = rng.choice(rules["street_names"])

        if geography == "Germany":
            street_address = f"{street_name}{street_type} {house_number}"
        else:
            street_address = f"{house_number} {street_type} {street_name}"

        customer_id = str(row.get("CustomerId", idx)).strip()
        email_local = f"{clean_token(first_name)}.{clean_token(surname)}.{customer_id[-4:]}"
        synthetic_email = f"{email_local}@{rules['email_domain']}"

        new_rows.append(
            {
                "SyntheticFirstName": first_name,
                "CustomerFullName": full_name,
                "CountryISO2": rules["iso2"],
                "Locale": rules["locale"],
                "TimeZone": rules["timezone"],
                "LocalCurrency": rules["currency"],
                "Region": region,
                "City": city,
                "PostalCode": str(postal_code),
                "StreetAddress": street_address,
                "PhoneCountryCode": rules["phone_code"],
                "SyntheticPhone": make_phone(geography, rng),
                "SyntheticEmail": synthetic_email,
                "CustomerAgeGroup": age_group(row.get("Age")),
            }
        )

    added = pd.DataFrame(new_rows, index=out.index)
    return pd.concat([out, added], axis=1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Add synthetic geography-consistent customer general information to a churn dataset."
    )
    parser.add_argument(
        "--input",
        default="Churn_Modelling.csv",
        help="Input CSV path. Default: Churn_Modelling.csv",
    )
    parser.add_argument(
        "--output",
        default="Churn_Modelling_customer_general_info.csv",
        help="Output CSV path. Default: Churn_Modelling_customer_general_info.csv",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Global seed used for deterministic synthetic values. Default: 42",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    df = pd.read_csv(input_path)
    enriched = enrich_customer_info(df, global_seed=args.seed)
    enriched.to_csv(output_path, index=False, encoding="utf-8-sig")

    print(f"Input rows: {len(df):,}")
    print(f"Output rows: {len(enriched):,}")
    print(f"Added columns: {len(enriched.columns) - len(df.columns)}")
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    main()
