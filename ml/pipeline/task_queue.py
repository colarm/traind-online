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
    updated_at: datetime = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    reddit_post_id: Optional[str] = None  # Reddit post ID for reddit_analysis tasks

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = self.created_at


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
                # Add completion timestamp
                from datetime import datetime

                self._tasks[task_id].updated_at = datetime.now()

    def fail_task(self, task_id: str, error: str):
        with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].status = TaskStatus.FAILED
                self._tasks[task_id].error = error
                # Add failure timestamp
                from datetime import datetime

                self._tasks[task_id].updated_at = datetime.now()

    def get_task_status(self, task_id: str) -> Optional[Task]:
        with self._lock:
            return self._tasks.get(task_id)

    def get_queue_position(self, task_id: str) -> tuple[int, int]:
        """
        Get the position of a task in the queue and total pending tasks

        Returns:
            tuple: (position, total_pending) where position is 1-based,
                   (0, total_pending) if not in queue
        """
        with self._lock:
            task = self._tasks.get(task_id)

            # Count total pending tasks
            total_pending = sum(
                1 for t in self._tasks.values() if t.status == TaskStatus.PENDING
            )

            if not task or task.status != TaskStatus.PENDING:
                return (0, total_pending)

            # Count pending tasks created before this task
            position = 1
            task_created_at = task.created_at

            for other_task in self._tasks.values():
                if (
                    other_task.status == TaskStatus.PENDING
                    and other_task.created_at < task_created_at
                ):
                    position += 1

            return (position, total_pending)

    def get_all_tasks(self) -> Dict[str, Dict[str, Any]]:
        """Get all tasks as a dictionary for listing purposes"""
        with self._lock:
            all_tasks = {}
            for task_id, task in self._tasks.items():
                all_tasks[task_id] = {
                    "task_id": task.id,
                    "task_type": task.task_type,
                    "status": task.status.value,
                    "created_at": (
                        task.created_at.isoformat() if task.created_at else ""
                    ),
                    "updated_at": (
                        task.updated_at.isoformat() if task.updated_at else ""
                    ),
                    "client_id": "ml_service",
                    "reddit_post_id": task.reddit_post_id,
                    "result": task.result,
                    "error": task.error,
                }
            return all_tasks


# Global instance
_task_queue = TaskQueue()


def get_task_queue() -> TaskQueue:
    return _task_queue
