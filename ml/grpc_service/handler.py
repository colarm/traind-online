import json
import sys
import os
import numpy as np
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pipeline.task_queue import get_task_queue


def deep_merge_dict(default_dict, custom_dict):
    """Deep merge two dictionaries, with custom_dict taking precedence"""
    if not isinstance(default_dict, dict) or not isinstance(custom_dict, dict):
        return custom_dict if custom_dict is not None else default_dict

    result = default_dict.copy()
    for key, value in custom_dict.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dict(result[key], value)
        else:
            result[key] = value
    return result


def numpy_json_encoder(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


# Load task configurations
config_path = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "config", "task_configs.json"
)
try:
    with open(config_path, "r", encoding="utf-8") as f:
        TASK_CONFIGS = json.load(f)
except FileNotFoundError:
    TASK_CONFIGS = {"task_configs": {}, "error_codes": {}}


class TaskRequest:
    def __init__(
        self,
        task_type: str,
        parameters_json: str = "",
        reddit_post_id: str = "",
    ):
        self.task_type = task_type
        self.parameters_json = parameters_json
        self.reddit_post_id = reddit_post_id


class TaskStatusRequest:
    def __init__(self, task_id: str):
        self.task_id = task_id


class TaskCancelRequest:
    def __init__(self, task_id: str):
        self.task_id = task_id


class TaskResponse:
    def __init__(self):
        self.success = False
        self.task_id = ""
        self.message = ""
        self.result_json = ""
        self.error_json = ""
        self.status = ""
        self.created_at = ""
        self.updated_at = ""
        self.processing_time_ms = 0


class TaskServiceHandler:
    def __init__(self):
        self.task_queue = get_task_queue()

    def _parse_error_details(self, error_message, task_result=None):
        error_message = error_message or "Unknown error"
        error_lower = error_message.lower()

        # Initialize default error info
        error_info = {
            "error_type": "UNKNOWN_ERROR",
            "error_message": error_message,
            "error_category": "GENERAL",
            "suggestions": ["Please contact support with this error message"],
        }

        # 1. Reddit client configuration error
        if (
            "reddit client not initialized" in error_lower
            and "configure api credentials" in error_lower
        ):
            error_info.update(
                {
                    "error_type": "REDDIT_CLIENT_ERROR",
                    "error_category": "CONFIGURATION",
                    "suggestions": [
                        "Configure Reddit API credentials in config.py",
                        "Set client_id, client_secret, and user_agent",
                    ],
                }
            )

        # 2. Reddit data fetching error
        elif "failed to fetch reddit data:" in error_lower:
            error_info.update(
                {
                    "error_type": "REDDIT_FETCH_ERROR",
                    "error_category": "DATA_ACCESS",
                    "suggestions": [
                        "Verify Reddit post ID is correct",
                        "Check if post exists and is publicly accessible",
                        "Check network connectivity",
                    ],
                }
            )

        # 3. Insufficient comments error
        elif (
            "insufficient comments after filtering" in error_lower
            and "minimum 3 required" in error_lower
        ):
            error_info.update(
                {
                    "error_type": "INSUFFICIENT_DATA",
                    "error_category": "DATA_QUALITY",
                    "suggestions": [
                        "Choose a post with more comments",
                        "Lower min_score threshold in configuration",
                    ],
                }
            )
            # Add actual comment count if available
            if task_result and isinstance(task_result, dict):
                total_processed = task_result.get("total_processed", 0)
                error_info["error_context"] = {
                    "comments_found": total_processed,
                    "minimum_required": 3,
                }

        # 4. Missing reddit_post_id error
        elif "missing reddit_post_id" in error_lower:
            error_info.update(
                {
                    "error_type": "MISSING_REDDIT_POST_ID",
                    "error_category": "CONFIGURATION",
                    "suggestions": ["Provide reddit_post_id parameter in the request"],
                }
            )

        # 5. Unknown task type error
        elif "unknown task type:" in error_lower:
            error_info.update(
                {
                    "error_type": "INVALID_TASK_TYPE",
                    "error_category": "CONFIGURATION",
                    "suggestions": [
                        "Use supported task types: reddit_analysis",
                        "Check task_configs.json for available task types",
                    ],
                }
            )

        return error_info

    def add_task(self, request: TaskRequest) -> TaskResponse:
        print(f"Handler: AddTask - type: {request.task_type}")

        response = TaskResponse()
        response.task_id = ""

        try:
            # Parse JSON parameters
            try:
                parameters = (
                    json.loads(request.parameters_json)
                    if request.parameters_json
                    else {}
                )
            except json.JSONDecodeError as e:
                response.success = False
                response.message = f"INVALID_JSON: Invalid JSON parameters: {str(e)}"
                print(
                    f"Handler Error: INVALID_JSON - Invalid JSON parameters: {str(e)}"
                )
                return response

            # Validate task type
            if request.task_type not in TASK_CONFIGS.get("task_configs", {}):
                response.success = False
                response.message = (
                    f"INVALID_TASK_TYPE: Unsupported task type: {request.task_type}"
                )
                print(
                    f"Handler Error: INVALID_TASK_TYPE - Unsupported task type: {request.task_type}"
                )
                return response

            # Validate required parameters
            config = TASK_CONFIGS["task_configs"][request.task_type]
            required_params = config.get("required_params", [])
            missing_params = [p for p in required_params if p not in parameters]

            if missing_params:
                response.success = False
                response.message = (
                    f"MISSING_PARAMS: Missing required parameters: {missing_params}"
                )
                print(
                    f"Handler Error: MISSING_PARAMS - Missing required parameters: {missing_params}"
                )
                return response

            # Merge with default parameters using deep merge
            default_params = config.get("default_params", {})
            full_parameters = deep_merge_dict(default_params, parameters)

            # Add metadata
            task_payload = {
                "parameters": full_parameters,
                "created_at": datetime.now().isoformat(),
            }

            # Add to queue
            task_id = self.task_queue.add_task(
                task_type=request.task_type,
                payload=task_payload,
                reddit_post_id=(
                    request.reddit_post_id if request.reddit_post_id else None
                ),
            )

            # Success response
            response.success = True
            response.task_id = task_id
            response.message = "Task added successfully"

            print(f"Handler: Task {task_id} added successfully")
            return response

        except Exception as e:
            response.success = False
            response.message = f"PROCESSING_ERROR: Internal error: {str(e)}"
            print(f"Handler Error: PROCESSING_ERROR - Internal error: {str(e)}")
            return response

    def get_task_status(self, request: TaskStatusRequest) -> TaskResponse:
        print(f"Handler: GetTaskStatus - task_id: {request.task_id}")

        response = TaskResponse()
        response.task_id = request.task_id

        try:
            task = self.task_queue.get_task_status(request.task_id)

            if task is None:
                response.success = False
                response.status = "not_found"
                response.message = "Task not found"
                return response

            # Basic information
            response.success = True
            response.status = task.status.value
            response.created_at = task.created_at.isoformat() if task.created_at else ""
            response.updated_at = datetime.now().isoformat()

            # Handle different statuses
            if task.status.value == "completed":
                if task.result:
                    # Real result - use custom encoder for numpy types
                    response.result_json = json.dumps(
                        task.result,
                        ensure_ascii=False,
                        indent=2,
                        default=numpy_json_encoder,
                    )
                    response.message = "Task completed successfully"
                else:
                    # No result available
                    response.message = "Task completed but no result available"

            elif task.status.value == "failed":
                # Parse error details from task result if available
                error_detail = self._parse_error_details(task.error, task.result)
                error_info = {
                    "error_type": error_detail["error_type"],
                    "error_message": error_detail["error_message"],
                    "error_category": error_detail["error_category"],
                    "timestamp": datetime.now().isoformat(),
                    "suggestions": error_detail.get("suggestions", []),
                }

                # Add additional error context if available
                if error_detail.get("error_context"):
                    error_info["error_context"] = error_detail["error_context"]

                response.error_json = json.dumps(
                    error_info, ensure_ascii=False, indent=2, default=numpy_json_encoder
                )
                response.message = f"Task failed: {error_detail['error_message']}"

            elif task.status.value == "processing":
                response.message = "Task is being processed"

            else:  # pending
                response.message = "Task is pending in queue"

            return response

        except Exception as e:
            response.success = False
            response.status = "error"
            response.message = f"Error retrieving task status: {str(e)}"
            print(f"Handler Error: Error retrieving task status: {str(e)}")
            return response

    def cancel_task(self, request: TaskCancelRequest) -> TaskResponse:
        """Cancel a task"""
        print(f"Handler: CancelTask - task_id: {request.task_id}")

        response = TaskResponse()
        response.task_id = request.task_id
        response.success = False
        response.message = "Task cancellation not yet implemented"

        return response
