#!/bin/bash
# 生成gRPC代码的脚本

echo "Generating gRPC code from proto files..."

# 进入proto目录
cd grpc_service/proto

# 生成Python gRPC代码
python -m grpc_tools.protoc \
    --python_out=. \
    --grpc_python_out=. \
    --proto_path=. \
    clustering.proto

echo "Generated files:"
ls -la clustering_pb2.py clustering_pb2_grpc.py

echo "Done! gRPC code generated successfully."
