#!/usr/bin/env python3
import argparse
import json
import math
import os
import re
import sys
from datetime import datetime, timezone
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
    {"text": "eye pain red eye blurred vision eye strain light sensitivity", "specialty": "Ophthalmologist"},
    {"text": "itchy eyes watery eyes eye discharge swollen eyelid vision problem", "specialty": "Ophthalmologist"},
    {"text": "irregular periods pelvic pain pregnancy check hormonal imbalance", "specialty": "Gynecologist"},
    {"text": "vaginal infection menstrual cramps fertility issue women health", "specialty": "Gynecologist"},
    {"text": "diabetes thyroid weight gain hormone disorder sugar levels", "specialty": "Endocrinologist"},
    {"text": "high glucose insulin resistance thyroid fatigue endocrine", "specialty": "Endocrinologist"},
    {"text": "tooth pain gum swelling cavity tooth sensitivity jaw pain", "specialty": "Dentist"},
    {"text": "bleeding gums bad breath tooth decay dental infection", "specialty": "Dentist"},
]


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DATASET_PATH = os.path.join(SCRIPT_DIR, "data", "symptom_training_data.json")
DEFAULT_MODEL_PATH = os.path.join(SCRIPT_DIR, "models", "symptom_model.json")


SPECIALTY_ALIASES = {
    "general physician": ["general practitioner", "gp", "family doctor", "physician"],
    "ent specialist": ["ent", "otolaryngologist", "ear nose throat"],
    "orthopedic surgeon": ["orthopedic", "orthopaedic", "ortho"],
    "ophthalmologist": ["eye specialist", "eye doctor", "ophthalmic surgeon", "oculist"],
    "dentist": ["dental", "dental surgeon", "tooth doctor", "oral doctor"],
}


SYMPTOM_NORMALIZATIONS = {
    "shortness of breath": "dyspnea",
    "high blood pressure": "hypertension",
    "low blood sugar": "hypoglycemia",
    "high blood sugar": "hyperglycemia",
    "runny nose": "rhinorrhea",
    "sore throat": "pharyngitis",
    "chest pain": "angina",
    "heart burn": "heartburn",
    "period pain": "menstrual cramps",
    "joint ache": "joint pain",
    "body ache": "body pain",
    "eye pain": "eye pain",
    "red eye": "eye redness",
    "blurred vision": "vision blur",
    "watery eyes": "eye watering",
    "feeling sad": "low mood",
    "panic attack": "panic",
    "tooth pain": "toothache",
    "teeth pain": "toothache",
    "dental pain": "toothache",
}


SPECIALTY_HINTS = {
    "Neurologist": {"migraine", "seizure", "tremor", "dizziness", "numbness", "memory", "headache"},
    "Cardiologist": {"angina", "hypertension", "palpitations", "heartbeat", "dyspnea", "cardiac"},
    "Dermatologist": {"rash", "eczema", "acne", "itching", "hives", "pigmentation", "skin"},
    "General Physician": {"fever", "cough", "cold", "infection", "vomiting", "diarrhea", "weakness"},
    "Pediatrician": {"child", "newborn", "infant", "vaccination", "pediatric", "feeding"},
    "Orthopedic Surgeon": {"fracture", "sprain", "joint", "knee", "shoulder", "bone", "injury"},
    "Psychiatrist": {"anxiety", "depression", "insomnia", "panic", "stress", "mood", "trauma"},
    "ENT Specialist": {"sinus", "tonsil", "ear", "throat", "nasal", "hearing", "voice"},
    "Ophthalmologist": {
        "eye",
        "ocular",
        "vision",
        "blur",
        "redness",
        "itch",
        "water",
        "discharge",
        "eyelid",
        "photophobia",
        "eye_pain",
    },
    "Gynecologist": {"pelvic", "pregnancy", "menstrual", "periods", "fertility", "hormonal", "vaginal"},
    "Endocrinologist": {"diabetes", "thyroid", "hormone", "insulin", "glucose", "endocrine"},
    "Dentist": {"tooth", "toothache", "dental", "gum", "gums", "cavity", "molar", "jaw"},
}


MIN_SPECIALTY_CONFIDENCE = 0.12
MIN_TOP_RELATIVE_CONFIDENCE = 0.35
MIN_QUERY_SIMILARITY = 0.04
SOFTMAX_TEMPERATURE = 0.22


CARDIAC_HINT_TOKENS = {
    "angina",
    "palpitation",
    "palpitations",
    "dyspnea",
    "breathless",
    "sweat",
    "sweating",
    "dizziness",
    "nausea",
    "left_arm_pain",
    "jaw_pain",
}


GI_HINT_TOKENS = {
    "heartburn",
    "acidity",
    "acid",
    "bloat",
    "burp",
    "belch",
    "gastric",
    "indigestion",
    "reflux",
}


EMERGENCY_HINT_TOKENS = {
    "faint",
    "fainting",
    "collapse",
    "severe",
    "crush",
}


EYE_HINT_TOKENS = {
    "eye",
    "eye_pain",
    "vision",
    "vision_blur",
    "blur",
    "redness",
    "eyelid",
    "ocular",
    "photophobia",
    "discharge",
    "watering",
    "itch",
}


ORTHO_HINT_TOKENS = {
    "knee",
    "joint",
    "fracture",
    "back",
    "sports",
    "injury",
    "bone",
    "sprain",
    "shoulder",
    "muscle",
}


DENTAL_HINT_TOKENS = {
    "tooth",
    "teeth",
    "toothache",
    "tooth_pain",
    "dental",
    "gum",
    "gums",
    "jaw",
    "molar",
    "cavity",
}


def canonical_specialty(name: str) -> str:
    value = str(name or "").strip().lower()
    if not value:
        return ""
    for canonical, aliases in SPECIALTY_ALIASES.items():
        if value == canonical:
            return canonical.title() if canonical != "ent specialist" else "ENT Specialist"
        if value in aliases:
            return canonical.title() if canonical != "ent specialist" else "ENT Specialist"
    return str(name).strip()


def normalize_symptom_text(text: str) -> str:
    normalized = (text or "").lower()
    normalized = re.sub(r"[^a-z0-9\s]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()

    for phrase, replacement in SYMPTOM_NORMALIZATIONS.items():
        pattern = r"\b" + re.escape(phrase) + r"\b"
        normalized = re.sub(pattern, replacement, normalized)

    return normalized


def stem_token(token: str) -> str:
    # Small rule-based stemmer to improve matching without external dependencies.
    if len(token) <= 4:
        return token
    if token.endswith("ies") and len(token) > 5:
        return token[:-3] + "y"
    for suffix in ("ingly", "edly", "ing", "ed", "ly", "es", "s"):
        if token.endswith(suffix) and len(token) - len(suffix) >= 3:
            return token[: -len(suffix)]
    return token


def tokenize(text: str):
    normalized = normalize_symptom_text(text)
    words = re.findall(r"[a-zA-Z]+", normalized)
    base_tokens = [stem_token(word) for word in words if word not in STOP_WORDS and len(word) > 1]

    # Basic n-gram extraction improves phrase-level symptom understanding.
    bigrams = [f"{base_tokens[index]}_{base_tokens[index + 1]}" for index in range(len(base_tokens) - 1)]

    return base_tokens + bigrams


def extract_specialty_hints(tokens):
    hints = Counter()
    token_set = set(tokens)
    for specialty, keywords in SPECIALTY_HINTS.items():
        overlap = token_set.intersection(keywords)
        if overlap:
            hints[specialty] += len(overlap)
    return hints


def is_medical_query(tokens, model):
    if not tokens:
        return False

    vocabulary = model.get("vocabulary", set())
    overlap = len(set(tokens).intersection(vocabulary))
    return overlap >= 1


def token_counts(tokens):
    counts = Counter()
    for token in tokens:
        counts[token] += 1
    return counts


def l2_normalize(vector):
    norm = math.sqrt(sum(value * value for value in vector.values()))
    if norm <= 0.0:
        return {}
    return {token: (value / norm) for token, value in vector.items()}


def build_tfidf_vector(counts, idf, vocabulary):
    if not counts:
        return {}

    total = float(sum(counts.values())) or 1.0
    vector = {}
    for token, count in counts.items():
        if token not in vocabulary:
            continue
        tf = count / total
        vector[token] = tf * idf.get(token, 0.0)
    return l2_normalize(vector)


def dot_similarity(vector_a, vector_b):
    if not vector_a or not vector_b:
        return 0.0
    if len(vector_a) > len(vector_b):
        vector_a, vector_b = vector_b, vector_a
    return sum(value * vector_b.get(token, 0.0) for token, value in vector_a.items())


def parse_duration_days(payload):
    value = payload.get("duration_days")
    if value is None:
        return None
    try:
        days = int(value)
    except (TypeError, ValueError):
        return None
    return max(0, days)


def build_triage_context(symptom_text: str, payload):
    tokens = tokenize(symptom_text)
    token_set = set(tokens)
    duration_days = parse_duration_days(payload)

    has_chest_pain = "angina" in token_set or "chest" in token_set or "chest_pain" in token_set
    cardiac_overlap = len(token_set.intersection(CARDIAC_HINT_TOKENS))
    gi_overlap = len(token_set.intersection(GI_HINT_TOKENS))
    emergency_overlap = len(token_set.intersection(EMERGENCY_HINT_TOKENS))

    return {
        "tokens": token_set,
        "duration_days": duration_days,
        "has_chest_pain": has_chest_pain,
        "cardiac_overlap": cardiac_overlap,
        "gi_overlap": gi_overlap,
        "emergency_overlap": emergency_overlap,
    }


def build_follow_up_questions(triage_context):
    if not triage_context.get("has_chest_pain"):
        return []

    if triage_context.get("duration_days") is not None:
        return []

    return [
        {
            "id": "duration_days",
            "question": "How many days have you had this chest pain?",
            "expected_type": "number",
        },
        {
            "id": "associated_symptoms",
            "question": "Do you also have shortness of breath, sweating, dizziness, or pain spreading to left arm/jaw?",
            "expected_type": "text",
        },
        {
            "id": "meal_relation",
            "question": "Is the pain mainly after meals, with acidity/heartburn or bloating?",
            "expected_type": "text",
        },
    ]


def apply_triage_adjustments(specialties, triage_context):
    if not specialties:
        return specialties

    score_map = {item["specialty"]: float(item["confidence"]) for item in specialties}

    if triage_context.get("has_chest_pain"):
        duration_days = triage_context.get("duration_days")
        cardiac_overlap = triage_context.get("cardiac_overlap", 0)
        gi_overlap = triage_context.get("gi_overlap", 0)
        emergency_overlap = triage_context.get("emergency_overlap", 0)

        if emergency_overlap > 0 or cardiac_overlap >= 2:
            score_map["Cardiologist"] = score_map.get("Cardiologist", 0.0) + 0.22
            score_map["General Physician"] = score_map.get("General Physician", 0.0) + 0.05
        elif duration_days is None:
            # Ambiguous phase: keep both specialties visible until follow-up answer arrives.
            score_map["Cardiologist"] = score_map.get("Cardiologist", 0.0) + 0.10
            score_map["General Physician"] = score_map.get("General Physician", 0.0) + 0.10
        elif duration_days >= 3:
            score_map["Cardiologist"] = score_map.get("Cardiologist", 0.0) + 0.20
            score_map["General Physician"] = score_map.get("General Physician", 0.0) + 0.04
        elif gi_overlap >= 1 and cardiac_overlap == 0:
            score_map["General Physician"] = score_map.get("General Physician", 0.0) + 0.20
            score_map["Cardiologist"] = score_map.get("Cardiologist", 0.0) + 0.04
        else:
            score_map["Cardiologist"] = score_map.get("Cardiologist", 0.0) + 0.12
            score_map["General Physician"] = score_map.get("General Physician", 0.0) + 0.10

    token_set = set(triage_context.get("tokens", set()))
    eye_overlap = len(token_set.intersection(EYE_HINT_TOKENS))
    ortho_overlap = len(token_set.intersection(ORTHO_HINT_TOKENS))

    # Guardrail: avoid routing ocular symptoms to orthopedics simply due to generic "pain" terms.
    if eye_overlap >= 1 and ortho_overlap == 0:
        score_map["Ophthalmologist"] = score_map.get("Ophthalmologist", 0.0) + 0.35
        score_map["ENT Specialist"] = score_map.get("ENT Specialist", 0.0) + 0.05
        if "Orthopedic Surgeon" in score_map:
            score_map["Orthopedic Surgeon"] = max(score_map["Orthopedic Surgeon"] - 0.20, 0.0)

    dental_overlap = len(token_set.intersection(DENTAL_HINT_TOKENS))
    if dental_overlap >= 1:
        # Guardrail: tooth/gum symptoms should route to ENT/GP triage, not orthopedics.
        score_map["ENT Specialist"] = score_map.get("ENT Specialist", 0.0) + 0.38
        score_map["General Physician"] = score_map.get("General Physician", 0.0) + 0.12
        if "Orthopedic Surgeon" in score_map:
            score_map["Orthopedic Surgeon"] = max(score_map["Orthopedic Surgeon"] - 0.28, 0.0)

    total = sum(max(value, 0.0) for value in score_map.values()) or 1.0
    normalized = [
        {"specialty": specialty, "confidence": max(score, 0.0) / total}
        for specialty, score in score_map.items()
    ]
    normalized.sort(key=lambda item: item["confidence"], reverse=True)

    top_confidence = normalized[0]["confidence"] if normalized else 0.0
    confidence_floor = max(MIN_SPECIALTY_CONFIDENCE, top_confidence * MIN_TOP_RELATIVE_CONFIDENCE)
    return [item for item in normalized if item["confidence"] >= confidence_floor]


def enforce_dental_routing(specialties, triage_context):
    token_set = set(triage_context.get("tokens", set()))
    dental_overlap = len(token_set.intersection(DENTAL_HINT_TOKENS))
    if dental_overlap <= 0:
        return specialties

    score_map = {item["specialty"]: float(item["confidence"]) for item in specialties}

    # Strict dental path: only return Dentist + GP fallback for tooth/gum symptoms.
    dentist_score = max(score_map.get("Dentist", 0.0), 0.78)
    gp_score = max(score_map.get("General Physician", 0.0), 0.22)

    total = dentist_score + gp_score
    if total <= 0:
        return []

    normalized = [
        {"specialty": "Dentist", "confidence": dentist_score / total},
        {"specialty": "General Physician", "confidence": gp_score / total},
    ]
    normalized.sort(key=lambda item: item["confidence"], reverse=True)
    return normalized


def build_urgency_assessment(triage_context, follow_up_required):
    has_chest_pain = bool(triage_context.get("has_chest_pain"))
    duration_days = triage_context.get("duration_days")
    cardiac_overlap = int(triage_context.get("cardiac_overlap", 0))
    gi_overlap = int(triage_context.get("gi_overlap", 0))
    emergency_overlap = int(triage_context.get("emergency_overlap", 0))

    urgency_level = "low"
    reason = "no_immediate_red_flags_detected"
    advice = "Monitor symptoms and book a routine consultation if symptoms persist."

    if has_chest_pain:
        if emergency_overlap > 0 or cardiac_overlap >= 3:
            urgency_level = "emergency"
            reason = "possible_acute_cardiac_warning_signs"
            advice = "Seek emergency care now. If symptoms are severe or worsening, call local emergency services immediately."
        elif cardiac_overlap >= 2:
            urgency_level = "high"
            reason = "multiple_cardiac_features_present"
            advice = "Book urgent cardiology evaluation today. Go to emergency care if pain worsens or new severe symptoms appear."
        elif duration_days is not None and duration_days >= 3:
            urgency_level = "high"
            reason = "persistent_chest_pain"
            advice = "Persistent chest pain needs prompt doctor review, preferably cardiology within 24 hours."
        elif follow_up_required:
            urgency_level = "moderate"
            reason = "chest_pain_needs_clarification"
            advice = "Answer follow-up questions now. If pain becomes severe, seek emergency care immediately."
        elif gi_overlap > 0 and cardiac_overlap == 0:
            urgency_level = "moderate"
            reason = "possible_non_cardiac_chest_pain"
            advice = "Likely non-cardiac, but still consult a doctor soon. Seek urgent care if symptoms intensify."
        else:
            urgency_level = "moderate"
            reason = "chest_pain_default_caution"
            advice = "Chest pain should be medically evaluated soon."

    return {
        "urgency_level": urgency_level,
        "urgency_reason": reason,
        "emergency_advice": advice,
    }


def train_model(samples):
    model_type = "tfidf_centroid_v2"
    doc_counts = Counter()
    specialty_doc_vectors = defaultdict(list)
    doc_frequency = Counter()
    vocabulary = set()
    total_docs = 0

    for sample in samples:
        specialty = canonical_specialty(sample["specialty"])
        tokens = tokenize(sample["text"])
        if not tokens:
            continue

        counts = token_counts(tokens)
        doc_counts[specialty] += 1
        specialty_doc_vectors[specialty].append(counts)
        vocabulary.update(counts.keys())
        doc_frequency.update(set(counts.keys()))
        total_docs += 1

    if total_docs <= 0:
        return {
            "model_type": model_type,
            "doc_counts": Counter(),
            "vocabulary": set(),
            "idf": {},
            "centroids": {},
            "total_docs": 0,
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "sample_count": len(samples),
        }

    idf = {
        token: math.log((1.0 + total_docs) / (1.0 + doc_frequency[token])) + 1.0 for token in vocabulary
    }

    centroids = {}
    for specialty, doc_vectors in specialty_doc_vectors.items():
        accumulator = defaultdict(float)
        for counts in doc_vectors:
            tfidf = build_tfidf_vector(counts, idf, vocabulary)
            for token, value in tfidf.items():
                accumulator[token] += value

        divisor = float(len(doc_vectors)) or 1.0
        averaged = {token: (value / divisor) for token, value in accumulator.items()}
        centroids[specialty] = l2_normalize(averaged)

    return {
        "model_type": model_type,
        "doc_counts": doc_counts,
        "vocabulary": vocabulary,
        "idf": idf,
        "centroids": centroids,
        "total_docs": total_docs,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "sample_count": len(samples),
    }


def model_to_jsonable(model):
    return {
        "model_type": model.get("model_type", "tfidf_centroid_v2"),
        "doc_counts": dict(model["doc_counts"]),
        "vocabulary": sorted(list(model["vocabulary"])),
        "idf": model.get("idf", {}),
        "centroids": model.get("centroids", {}),
        "total_docs": int(model["total_docs"]),
        "trained_at": model.get("trained_at"),
        "sample_count": int(model.get("sample_count", 0)),
    }


def model_from_jsonable(raw):
    model_type = raw.get("model_type")

    # Legacy models are retrained automatically into the current vector model.
    if model_type not in {"tfidf_centroid_v2"}:
        return None

    return {
        "model_type": model_type,
        "doc_counts": Counter(raw.get("doc_counts", {})),
        "vocabulary": set(raw.get("vocabulary", [])),
        "idf": {str(k): float(v) for k, v in raw.get("idf", {}).items()},
        "centroids": {
            str(specialty): {str(token): float(weight) for token, weight in vector.items()}
            for specialty, vector in raw.get("centroids", {}).items()
            if isinstance(vector, dict)
        },
        "total_docs": int(raw.get("total_docs", 0)),
        "trained_at": raw.get("trained_at"),
        "sample_count": int(raw.get("sample_count", 0)),
    }


def ensure_parent_dir(path: str):
    directory = os.path.dirname(os.path.abspath(path))
    if directory and not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)


def load_training_samples(dataset_path: str):
    if not os.path.exists(dataset_path):
        return TRAINING_SAMPLES

    with open(dataset_path, "r", encoding="utf-8") as handle:
        raw = json.load(handle)

    samples = []
    if isinstance(raw, list):
        for item in raw:
            if not isinstance(item, dict):
                continue
            text = str(item.get("text", "")).strip()
            specialty = canonical_specialty(item.get("specialty", ""))
            if text and specialty:
                samples.append({"text": text, "specialty": specialty})

    return samples or TRAINING_SAMPLES


def save_model(model, model_path: str):
    ensure_parent_dir(model_path)
    with open(model_path, "w", encoding="utf-8") as handle:
        json.dump(model_to_jsonable(model), handle, ensure_ascii=True)


def load_model(model_path: str):
    if not os.path.exists(model_path):
        return None

    with open(model_path, "r", encoding="utf-8") as handle:
        raw = json.load(handle)

    if not isinstance(raw, dict):
        return None

    model = model_from_jsonable(raw)
    if model is None:
        return None
    if model["total_docs"] <= 0:
        return None
    if not model.get("centroids"):
        return None
    return model


def train_and_save(dataset_path: str, model_path: str):
    samples = load_training_samples(dataset_path)
    model = train_model(samples)
    save_model(model, model_path)
    return model


def specialty_probabilities(model, symptom_text: str):
    tokens = tokenize(symptom_text)
    if not tokens:
        return []

    if not is_medical_query(tokens, model):
        return []

    vocabulary = model.get("vocabulary", set())
    idf = model.get("idf", {})
    centroids = model.get("centroids", {})
    if not vocabulary or not idf or not centroids:
        return []

    query_vector = build_tfidf_vector(token_counts(tokens), idf, vocabulary)
    if not query_vector:
        return []

    raw_scores = {}

    for specialty, doc_count in model["doc_counts"].items():
        centroid = centroids.get(specialty, {})
        similarity = max(0.0, dot_similarity(query_vector, centroid))
        prior = doc_count / max(model["total_docs"], 1)

        # Use similarity as the main signal and class prior as a lightweight prior belief.
        blended = (similarity * 0.88) + (prior * 0.12)
        raw_scores[specialty] = max(blended, 0.0)

    if not raw_scores:
        return []

    top_similarity = max(raw_scores.values())
    if top_similarity < MIN_QUERY_SIMILARITY:
        return []

    temperature = max(SOFTMAX_TEMPERATURE, 1e-6)
    scaled = {k: (v / temperature) for k, v in raw_scores.items()}
    max_log = max(scaled.values())
    exp_scores = {k: math.exp(v - max_log) for k, v in scaled.items()}
    total = sum(exp_scores.values()) or 1.0

    normalized = [
        {"specialty": specialty, "confidence": exp_scores[specialty] / total}
        for specialty in exp_scores
    ]

    normalized.sort(key=lambda item: item["confidence"], reverse=True)

    top_confidence = normalized[0]["confidence"] if normalized else 0.0
    confidence_floor = max(MIN_SPECIALTY_CONFIDENCE, top_confidence * MIN_TOP_RELATIVE_CONFIDENCE)
    filtered = [item for item in normalized if item["confidence"] >= confidence_floor]

    return filtered


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
    if not specialty_scores:
        return []

    score_map = {}
    for item in specialty_scores:
        canonical = canonical_specialty(item.get("specialty", "")).lower()
        if not canonical:
            continue
        score_map[canonical] = max(score_map.get(canonical, 0.0), float(item.get("confidence", 0.0)))

    relevant_specialties = set(score_map.keys())

    ranked = []
    for doctor in doctors:
        specialty = canonical_specialty(str(doctor.get("specialty", ""))).lower()
        if specialty not in relevant_specialties:
            continue

        specialty_score = score_map.get(specialty, 0.0)
        rating = float(doctor.get("rating") or 0)
        rating_score = min(max(rating, 0.0), 5.0) / 5.0
        bonus = availability_bonus(str(doctor.get("availability", "")))

        final_score = (specialty_score * 0.78) + (rating_score * 0.17) + bonus
        ranked.append((final_score, doctor))

    ranked.sort(key=lambda item: item[0], reverse=True)
    if ranked:
        return [doctor for _, doctor in ranked[:top_k]]

    # Practical fallback: if predicted specialties are unavailable in current doctor roster,
    # route to nearest available triage specialty instead of returning empty recommendations.
    fallback_priority = ["ent specialist", "general physician"]
    if "dentist" in relevant_specialties:
        fallback_specialties = ["general physician", "ent specialist"]
    elif "ophthalmologist" in relevant_specialties:
        fallback_specialties = fallback_priority
    else:
        fallback_specialties = ["general physician"]

    fallback_ranked = []
    for doctor in doctors:
        specialty = canonical_specialty(str(doctor.get("specialty", ""))).lower()
        if specialty not in fallback_specialties:
            continue

        rating = float(doctor.get("rating") or 0)
        rating_score = min(max(rating, 0.0), 5.0) / 5.0
        bonus = availability_bonus(str(doctor.get("availability", "")))
        priority = fallback_specialties.index(specialty)
        final_score = (0.7 * rating_score) + (0.3 * bonus) - (priority * 0.02)
        fallback_ranked.append((final_score, doctor))

    fallback_ranked.sort(key=lambda item: item[0], reverse=True)
    return [doctor for _, doctor in fallback_ranked[:top_k]]


def parse_args():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--train", action="store_true")
    parser.add_argument("--dataset-path", default=DEFAULT_DATASET_PATH)
    parser.add_argument("--model-path", default=DEFAULT_MODEL_PATH)
    return parser.parse_args(sys.argv[1:])


def recommend_from_stdin(model_path: str, dataset_path: str):
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

    model = load_model(model_path)
    if model is None:
        model = train_and_save(dataset_path, model_path)

    triage_context = build_triage_context(symptoms, payload)
    follow_up_questions = build_follow_up_questions(triage_context)

    specialties = specialty_probabilities(model, symptoms)
    specialties = apply_triage_adjustments(specialties, triage_context)
    specialties = enforce_dental_routing(specialties, triage_context)

    ranked_doctors = []
    if not follow_up_questions:
        ranked_doctors = rank_doctors(doctors, specialties, top_k)

    urgency = build_urgency_assessment(triage_context, bool(follow_up_questions))

    triage_summary = "direct_recommendation"
    if follow_up_questions:
        triage_summary = "follow_up_needed_for_chest_pain"
    elif triage_context.get("has_chest_pain"):
        if triage_context.get("duration_days") is not None and triage_context.get("duration_days") >= 3:
            triage_summary = "chest_pain_prioritize_cardiology"
        elif triage_context.get("gi_overlap", 0) > 0 and triage_context.get("cardiac_overlap", 0) == 0:
            triage_summary = "chest_pain_possible_gastric_start_general_physician"
        else:
            triage_summary = "chest_pain_mixed_signals"

    response = {
        "recommended_doctor_ids": [doctor.get("id") for doctor in ranked_doctors if doctor.get("id") is not None],
        "matched_specialties": [
            {"specialty": item["specialty"], "confidence": round(item["confidence"], 4)} for item in specialties[:3]
        ],
        "follow_up_required": bool(follow_up_questions),
        "follow_up_questions": follow_up_questions,
        "triage_summary": triage_summary,
        "urgency_level": urgency["urgency_level"],
        "urgency_reason": urgency["urgency_reason"],
        "emergency_advice": urgency["emergency_advice"],
    }

    print(json.dumps(response))


def run_training(dataset_path: str, model_path: str):
    model = train_and_save(dataset_path, model_path)
    output = {
        "status": "trained",
        "model_type": model.get("model_type", "unknown"),
        "dataset_path": dataset_path,
        "model_path": model_path,
        "sample_count": model.get("sample_count", 0),
        "specialty_count": len(model.get("doc_counts", {})),
        "trained_at": model.get("trained_at"),
    }
    print(json.dumps(output))


def main():
    args = parse_args()

    try:
        if args.train:
            run_training(args.dataset_path, args.model_path)
            return

        recommend_from_stdin(args.model_path, args.dataset_path)
    except Exception:
        # Keep runtime safe for backend integration.
        if args.train:
            print(json.dumps({"status": "failed"}))
            return
        print(json.dumps({"recommended_doctor_ids": [], "matched_specialties": []}))


if __name__ == "__main__":
    main()
