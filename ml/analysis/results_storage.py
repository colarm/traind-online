"""
Analysis Results Storage Module
Handles updating analysis results via backend API calls
"""

import os
import json
import requests
from typing import Dict, Any, Optional
import logging
from datetime import datetime
import uuid
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def validate_uuid(uuid_string: str) -> bool:
    """Validate UUID format"""
    try:
        uuid.UUID(uuid_string)
        return True
    except (ValueError, TypeError):
        return False


def sanitize_string(text: str, max_length: int = 500) -> str:
    """Sanitize string input"""
    if not isinstance(text, str):
        return ""

    # Limit length
    return text[:max_length].strip()


class AnalysisResultsStorage:
    def __init__(self):
        # Get backend API URL from environment
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:3001")
        self.api_base = f"{self.backend_url}/api/traind"

        # Get internal API key for authentication
        self.internal_api_key = os.getenv(
            "INTERNAL_API_KEY", "internal-ml-service-key-2024"
        )

        # Set up headers for internal API calls
        self.headers = {
            "Content-Type": "application/json",
            "X-Internal-API-Key": self.internal_api_key,
        }

    def update_traind_result(
        self, task_id: str, analysis_result: Dict[Any, Any], status: str = "completed"
    ) -> bool:
        """Update traind result via backend API"""

        # Input validation
        if not task_id or not isinstance(task_id, str):
            logger.error("Invalid task_id provided")
            return False

        # Validate UUID format
        if not validate_uuid(task_id):
            logger.error(f"Invalid UUID format for task_id: {task_id}")
            return False

        if not isinstance(analysis_result, dict):
            logger.error("Invalid analysis_result provided")
            return False

        # Validate status
        allowed_statuses = ["completed", "failed", "processing"]
        if status not in allowed_statuses:
            logger.error(f"Invalid status: {status}. Allowed: {allowed_statuses}")
            return False

        try:
            # Extract title from analysis_result
            title = "Analysis Complete"
            try:
                post_info = analysis_result.get("post_info", {})
                if isinstance(post_info, dict):
                    title = post_info.get("title", "Analysis Complete")
                    if isinstance(title, str):
                        title = sanitize_string(title, 200)
                    else:
                        title = "Analysis Complete"
            except:
                title = "Analysis Complete"

            # Prepare API request payload
            payload = {
                "taskId": task_id,
                "result": analysis_result,
                "status": status,
                "title": title,
            }

            # Make API call to backend
            response = requests.post(
                f"{self.api_base}/internal/update-result",
                json=payload,
                headers=self.headers,
                timeout=30,
            )

            if response.status_code == 200:
                logger.info(f"Successfully updated traind record for task {task_id}")
                return True
            else:
                logger.error(
                    f"Failed to update traind record for task {task_id}: {response.status_code} - {response.text}"
                )
                return False

        except requests.exceptions.RequestException as e:
            logger.error(
                f"Network error updating traind result for task {task_id}: {str(e)}"
            )
            return False
        except Exception as e:
            logger.error(f"Failed to update traind result for task {task_id}: {str(e)}")
            return False

    def update_traind_failed(self, task_id: str, error_message: str) -> bool:
        """Update traind to failed status via backend API"""

        # Input validation
        if not task_id or not isinstance(task_id, str):
            logger.error("Invalid task_id provided")
            return False

        # Validate UUID format
        if not validate_uuid(task_id):
            logger.error(f"Invalid UUID format for task_id: {task_id}")
            return False

        if not isinstance(error_message, str):
            logger.error("Invalid error_message provided")
            return False

        # Sanitize error message
        error_message = sanitize_string(error_message, 500)

        try:
            # Prepare API request payload
            payload = {"taskId": task_id, "errorMessage": error_message}

            # Make API call to backend
            response = requests.post(
                f"{self.api_base}/internal/update-failed",
                json=payload,
                headers=self.headers,
                timeout=30,
            )

            if response.status_code == 200:
                logger.info(
                    f"Successfully updated traind record to failed for task {task_id}"
                )
                return True
            else:
                logger.error(
                    f"Failed to update traind record to failed for task {task_id}: {response.status_code} - {response.text}"
                )
                return False

        except requests.exceptions.RequestException as e:
            logger.error(
                f"Network error updating traind to failed for task {task_id}: {str(e)}"
            )
            return False
        except Exception as e:
            logger.error(
                f"Failed to update traind to failed for task {task_id}: {str(e)}"
            )
            return False

    def get_traind_by_task_id(self, task_id: str) -> Optional[Dict[Any, Any]]:
        """Get traind record by task ID (not implemented via API for now)"""
        logger.warning("get_traind_by_task_id not implemented for API-based storage")
        return None

    def close(self):
        """Close connection (no-op for API-based storage)"""
        logger.info("API-based storage - no connection to close")


# Global instance
_storage = None


def get_results_storage() -> AnalysisResultsStorage:
    global _storage
    if _storage is None:
        _storage = AnalysisResultsStorage()
    return _storage
