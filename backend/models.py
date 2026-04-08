from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Dict, Any


@dataclass
class StandupUpdate:
    name: str
    did: str
    willdo: str
    blockers: str
    date: str
    submitted_at: str

    @classmethod
    def from_payload(cls, payload: Dict[str, Any]) -> "StandupUpdate":
        return cls(
            name=payload.get("name", "").strip(),
            did=payload.get("did", "").strip(),
            willdo=payload.get("willdo", "").strip(),
            blockers=payload.get("blockers", "").strip(),
            date=payload.get("date", "").strip(),
            submitted_at=datetime.now().isoformat(timespec="seconds"),
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
