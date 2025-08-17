import threading
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pipeline.task_queue import get_task_queue
from analysis.reddit_analyser import RedditAnalyser


class TaskProcessor:
    def __init__(self):
        self.queue = get_task_queue()
        self.reddit_analyser = RedditAnalyser()
        self.running = False
        self.thread = None

    def start(self):
        if self.running:
            return

        self.running = True
        self.thread = threading.Thread(target=self._process_loop, daemon=True)
        self.thread.start()
        print("Task processor started")

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        print("Task processor stopped")

    def _process_loop(self):
        while self.running:
            try:
                task = self.queue.get_task(timeout=1.0)
                if task is None:
                    continue

                print(f"Start processing task: {task.id}")

                if task.task_type == "reddit_analysis":
                    # Use reddit_post_id from task field first, fallback to payload
                    reddit_post_id = task.reddit_post_id or task.payload.get(
                        "reddit_post_id"
                    )
                    if reddit_post_id:
                        # Get parameters from task payload
                        parameters = task.payload.get("parameters", {})

                        # Pass parameters to analyser
                        result = self.reddit_analyser.analyse_reddit_post(
                            reddit_post_id, parameters=parameters
                        )
                        self.queue.complete_task(task.id, result)
                        print(f"Task completed: {task.id}")
                    else:
                        self.queue.fail_task(task.id, "Missing reddit_post_id")
                else:
                    self.queue.fail_task(
                        task.id, f"Unknown task type: {task.task_type}"
                    )

            except Exception as e:
                if "task" in locals():
                    self.queue.fail_task(task.id, str(e))
                print(f"Error processing task: {str(e)}")


# Global instance
_processor = TaskProcessor()


def get_processor():
    return _processor
