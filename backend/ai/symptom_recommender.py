#!/usr/bin/env python3
import json
import math
import re
import sys
from collections import Counter, defaultdict


STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "been",
    "but",
    "by",
    "for",
    "from",
    "had",
    "has",
    "have",
    "i",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "since",
    "that",
    "the",
    "to",
    "was",
    "were",
    "with",
}


TRAINING_SAMPLES = [
    {"text": "severe headache migraine dizziness nausea sensitivity to light", "specialty": "Neurologist"},
    {"text": "tingling numbness tremor memory loss confusion seizure", "specialty": "Neurologist"},
    {"text": "chest pain shortness of breath high blood pressure palpitations", "specialty": "Cardiologist"},
    {"text": "irregular heartbeat fatigue swelling ankles heart discomfort", "specialty": "Cardiologist"},
    {"text": "skin rash itching acne eczema redness dry skin", "specialty": "Dermatologist"},
    {"text": "hair loss scalp infection pigmentation hives allergy skin", "specialty": "Dermatologist"},
    {"text": "fever cough cold body pain sore throat weakness", "specialty": "General Physician"},
    {"text": "stomach pain nausea vomiting diarrhea viral infection", "specialty": "General Physician"},
    {"text": "child fever vaccination growth issue pediatric cough", "specialty": "Pediatrician"},
    {"text": "newborn feeding problem child allergy infant infection", "specialty": "Pediatrician"},
    {"text": "knee pain joint pain fracture back pain sports injury", "specialty": "Orthopedic Surgeon"},
    {"text": "bone injury sprain shoulder pain muscle strain", "specialty": "Orthopedic Surgeon"},
    {"text": "anxiety depression stress panic insomnia mood swings", "specialty": "Psychiatrist"},
    {"text": "mental health trauma low mood fear overthinking", "specialty": "Psychiatrist"},
    {"text": "ear pain sinus throat pain hearing loss nasal congestion", "specialty": "ENT Specialist"},
    {"text": "tonsil infection runny nose ear discharge voice hoarseness", "specialty": "ENT Specialist"},
    {"text": "irregular periods pelvic pain pregnancy check hormonal imbalance", "specialty": "Gynecologist"},
    {"text": "vaginal infection menstrual cramps fertility issue women health", "specialty": "Gynecologist"},
    {"text": "diabetes thyroid weight gain hormone disorder sugar levels", "specialty": "Endocrinologist"},
    {"text": "high glucose insulin resistance thyroid fatigue endocrine", "specialty": "Endocrinologist"},
]


def tokenize(text: str):
    words = re.findall(r"[a-zA-Z]+", (text or "").lower())
    return [word for word in words if word not in STOP_WORDS and len(word) > 1]


def train_model(samples):
    doc_counts = Counter()
    token_counts = defaultdict(Counter)
    total_tokens = Counter()
    vocabulary = set()

    for sample in samples:
        specialty = sample["specialty"]
        tokens = tokenize(sample["text"])
        if not tokens:
            continue
        doc_counts[specialty] += 1
        for token in tokens:
            token_counts[specialty][token] += 1
            total_tokens[specialty] += 1
            vocabulary.add(token)

    total_docs = sum(doc_counts.values())
    return {
        "doc_counts": doc_counts,
        "token_counts": token_counts,
        "total_tokens": total_tokens,
        "vocabulary": vocabulary,
        "total_docs": total_docs,
    }


def specialty_probabilities(model, symptom_text: str):
    tokens = tokenize(symptom_text)
    if not tokens:
        return []

    vocabulary_size = max(len(model["vocabulary"]), 1)
    raw_scores = {}

    for specialty, doc_count in model["doc_counts"].items():
        prior = math.log(doc_count / model["total_docs"])
        token_log_sum = 0.0

        for token in tokens:
            token_freq = model["token_counts"][specialty][token]
            likelihood = (token_freq + 1) / (model["total_tokens"][specialty] + vocabulary_size)
            token_log_sum += math.log(likelihood)

        raw_scores[specialty] = prior + token_log_sum

    max_log = max(raw_scores.values())
    exp_scores = {k: math.exp(v - max_log) for k, v in raw_scores.items()}
    total = sum(exp_scores.values()) or 1.0

    normalized = [
        {"specialty": specialty, "confidence": exp_scores[specialty] / total}
        for specialty in exp_scores
    ]

    normalized.sort(key=lambda item: item["confidence"], reverse=True)
    return normalized


def availability_bonus(availability: str):
    value = (availability or "").lower()
    if "today" in value:
        return 0.1
    if "tomorrow" in value:
        return 0.06
    if "available" in value:
        return 0.03
    return 0.0


def rank_doctors(doctors, specialty_scores, top_k):
    score_map = {item["specialty"].lower(): item["confidence"] for item in specialty_scores}

    ranked = []
    for doctor in doctors:
        specialty = str(doctor.get("specialty", "")).lower()
        specialty_score = score_map.get(specialty, 0.0)
        rating = float(doctor.get("rating") or 0)
        rating_score = min(max(rating, 0.0), 5.0) / 5.0
        bonus = availability_bonus(str(doctor.get("availability", "")))

        final_score = (specialty_score * 0.78) + (rating_score * 0.17) + bonus
        ranked.append((final_score, doctor))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return [doctor for _, doctor in ranked[:top_k]]


def main():
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        print(json.dumps({"recommended_doctor_ids": [], "matched_specialties": []}))
        return

    symptoms = str(payload.get("symptoms", "")).strip()
    doctors = payload.get("doctors", []) or []
    top_k = int(payload.get("top_k", 3) or 3)
    top_k = max(1, min(top_k, 10))

    if not symptoms or not doctors:
        print(json.dumps({"recommended_doctor_ids": [], "matched_specialties": []}))
        return

    model = train_model(TRAINING_SAMPLES)
    specialties = specialty_probabilities(model, symptoms)
    ranked_doctors = rank_doctors(doctors, specialties, top_k)

    response = {
        "recommended_doctor_ids": [doctor.get("id") for doctor in ranked_doctors if doctor.get("id") is not None],
        "matched_specialties": [
            {"specialty": item["specialty"], "confidence": round(item["confidence"], 4)}
            for item in specialties[:3]
        ],
    }

    print(json.dumps(response))


if __name__ == "__main__":
    main()
