"""
ML service entry point
"""

import logging
import signal
import time
from threading import Event

from pipeline.task_queue import get_task_queue
from analysis.task_processor import TaskProcessor
from grpc_service.server import GRPCServer

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global stop event
stop_event = Event()


def signal_handler(signum, frame):
    logger.info("Received stop signal, shutting down...")
    stop_event.set()


def main():
    logger.info("Starting ML Service...")

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    task_queue = get_task_queue()
    logger.info("Task queue initialized")

    processor = TaskProcessor()
    processor.start()
    logger.info("Task processor started")

    grpc_server = GRPCServer(port=50051)
    if grpc_server.start():
        logger.info("gRPC server started successfully on port 50051")
    else:
        logger.error("Failed to start gRPC server")
        return 1

    try:
        logger.info("ML Service is running. Press Ctrl+C to stop.")

        while not stop_event.is_set():
            time.sleep(1)

    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
        stop_event.set()

    finally:
        logger.info("Shutting down services...")

        grpc_server.stop()
        logger.info("gRPC server stopped")

        processor.stop()
        logger.info("Task processor stopped")

        logger.info("ML Service shutdown complete")


if __name__ == "__main__":
    main()
