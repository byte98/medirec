# MediRec - simple web application to save some basic medical records.
# Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; version 2 of the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

"""Health indicator calculation."""

from __future__ import annotations

from typing import Optional

from ..models.data import HealthStatus


class IndicatorCalculator:
    """Calculates the same basic indicators used by the previous MediRec."""

    @staticmethod
    def systolic(value: Optional[float]) -> HealthStatus:
        """Calculate systolic pressure status."""
        reti = HealthStatus.UNKNOWN
        if value is not None:
            if 90 <= value <= 129:
                reti = HealthStatus.HEALTHY
            elif 80 <= value <= 139:
                reti = HealthStatus.CAUTION
            else:
                reti = HealthStatus.UNHEALTHY
        return reti

    @staticmethod
    def diastolic(value: Optional[float]) -> HealthStatus:
        """Calculate diastolic pressure status."""
        reti = HealthStatus.UNKNOWN
        if value is not None:
            if 60 <= value <= 79:
                reti = HealthStatus.HEALTHY
            elif 50 <= value <= 89:
                reti = HealthStatus.CAUTION
            else:
                reti = HealthStatus.UNHEALTHY
        return reti

    @staticmethod
    def pulse(value: Optional[float]) -> HealthStatus:
        """Calculate pulse status."""
        reti = HealthStatus.UNKNOWN
        if value is not None:
            if 60 <= value <= 100:
                reti = HealthStatus.HEALTHY
            elif 50 <= value <= 110:
                reti = HealthStatus.CAUTION
            else:
                reti = HealthStatus.UNHEALTHY
        return reti

    @staticmethod
    def oxygen(value: Optional[float]) -> HealthStatus:
        """Calculate oxygen saturation status."""
        reti = HealthStatus.UNKNOWN
        if value is not None:
            if 95 <= value <= 100:
                reti = HealthStatus.HEALTHY
            elif value >= 90:
                reti = HealthStatus.CAUTION
            else:
                reti = HealthStatus.UNHEALTHY
        return reti

    @staticmethod
    def weight(value: Optional[float], previous: Optional[float]) -> HealthStatus:
        """Calculate weight status relative to the previous measurement."""
        reti = HealthStatus.UNKNOWN
        if value is not None and previous is not None and previous > 0:
            change = (value - previous) / previous
            if change <= 0:
                reti = HealthStatus.HEALTHY
            elif change <= 0.005:
                reti = HealthStatus.CAUTION
            else:
                reti = HealthStatus.UNHEALTHY
        return reti

    @staticmethod
    def bmi(value: Optional[float]) -> HealthStatus:
        """Calculate BMI status using adult BMI ranges."""
        reti = HealthStatus.UNKNOWN
        if value is not None:
            if 18.5 <= value < 25:
                reti = HealthStatus.HEALTHY
            elif 25 <= value < 30 or 17 <= value < 18.5:
                reti = HealthStatus.CAUTION
            else:
                reti = HealthStatus.UNHEALTHY
        return reti
