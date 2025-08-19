#!/bin/bash
# ML Service Docker Compose 启动脚本

cd "$(dirname "$0")"
docker-compose --env-file ../.env up "$@"
