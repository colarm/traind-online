@echo off
echo Generating gRPC code from proto files...

cd grpc\proto

python -m grpc_tools.protoc --python_out=. --grpc_python_out=. --proto_path=. clustering.proto

if exist clustering_pb2.py (
    echo Generated files:
    dir clustering_pb2.py clustering_pb2_grpc.py
    echo Done! gRPC code generated successfully.
) else (
    echo Error: Failed to generate gRPC files. Make sure grpcio-tools is installed:
    echo pip install grpcio grpcio-tools
)

pause
