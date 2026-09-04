"""Shared pytest fixtures — no DB required."""
from __future__ import annotations

from dataclasses import dataclass

import pytest


@dataclass
class FakePage:
    page_num: int
    text: str
    has_tables: bool = False
    is_image_only: bool = False


def make_pages(text: str, page_num: int = 1) -> list[FakePage]:
    return [FakePage(page_num=page_num, text=text)]


@pytest.fixture
def sample_error_page() -> list[FakePage]:
    return make_pages(
        "Error Code Reference\n"
        "E101 - Coolant pressure loss detected. Check pump connection and filter.\n"
        "E202 - Spindle motor overload. Reduce feed rate immediately.\n"
        "WARNING: Always cut power before opening the electrical cabinet.\n",
    )


@pytest.fixture
def sample_maintenance_page() -> list[FakePage]:
    return make_pages(
        "Preventive Maintenance Schedule\n\n"
        "Monthly Tasks\n"
        "Inspect coolant level and top up if below minimum marker.\n"
        "Clean chip conveyor to prevent jam.\n\n"
        "Quarterly Tasks\n"
        "Replace spindle oil. Torque all cable connectors to 2 Nm.\n"
        "WARNING: Wear PPE when handling lubricants.\n",
    )
