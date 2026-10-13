# MediRec - simple web application to save some basic medical records.
# Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>
# GPL-2.0-or-later

"""Models used by the MediRec reporting service."""
from datetime import date
from pydantic import BaseModel, Field

class ReportOptions(BaseModel):
    """Options controlling one medical report."""
    include_personal_data: bool = True
    include_footer: bool = True
    include_header: bool = True
    include_indicators: bool = True
    columns: list[str] = Field(default_factory=lambda: ["date", "time", "systolic", "diastolic", "pulse", "oxygen_saturation", "height", "weight", "bmi", "notes"])
    date_from: date | None = None
    date_to: date | None = None
    language: str = "en"
    page_size: str = "A4"
    page_orientation: str = "portrait"
    margins: str = "none"
