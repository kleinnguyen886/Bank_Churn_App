from __future__ import annotations

import subprocess
import sys
import threading
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.services.storage_service import file_status


ROOT = Path(__file__).resolve().parents[2]
TRAINING_SCRIPT = ROOT / "scripts" / "train_and_prepare.py"
ACTIVE_STATUSES = {"queued", "running"}

_lock = threading.Lock()
_jobs: dict[str, dict[str, Any]] = {}
_latest_job_id: str | None = None


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _truncate(value: str | None, limit: int = 2000) -> str | None:
    if not value:
        return None
    text = value.strip()
    if len(text) <= limit:
        return text
    return f"{text[: limit - 3]}..."


def _copy_job(job: dict[str, Any] | None) -> dict[str, Any] | None:
    return deepcopy(job) if job is not None else None


def _summarize_job(job: dict[str, Any]) -> dict[str, Any]:
    return {
        "job_id": job["job_id"],
        "status": job["status"],
        "progress": job["progress"],
        "message": job["message"],
        "created_at": job["created_at"],
        "started_at": job["started_at"],
        "updated_at": job["updated_at"],
        "finished_at": job["finished_at"],
        "return_code": job["return_code"],
        "artifacts_ready": job["artifacts_ready"],
        "error": job["error"],
    }


def _get_active_job_locked() -> dict[str, Any] | None:
    for job in _jobs.values():
        if job["status"] in ACTIVE_STATUSES:
            return job
    return None


def _set_job(job_id: str, **updates: Any) -> dict[str, Any] | None:
    with _lock:
        job = _jobs.get(job_id)
        if job is None:
            return None
        job.update(updates)
        job["updated_at"] = _utc_now()
        return _copy_job(job)


def _finish_job(
    job_id: str,
    *,
    status: str,
    message: str,
    return_code: int | None = None,
    stdout: str | None = None,
    stderr: str | None = None,
    error: str | None = None,
) -> dict[str, Any] | None:
    artifacts_ready = all(
        file_status().get(name, False)
        for name in [
            "dashboard_summary.json",
            "workspace_view.csv",
            "governance_summary.json",
            "campaigns_summary.json",
            "customer_profiles.json",
        ]
    )
    return _set_job(
        job_id,
        status=status,
        progress=100,
        message=message,
        finished_at=_utc_now(),
        return_code=return_code,
        stdout=_truncate(stdout),
        stderr=_truncate(stderr),
        artifacts_ready=artifacts_ready,
        error=_truncate(error),
    )


def _run_job(job_id: str) -> None:
    try:
        _set_job(
            job_id,
            status="running",
            progress=20,
            started_at=_utc_now(),
            message="Retraining pipeline is running.",
        )
        completed = subprocess.run(
            [sys.executable, str(TRAINING_SCRIPT)],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
        )
    except Exception as exc:  # pragma: no cover - defensive guard for subprocess launch failures
        _finish_job(
            job_id,
            status="failed",
            message="Retraining job could not start.",
            error=str(exc),
        )
        return

    if completed.returncode == 0:
        _finish_job(
            job_id,
            status="completed",
            message="Retraining completed successfully.",
            return_code=completed.returncode,
            stdout=completed.stdout,
            stderr=completed.stderr,
        )
        return

    failure_message = completed.stderr or completed.stdout or f"Training script exited with code {completed.returncode}."
    _finish_job(
        job_id,
        status="failed",
        message="Retraining failed.",
        return_code=completed.returncode,
        stdout=completed.stdout,
        stderr=completed.stderr,
        error=failure_message,
    )


def start_retraining_job() -> dict[str, Any]:
    global _latest_job_id

    with _lock:
        active_job = _get_active_job_locked()
        if active_job is not None:
            job = _copy_job(active_job)
            return {
                "started": False,
                "message": "Retraining is already running.",
                "status_url": f"/api/retraining/jobs/{job['job_id']}",
                "job": job,
            }

        job_id = uuid.uuid4().hex[:12]
        now = _utc_now()
        job = {
            "job_id": job_id,
            "status": "queued",
            "progress": 0,
            "message": "Retraining job queued.",
            "created_at": now,
            "started_at": None,
            "updated_at": now,
            "finished_at": None,
            "return_code": None,
            "stdout": None,
            "stderr": None,
            "artifacts_ready": False,
            "error": None,
        }
        _jobs[job_id] = job
        _latest_job_id = job_id

    thread = threading.Thread(target=_run_job, args=(job_id,), daemon=True)
    thread.start()

    return {
        "started": True,
        "message": "Retraining job started.",
        "status_url": f"/api/retraining/jobs/{job_id}",
        "job": _copy_job(job),
    }


def get_retraining_job(job_id: str) -> dict[str, Any] | None:
    with _lock:
        return _copy_job(_jobs.get(job_id))


def get_current_retraining_job() -> dict[str, Any] | None:
    with _lock:
        active_job = _get_active_job_locked()
        if active_job is not None:
            return _copy_job(active_job)
        if _latest_job_id is None:
            return None
        return _copy_job(_jobs.get(_latest_job_id))


def get_retraining_snapshot() -> dict[str, Any]:
    with _lock:
        active_job = _copy_job(_get_active_job_locked())
        latest_job = _copy_job(_jobs.get(_latest_job_id)) if _latest_job_id else None
        recent_jobs = sorted(
            (_summarize_job(job) for job in _jobs.values()),
            key=lambda item: item["updated_at"],
            reverse=True,
        )[:5]
        return {
            "has_active_job": active_job is not None,
            "active_job": active_job,
            "latest_job": latest_job,
            "recent_jobs": recent_jobs,
        }