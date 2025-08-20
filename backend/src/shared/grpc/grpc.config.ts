import path from "path";

export function loadGrpcService(protoFile: string, packageName: string) {
  try {
    // Try to load proto-loader
    const protoLoader = require("@grpc/proto-loader");

    const definition = protoLoader.loadSync(
      path.join(__dirname, "proto", protoFile),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );

    const loaded = (
      require("@grpc/grpc-js").loadPackageDefinition(definition) as any
    )[packageName];

    return loaded;
  } catch (error) {
    console.error("Error loading gRPC service:", error);
    throw error;
  }
}
