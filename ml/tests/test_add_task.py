"""
Unit tests for ML module AddTask functionality
Tests the task creation and enqueue process through gRPC interface
"""

import unittest
import json
import sys
import os

# Add the ML module to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

try:
    import grpc

    # Import gRPC proto classes
    sys.path.insert(
        0, os.path.join(os.path.dirname(__file__), "..", "grpc_service", "proto")
    )
    from grpc_service.proto import clustering_pb2
    from grpc_service.proto import clustering_pb2_grpc

    # Import the handler for direct testing
    from grpc_service.handler import TaskServiceHandler, TaskRequest

    GRPC_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Some imports failed: {e}")
    GRPC_AVAILABLE = False


class TestAddTask(unittest.TestCase):
    """Test cases for AddTask functionality"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        if GRPC_AVAILABLE:
            self.handler = TaskServiceHandler()

    def test_add_task_valid_reddit_analysis(self):
        """Test adding a valid reddit analysis task"""
        if not GRPC_AVAILABLE:
            self.skipTest("gRPC not available")

        # Prepare test data
        task_request = TaskRequest(
            task_type="reddit_analysis",
            reddit_post_id="1m355dq",
            parameters_json=json.dumps({"max_comments": 100, "min_score": 1}),
        )

        # Call the handler
        response = self.handler.add_task(task_request)

        # Verify response
        self.assertTrue(
            response.success,
            f"Task should be added successfully, but got: {response.message}",
        )
        self.assertIsNotNone(response.task_id, "Task ID should be generated")
        self.assertNotEqual(response.task_id, "", "Task ID should not be empty")
        self.assertEqual(response.message, "Task added successfully")

        print(f"✅ Successfully added task with ID: {response.task_id}")

    def test_add_task_default_parameters(self):
        """Test adding a task with default parameters"""
        if not GRPC_AVAILABLE:
            self.skipTest("gRPC not available")

        # Prepare test data with empty parameters (should use defaults)
        task_request = TaskRequest(
            task_type="reddit_analysis",
            reddit_post_id="1mn95cp",
            parameters_json="",  # Empty means use defaults
        )

        # Call the handler
        response = self.handler.add_task(task_request)

        # Verify response
        self.assertTrue(
            response.success,
            f"Task with default params should be added, but got: {response.message}",
        )
        self.assertIsNotNone(response.task_id)
        self.assertNotEqual(response.task_id, "")

        print(
            f"✅ Successfully added task with default parameters, ID: {response.task_id}"
        )

    def test_add_task_invalid_json(self):
        """Test adding a task with invalid JSON parameters"""
        if not GRPC_AVAILABLE:
            self.skipTest("gRPC not available")

        # Prepare test data with invalid JSON
        task_request = TaskRequest(
            task_type="reddit_analysis",
            reddit_post_id="test_post",
            parameters_json="invalid json {",
        )

        # Call the handler
        response = self.handler.add_task(task_request)

        # Verify response
        self.assertFalse(response.success, "Invalid JSON should cause failure")
        self.assertIn("INVALID_JSON", response.message)
        self.assertEqual(response.task_id, "", "Task ID should be empty on failure")

        print(f"✅ Correctly rejected invalid JSON: {response.message}")

    def test_add_task_invalid_task_type(self):
        """Test adding a task with invalid task type"""
        if not GRPC_AVAILABLE:
            self.skipTest("gRPC not available")

        # Prepare test data with invalid task type
        task_request = TaskRequest(
            task_type="invalid_task_type",
            reddit_post_id="test_post",
            parameters_json="{}",
        )

        # Call the handler
        response = self.handler.add_task(task_request)

        # Verify response
        self.assertFalse(response.success, "Invalid task type should cause failure")
        self.assertIn("INVALID_TASK_TYPE", response.message)
        self.assertEqual(response.task_id, "", "Task ID should be empty on failure")

        print(f"✅ Correctly rejected invalid task type: {response.message}")

    def test_add_task_custom_parameters(self):
        """Test adding a task with custom parameters"""
        if not GRPC_AVAILABLE:
            self.skipTest("gRPC not available")

        # Prepare test data with custom parameters
        custom_params = {
            "max_comments": 50,
            "hdbscan_params": {"min_cluster_size": 3, "metric": "cosine"},
            "sentiment_words": {
                "positive": ["good", "great", "awesome"],
                "negative": ["bad", "terrible", "awful"],
            },
        }

        task_request = TaskRequest(
            task_type="reddit_analysis",
            reddit_post_id="custom_test_post",
            parameters_json=json.dumps(custom_params),
        )

        # Call the handler
        response = self.handler.add_task(task_request)

        # Verify response
        self.assertTrue(
            response.success,
            f"Task with custom params should be added, but got: {response.message}",
        )
        self.assertIsNotNone(response.task_id)
        self.assertNotEqual(response.task_id, "")

        print(
            f"✅ Successfully added task with custom parameters, ID: {response.task_id}"
        )

    def test_add_task_grpc_interface(self):
        """Test adding a task through gRPC interface (integration test)"""
        if not GRPC_AVAILABLE:
            self.skipTest("gRPC not available")

        try:
            # Connect to gRPC service
            channel = grpc.insecure_channel("localhost:50051")
            stub = clustering_pb2_grpc.TaskServiceStub(channel)

            # Create gRPC request
            request = clustering_pb2.AddTaskRequest()
            request.task_type = "reddit_analysis"
            request.reddit_post_id = "grpc_test_post"
            request.parameters_json = json.dumps({"max_comments": 25, "min_score": 2})

            # Call gRPC service
            response = stub.AddTask(request)

            # Verify response
            self.assertTrue(
                response.success,
                f"gRPC task should be added, but got: {response.message}",
            )
            self.assertIsNotNone(response.task_id)
            self.assertNotEqual(response.task_id, "")

            print(f"✅ Successfully added task via gRPC, ID: {response.task_id}")

        except grpc.RpcError as e:
            self.skipTest(f"gRPC service not available: {e}")
        except Exception as e:
            self.fail(f"Unexpected error in gRPC test: {e}")
        finally:
            if "channel" in locals():
                channel.close()


def run_add_task_tests():
    """Run the add task unit tests"""
    print("ML Module - AddTask Unit Tests")
    print("=" * 50)

    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestAddTask)

    # Run tests with detailed output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Print summary
    print("\n" + "=" * 50)
    print("Test Results Summary:")
    print("=" * 50)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(getattr(result, 'skipped', []))}")

    if result.failures:
        print("\nFailures:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback}")

    if result.errors:
        print("\nErrors:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback}")

    success = len(result.failures) == 0 and len(result.errors) == 0
    print(f"\nOverall result: {'✅ PASSED' if success else '❌ FAILED'}")
    print("=" * 50)

    return success


if __name__ == "__main__":
    run_add_task_tests()
