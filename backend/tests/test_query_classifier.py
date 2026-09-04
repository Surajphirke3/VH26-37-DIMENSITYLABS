"""Unit tests for QueryClassifier."""
from __future__ import annotations

import pytest

from app.services.rag.query_classifier import QueryClassifier, QueryType


@pytest.fixture
def classifier() -> QueryClassifier:
    return QueryClassifier()


def test_detects_error_code_E101(classifier: QueryClassifier) -> None:
    result = classifier.classify("Machine showing E101 alarm, what should I do?")
    assert result == QueryType.ERROR_CODE


def test_detects_error_code_ERR_101(classifier: QueryClassifier) -> None:
    result = classifier.classify("Getting ERR-101 on startup")
    assert result == QueryType.ERROR_CODE


def test_detects_natural_language(classifier: QueryClassifier) -> None:
    result = classifier.classify("How do I replace the coolant filter?")
    assert result == QueryType.NATURAL_LANGUAGE


def test_detects_machine_scoped(classifier: QueryClassifier) -> None:
    result = classifier.classify("What are the maintenance steps for this CNC?")
    assert result == QueryType.MACHINE_SCOPED


def test_extracts_multiple_error_codes(classifier: QueryClassifier) -> None:
    codes = classifier.extract_error_codes("Seeing E101 and E202 at the same time")
    assert "E101" in codes
    assert "E202" in codes
    assert len(codes) == 2


def test_normalizes_error_code(classifier: QueryClassifier) -> None:
    assert classifier.normalize_error_code("E 101") == "E101"
    assert classifier.normalize_error_code("ERR-101") == "ERR101"
    assert classifier.normalize_error_code("e202") == "E202"


def test_detects_error_code_F_series(classifier: QueryClassifier) -> None:
    """KUKA-style F-prefix fault codes should be classified as ERROR_CODE."""
    result = classifier.classify("Robot shows F101 fault after homing")
    assert result == QueryType.ERROR_CODE
