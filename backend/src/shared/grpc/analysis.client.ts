import { loadGrpcService } from "./grpc.config";

const ClusteringService = loadGrpcService("clustering.proto", "clustering");

const client = new ClusteringService.ClusteringService(
  "localhost:50051", // or from env
  require("@grpc/grpc-js").credentials.createInsecure()
);

export default {
  runAnalysis({
    traindId,
    redditId,
    parameterSetId,
    userId,
  }: {
    traindId: string;
    redditId: string;
    parameterSetId: string;
    userId: string;
    }): Promise<{ message: string }> {
    // This is a mock implementation. Replace with actual gRPC call.
    return new Promise((resolve, reject) => {
      resolve({
        message: "Analysis started successfully",
      });
    });
    return new Promise((resolve, reject) => {
      client.RunAnalysis(
        { traindId, redditId, parameterSetId, userId },
        (err: any, res: any) => {
          if (err) reject(err);
          else resolve(res);
        }
      );
    });
  },

  getResult(traindId: string): Promise<{ title: any; result: any }> {
    // This is a mock implementation. Replace with actual gRPC call.
    return new Promise((resolve, reject) => {
      resolve({
        title: "Mock Title",
        result: { analysis: "Mock Result" },
      });
    });
    return new Promise((resolve, reject) => {
      client.GetResult({ traindId }, (err: any, res: any) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  },
};
