import { loadGrpcService } from "./grpc.config";

let client: any = null;
let isGrpcAvailable = false;

// Try to initialize gRPC client
try {
  const TaskService = loadGrpcService("clustering.proto", "ml_service");
  client = new TaskService.TaskService(
    process.env.ML_SERVICE_URL || "localhost:50051",
    require("@grpc/grpc-js").credentials.createInsecure()
  );
  isGrpcAvailable = true;
  console.log("✅ gRPC client initialized successfully");
} catch (error) {
  console.warn(
    "gRPC client initialization failed, using mock implementation:",
    error
  );
  isGrpcAvailable = false;
}

export default {
  // Add a new analysis task to the ML service queue
  addTask({
    redditPostId,
    parameters,
  }: {
    redditPostId: string;
    parameters?: any;
  }): Promise<{ success: boolean; task_id: string; message: string }> {
    if (!isGrpcAvailable || !client) {
      throw new Error(
        "gRPC service is not available. Please ensure ML service is running on " +
          (process.env.ML_SERVICE_URL || "localhost:50051")
      );
    }

    return new Promise((resolve, reject) => {
      const request = {
        task_type: "reddit_analysis",
        reddit_post_id: redditPostId,
        parameters_json: parameters ? JSON.stringify(parameters) : "{}",
      };

      client.AddTask(request, (error: any, response: any) => {
        if (error) {
          console.error("gRPC AddTask error:", error);
          reject(new Error(`Failed to add task: ${error.message}`));
        } else {
          resolve({
            success: response.success,
            task_id: response.task_id,
            message: response.message,
          });
        }
      });
    });
  },

  // Get the status of a task (no results, only status)
  getTaskStatus(taskId: string): Promise<{
    success: boolean;
    task_id: string;
    status: string;
    message: string;
    error_message: string;
    created_at: string;
    updated_at: string;
    processing_time_ms: number;
    queue_position: number;
    total_pending: number;
  }> {
    if (!isGrpcAvailable || !client) {
      throw new Error(
        "gRPC service is not available. Please ensure ML service is running on " +
          (process.env.ML_SERVICE_URL || "localhost:50051")
      );
    }

    return new Promise((resolve, reject) => {
      const request = {
        task_id: taskId,
      };

      client.GetTaskStatus(request, (error: any, response: any) => {
        if (error) {
          console.error("gRPC GetTaskStatus error:", error);
          reject(new Error(`Failed to get task status: ${error.message}`));
        } else {
          resolve({
            success: response.success,
            task_id: response.task_id,
            status: response.status,
            message: response.message,
            error_message: response.error_message || "",
            created_at: response.created_at,
            updated_at: response.updated_at,
            processing_time_ms: response.processing_time_ms,
            queue_position: response.queue_position || 0,
            total_pending: response.total_pending || 0,
          });
        }
      });
    });
  },

  // List tasks
  listTasks({
    statusFilter,
    clientId,
    limit = 10,
    offset = 0,
  }: {
    statusFilter?: string;
    clientId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    success: boolean;
    tasks: Array<{
      task_id: string;
      task_type: string;
      status: string;
      created_at: string;
      updated_at: string;
      client_id: string;
    }>;
    total_count: number;
    message: string;
  }> {
    if (!isGrpcAvailable || !client) {
      throw new Error(
        "gRPC service is not available. Please ensure ML service is running on " +
          (process.env.ML_SERVICE_URL || "localhost:50051")
      );
    }

    return new Promise((resolve, reject) => {
      const request = {
        status_filter: statusFilter || "",
        client_id: clientId || "",
        limit,
        offset,
      };

      client.ListTasks(request, (error: any, response: any) => {
        if (error) {
          console.error("gRPC ListTasks error:", error);
          reject(new Error(`Failed to list tasks: ${error.message}`));
        } else {
          resolve({
            success: response.success,
            tasks: response.tasks,
            total_count: response.total_count,
            message: response.message,
          });
        }
      });
    });
  },

  // Utility methods
  isAvailable(): boolean {
    return isGrpcAvailable;
  },

  getConnectionInfo(): { available: boolean; url: string } {
    return {
      available: isGrpcAvailable,
      url: process.env.ML_SERVICE_URL || "localhost:50051",
    };
  },
};
