"""
Task Processor for ML Analysis Tasks
Handles the processing of Reddit analysis tasks in a separate thread

Filename: task_processor.py
Author: Haicheng Zhao
Date: 2025-08-18
AI Usage Declaration:
- This file contains code generated with the help of AI tools.
- Tool Used: Claude
- Date Generated: 2025-08-18
- AI-generated sections are marked with comments: # [AI-GENERATED]
I have reviewed, tested, and understood all AI-generated code.
"""

import threading
import sys
import os

# Add parent directory to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pipeline.task_queue import get_task_queue
from analysis.reddit_analyser import RedditAnalyser
from analysis.results_storage import get_results_storage


class TaskProcessor:
    """
    Processes ML analysis tasks from the task queue
    Runs in a separate thread to handle long-running analysis operations
    """

    def __init__(self):
        self.queue = get_task_queue()
        self.reddit_analyser = RedditAnalyser()
        self.results_storage = get_results_storage()
        self.running = False
        self.thread = None

    def start(self):
        """Start the task processor thread"""
        if self.running:
            return

        self.running = True
        self.thread = threading.Thread(target=self._process_loop, daemon=True)
        self.thread.start()
        print("Task processor started")

    def stop(self):
        """Stop the task processor thread gracefully"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        print("Task processor stopped")

    # [AI-GENERATED: Claude, 2025-08-18]
    def _process_loop(self):
        """
        Main processing loop that continuously polls for and processes tasks
        Handles Reddit analysis tasks with comprehensive error handling
        """
        while self.running:
            try:
                # Get next task from queue with timeout
                task = self.queue.get_task(timeout=1.0)
                if task is None:
                    continue

                print(f"Start processing task: {task.id}")

                if task.task_type == "reddit_analysis":
                    # Extract Reddit post ID from task
                    reddit_post_id = task.reddit_post_id or task.payload.get(
                        "reddit_post_id"
                    )
                    if reddit_post_id:
                        # Get analysis parameters from task payload
                        parameters = task.payload.get("parameters", {})

                        # Perform Reddit post analysis
                        result = self.reddit_analyser.analyse_reddit_post(
                            reddit_post_id, parameters=parameters
                        )

                        # Process analysis results
                        if result and isinstance(result, dict):
                            success = result.get("success", False)

                            if success:
                                # Store successful analysis results
                                storage_success = (
                                    self.results_storage.update_traind_result(
                                        task_id=task.id,
                                        analysis_result=result,
                                        status="completed",
                                    )
                                )

                                if storage_success:
                                    # Mark task as completed
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
                                    # Handle storage failure
                                    error_msg = (
                                        "Failed to update traind record in database"
                                    )
                                    self.queue.fail_task(task.id, error_msg)
                                    print(
                                        f"Task failed - storage error: {task.id} - {error_msg}"
                                    )
                            else:
                                # Handle analysis failure
                                error_msg = (
                                    result.get("error_message")
                                    or result.get("error")
                                    or "Analysis failed without specific error"
                                )

                                self.results_storage.update_traind_failed(
                                    task_id=task.id, error_message=error_msg
                                )

                                self.queue.fail_task(task.id, error_msg)
                                print(
                                    f"Task failed during analysis: {task.id} - {error_msg}"
                                )
                        else:
                            # Handle invalid result format
                            error_msg = f"Invalid result format: expected dict, got {type(result)}"
                            self.results_storage.update_traind_failed(
                                task_id=task.id, error_message=error_msg
                            )
                            self.queue.fail_task(task.id, error_msg)
                            print(
                                f"Task failed due to invalid result: {task.id} - {error_msg}"
                            )
                    else:
                        # Handle missing Reddit post ID
                        error_msg = "Missing reddit_post_id"
                        self.results_storage.update_traind_failed(
                            task_id=task.id, error_message=error_msg
                        )
                        self.queue.fail_task(task.id, error_msg)
                        print(f"Task failed: {task.id} - {error_msg}")
                else:
                    # Handle unknown task type
                    error_msg = f"Unknown task type: {task.task_type}"
                    self.results_storage.update_traind_failed(
                        task_id=task.id, error_message=error_msg
                    )
                    self.queue.fail_task(task.id, error_msg)
                    print(f"Task failed: {task.id} - {error_msg}")

            except Exception as e:
                # Handle unexpected exceptions during task processing
                error_msg = f"Exception during processing: {str(e)}"
                if "task" in locals() and hasattr(task, "id"):
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

                # Print stack trace for debugging
                import traceback

                print(f"Stack trace: {traceback.format_exc()}")


# Global processor instance
_processor = TaskProcessor()


def get_processor():
    """Get the global task processor instance"""
    return _processor
