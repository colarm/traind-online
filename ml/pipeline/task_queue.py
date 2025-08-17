import threading
import queue
import uuid
from datetime import datetime
from enum import Enum
from dataclasses import dataclass
from typing import Dict, Any, Optional, Callable


class TaskStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Task:
    id: str
    task_type: str
    payload: Dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    reddit_post_id: Optional[str] = None  # Reddit post ID for reddit_analysis tasks

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()


class TaskQueue:
    def __init__(self):
        self._queue = queue.Queue()
        self._tasks = {}
        self._lock = threading.Lock()

    def add_task(
        self,
        task_type: str,
        payload: Dict[str, Any],
        reddit_post_id: Optional[str] = None,
    ) -> str:
        task_id = str(uuid.uuid4())
        task = Task(
            id=task_id,
            task_type=task_type,
            payload=payload,
            reddit_post_id=reddit_post_id,
        )

        with self._lock:
            self._tasks[task_id] = task
            self._queue.put(task)

        return task_id

    def get_task(self, timeout: Optional[float] = None) -> Optional[Task]:
        try:
            task = self._queue.get(timeout=timeout)
            with self._lock:
                task.status = TaskStatus.PROCESSING
            return task
        except queue.Empty:
            return None

    def complete_task(self, task_id: str, result: Dict[str, Any]):
        with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].status = TaskStatus.COMPLETED
                self._tasks[task_id].result = result

    def fail_task(self, task_id: str, error: str):
        with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].status = TaskStatus.FAILED
                self._tasks[task_id].error = error

    def get_task_status(self, task_id: str) -> Optional[Task]:
        with self._lock:
            return self._tasks.get(task_id)


# Global instance
_task_queue = TaskQueue()


def get_task_queue() -> TaskQueue:
    return _task_queue
