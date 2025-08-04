import { loadSync } from "@grpc/proto-loader";
import path from "path";

export function loadGrpcService(protoFile: string, packageName: string) {
  const definition = loadSync(path.join(__dirname, "proto", protoFile), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const loaded = (
    require("@grpc/grpc-js").loadPackageDefinition(definition) as any
  )[packageName];
  return loaded;
}
