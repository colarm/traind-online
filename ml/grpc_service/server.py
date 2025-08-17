import sys
import os

# Add current directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)
sys.path.insert(0, current_dir)

try:
    import grpc
    from concurrent import futures

    # Try different import paths
    try:
        from grpc_service.proto import clustering_pb2_grpc, clustering_pb2
        from grpc_service.handler import (
            TaskServiceHandler,
            TaskRequest,
            TaskStatusRequest,
            TaskCancelRequest,
        )
    except ImportError:
        try:
            from proto import clustering_pb2_grpc, clustering_pb2
            from handler import (
                TaskServiceHandler,
                TaskRequest,
                TaskStatusRequest,
                TaskCancelRequest,
            )
        except ImportError:
            # Add proto directory to path and try again
            import sys
            import os

            proto_dir = os.path.join(os.path.dirname(__file__), "proto")
            sys.path.insert(0, proto_dir)
            sys.path.insert(0, os.path.dirname(__file__))
            import clustering_pb2_grpc, clustering_pb2  # type: ignore
            from handler import (
                TaskServiceHandler,
                TaskRequest,
                TaskStatusRequest,
                TaskCancelRequest,
            )

    GRPC_AVAILABLE = True
except ImportError as e:
    print(f"Warning: gRPC import failed: {e}")
    print("Install with: pip install grpcio grpcio-tools")
    GRPC_AVAILABLE = False


class TaskServiceGRPCAdapter(clustering_pb2_grpc.TaskServiceServicer):
    def __init__(self):
        self.handler = TaskServiceHandler()

    def AddTask(self, request, context):
        # Convert gRPC request to Python object
        task_request = TaskRequest(
            task_type=request.task_type,
            parameters_json=request.parameters_json,
            reddit_post_id=request.reddit_post_id,
        )

        # Call pure business logic handler
        response_obj = self.handler.add_task(task_request)

        # Convert Python object back to gRPC response
        grpc_response = clustering_pb2.AddTaskResponse()
        grpc_response.success = response_obj.success
        grpc_response.task_id = response_obj.task_id
        grpc_response.message = response_obj.message

        return grpc_response

    def GetTaskStatus(self, request, context):
        # Convert gRPC request to Python object
        status_request = TaskStatusRequest(task_id=request.task_id)

        # Call pure business logic handler
        response_obj = self.handler.get_task_status(status_request)

        # Convert Python object back to gRPC response
        grpc_response = clustering_pb2.GetTaskStatusResponse()
        grpc_response.success = response_obj.success
        grpc_response.task_id = response_obj.task_id
        grpc_response.message = response_obj.message
        grpc_response.status = response_obj.status
        grpc_response.result_json = response_obj.result_json
        grpc_response.error_json = response_obj.error_json
        grpc_response.created_at = response_obj.created_at
        grpc_response.updated_at = response_obj.updated_at
        grpc_response.processing_time_ms = response_obj.processing_time_ms

        return grpc_response

    def CancelTask(self, request, context):
        # Convert gRPC request to Python object
        cancel_request = TaskCancelRequest(task_id=request.task_id)

        # Call pure business logic handler
        response_obj = self.handler.cancel_task(cancel_request)

        # Convert Python object back to gRPC response
        grpc_response = clustering_pb2.CancelTaskResponse()
        grpc_response.success = response_obj.success
        grpc_response.message = response_obj.message

        return grpc_response


class GRPCServer:

    def __init__(self, port=50051, max_workers=10):
        self.port = port
        self.max_workers = max_workers
        self.server = None
        self.running = False

    def start(self):
        if not GRPC_AVAILABLE:
            print("gRPC not available, cannot start server")
            return False

        if self.running:
            print("gRPC server is already running")
            return True

        try:
            print(f"Starting gRPC server on port {self.port}...")

            # Create gRPC server
            self.server = grpc.server(
                futures.ThreadPoolExecutor(max_workers=self.max_workers),
                options=[
                    ("grpc.keepalive_time_ms", 30000),
                    ("grpc.keepalive_timeout_ms", 5000),
                    ("grpc.keepalive_permit_without_calls", True),
                    ("grpc.http2.max_pings_without_data", 0),
                    ("grpc.http2.min_time_between_pings_ms", 10000),
                    ("grpc.http2.min_ping_interval_without_data_ms", 300000),
                ],
            )

            # Register task service
            task_adapter = TaskServiceGRPCAdapter()
            clustering_pb2_grpc.add_TaskServiceServicer_to_server(
                task_adapter, self.server
            )

            # Bind port
            listen_addr = f"[::]:{self.port}"
            self.server.add_insecure_port(listen_addr)

            # Start server
            self.server.start()
            self.running = True

            print(f"✓ gRPC Server started successfully on port {self.port}")
            print(f"  - Max workers: {self.max_workers}")
            print(f"  - Services: TaskService")
            return True

        except Exception as e:
            print(f"✗ Failed to start gRPC server: {str(e)}")
            self.running = False
            return False

    def stop(self, grace_period=5):
        if not self.running or not self.server:
            print("gRPC server is not running")
            return

        print(f"Stopping gRPC server (grace period: {grace_period}s)...")

        try:
            # Graceful shutdown
            self.server.stop(grace=grace_period)
            self.running = False
            print("✓ gRPC server stopped successfully")
        except Exception as e:
            print(f"✗ Error stopping gRPC server: {str(e)}")

    def wait_for_termination(self):
        # Prevent main thread from exiting
        if self.server and self.running:
            try:
                self.server.wait_for_termination()
            except KeyboardInterrupt:
                print("\nReceived interrupt signal")
                self.stop()

    def is_running(self):
        return self.running

    def get_status(self):
        return {
            "running": self.running,
            "port": self.port,
            "max_workers": self.max_workers,
            "grpc_available": GRPC_AVAILABLE,
        }


# Global instance
_grpc_server = None


def get_grpc_server(port=50051, max_workers=10):
    global _grpc_server
    if _grpc_server is None:
        _grpc_server = GRPCServer(port, max_workers)
    return _grpc_server


def main():
    print("=== gRPC Server Standalone Mode ===")

    server = get_grpc_server(port=50051, max_workers=10)

    try:
        if server.start():
            print("\ngRPC server is running. Press Ctrl+C to stop...")
            server.wait_for_termination()
        else:
            print("Failed to start gRPC server")
            return 1

    except KeyboardInterrupt:
        print("\nReceived shutdown signal...")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return 1
    finally:
        server.stop()
        print("Shutdown complete")

    return 0


if __name__ == "__main__":
    exit(main())
