import threading
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pipeline.task_queue import get_task_queue
from analysis.reddit_analyser import RedditAnalyser
from analysis.results_storage import get_results_storage


class TaskProcessor:
    def __init__(self):
        self.queue = get_task_queue()
        self.reddit_analyser = RedditAnalyser()
        self.results_storage = get_results_storage()
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

                        # Check if analysis was successful
                        if result and isinstance(result, dict):
                            success = result.get("success", False)

                            if success:
                                # Update traind record with analysis result
                                storage_success = (
                                    self.results_storage.update_traind_result(
                                        task_id=task.id,
                                        analysis_result=result,
                                        status="completed",
                                    )
                                )

                                if storage_success:
                                    # Mark task as completed in queue (without storing result)
                                    self.queue.complete_task(task.id, {})
                                    print(f"Task completed successfully: {task.id}")
                                    print(
                                        f"  - Clusters found: {result.get('num_clusters', 0)}"
                                    )
                                    print(
                                        f"  - Comments processed: {result.get('total_processed', 0)}"
                                    )
                                    print(f"  - Traind record updated in database")
                                else:
                                    # If storage failed, mark task as failed
                                    error_msg = (
                                        "Failed to update traind record in database"
                                    )
                                    self.queue.fail_task(task.id, error_msg)
                                    print(
                                        f"Task failed - storage error: {task.id} - {error_msg}"
                                    )
                            else:
                                # Analysis failed - get error message from various possible fields
                                error_msg = (
                                    result.get("error_message")
                                    or result.get("error")
                                    or "Analysis failed without specific error"
                                )

                                # Update traind record to failed status
                                self.results_storage.update_traind_failed(
                                    task_id=task.id, error_message=error_msg
                                )

                                self.queue.fail_task(task.id, error_msg)
                                print(
                                    f"Task failed during analysis: {task.id} - {error_msg}"
                                )
                        else:
                            # Invalid result format
                            error_msg = f"Invalid result format: expected dict, got {type(result)}"
                            self.results_storage.update_traind_failed(
                                task_id=task.id, error_message=error_msg
                            )
                            self.queue.fail_task(task.id, error_msg)
                            print(
                                f"Task failed due to invalid result: {task.id} - {error_msg}"
                            )
                    else:
                        error_msg = "Missing reddit_post_id"
                        self.results_storage.update_traind_failed(
                            task_id=task.id, error_message=error_msg
                        )
                        self.queue.fail_task(task.id, error_msg)
                        print(f"Task failed: {task.id} - {error_msg}")
                else:
                    error_msg = f"Unknown task type: {task.task_type}"
                    self.results_storage.update_traind_failed(
                        task_id=task.id, error_message=error_msg
                    )
                    self.queue.fail_task(task.id, error_msg)
                    print(f"Task failed: {task.id} - {error_msg}")

            except Exception as e:
                error_msg = f"Exception during processing: {str(e)}"
                if "task" in locals() and hasattr(task, "id"):
                    # Update traind record to failed status
                    try:
                        self.results_storage.update_traind_failed(
                            task_id=task.id, error_message=error_msg
                        )
                    except:
                        pass  # Ignore storage errors during exception handling

                    self.queue.fail_task(task.id, error_msg)
                    print(f"Task failed with exception: {task.id} - {error_msg}")
                else:
                    print(f"Error processing task (no task ID): {error_msg}")

                # Optionally print stack trace for debugging
                import traceback

                print(f"Stack trace: {traceback.format_exc()}")


# Global instance
_processor = TaskProcessor()


def get_processor():
    return _processor
