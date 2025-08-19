# 使用Python 3.13基础镜像
FROM python:3.13-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 复制requirements文件
COPY docker/requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露50051端口 (gRPC默认端口)
EXPOSE 50051

# 设置环境变量
ENV PYTHONPATH=/app
ENV GRPC_PORT=50051

# 启动命令
CMD ["python", "main.py"]
