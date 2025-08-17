"""
End-to-end test for ML module full chain (gRPC → TaskQueue → Processor → RedditAnalyser → Result)
完整的全链路测试，包括多种参数配置和错误处理
"""

import sys
import os
import time
import json
import traceback

sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "..", "grpc_service", "proto")
)


def test_basic_reddit_analysis():
    """测试基本的Reddit分析功能"""
    print("\n🔬 测试1: 基本Reddit分析")
    print("-" * 30)

    try:
        import grpc
        import clustering_pb2 #type: ignore
        import clustering_pb2_grpc #type: ignore

        # Connect to gRPC service
        channel = grpc.insecure_channel("localhost:50051")
        stub = clustering_pb2_grpc.TaskServiceStub(channel)

        # Create request with default parameters
        request = clustering_pb2.AddTaskRequest()
        request.task_type = "reddit_analysis"
        request.reddit_post_id = "1m355dq"
        request.parameters_json = ""  # 使用默认参数

        print(f"� 发送分析任务: {request.reddit_post_id}")
        print(f"📋 参数: 使用默认配置")

        response = stub.AddTask(request)
        assert response.success, f"AddTask failed: {response.message}"
        print(f"✅ 任务入队成功: {response.task_id}")

        # Poll for task status
        status_request = clustering_pb2.GetTaskStatusRequest()
        status_request.task_id = response.task_id

        return monitor_task_progress(stub, status_request, "基本Reddit分析")

    except Exception as e:
        print(f"❌ 测试1失败: {e}")
        return False
    finally:
        if 'channel' in locals():
            channel.close()


def test_custom_parameters():
    """测试自定义参数配置"""
    print("\n🔬 测试2: 自定义参数配置")
    print("-" * 30)
    
    try:
        import grpc
        import clustering_pb2 #type: ignore
        import clustering_pb2_grpc #type: ignore

        channel = grpc.insecure_channel("localhost:50051")
        stub = clustering_pb2_grpc.TaskServiceStub(channel)

        # Create request with custom parameters
        custom_params = {
            "max_comments": 50,
            "hdbscan_params": {
                "min_cluster_size": 3,
                "metric": "cosine"
            },
            "sentiment_words": {
                "positive": ["good", "great", "awesome", "excellent"],
                "negative": ["bad", "terrible", "awful", "horrible"]
            },
            "stop_words": ["the", "a", "and", "custom_test_word"]
        }

        request = clustering_pb2.AddTaskRequest()
        request.task_type = "reddit_analysis"
        request.reddit_post_id = "1mn95cp"
        request.parameters_json = json.dumps(custom_params, indent=2)

        print(f"📤 发送自定义参数任务: {request.reddit_post_id}")
        print(f"📋 自定义参数:")
        print(f"   - 最大评论数: {custom_params['max_comments']}")
        print(f"   - 聚类算法: {custom_params['hdbscan_params']}")
        print(f"   - 自定义情感词汇数: {len(custom_params['sentiment_words']['positive'])} 积极, {len(custom_params['sentiment_words']['negative'])} 消极")
        print(f"   - 自定义停用词数: {len(custom_params['stop_words'])}")

        response = stub.AddTask(request)
        assert response.success, f"AddTask failed: {response.message}"
        print(f"✅ 自定义参数任务入队成功: {response.task_id}")

        status_request = clustering_pb2.GetTaskStatusRequest()
        status_request.task_id = response.task_id

        return monitor_task_progress(stub, status_request, "自定义参数分析")

    except Exception as e:
        print(f"❌ 测试2失败: {e}")
        return False
    finally:
        if 'channel' in locals():
            channel.close()


def test_error_handling():
    """测试错误处理"""
    print("\n🔬 测试3: 错误处理")
    print("-" * 30)
    
    try:
        import grpc
        import clustering_pb2 #type: ignore
        import clustering_pb2_grpc #type: ignore

        channel = grpc.insecure_channel("localhost:50051")
        stub = clustering_pb2_grpc.TaskServiceStub(channel)

        # Test invalid task type
        request = clustering_pb2.AddTaskRequest()
        request.task_type = "invalid_task_type"
        request.reddit_post_id = "test"
        request.parameters_json = "{}"

        print("📤 发送无效任务类型...")
        response = stub.AddTask(request)
        
        if not response.success:
            print(f"✅ 正确处理无效任务类型: {response.message}")
        else:
            print(f"❌ 应该拒绝无效任务类型，但接受了")
            return False

        # Test invalid JSON
        request2 = clustering_pb2.AddTaskRequest()
        request2.task_type = "reddit_analysis"
        request2.reddit_post_id = "test"
        request2.parameters_json = "invalid json {"

        print("📤 发送无效JSON参数...")
        response2 = stub.AddTask(request2)
        
        if not response2.success:
            print(f"✅ 正确处理无效JSON: {response2.message}")
        else:
            print(f"❌ 应该拒绝无效JSON，但接受了")
            return False

        return True

    except Exception as e:
        print(f"❌ 测试3失败: {e}")
        return False
    finally:
        if 'channel' in locals():
            channel.close()


def test_task_status_query():
    """测试任务状态查询"""
    print("\n🔬 测试4: 任务状态查询")
    print("-" * 30)
    
    try:
        import grpc
        import clustering_pb2 #type: ignore
        import clustering_pb2_grpc #type: ignore

        channel = grpc.insecure_channel("localhost:50051")
        stub = clustering_pb2_grpc.TaskServiceStub(channel)

        # Test non-existent task
        status_request = clustering_pb2.GetTaskStatusRequest()
        status_request.task_id = "non-existent-task-id"

        print("📤 查询不存在的任务...")
        status_response = stub.GetTaskStatus(status_request)
        
        if not status_response.success and status_response.status == "not_found":
            print(f"✅ 正确处理不存在的任务: {status_response.message}")
            return True
        else:
            print(f"❌ 应该返回任务不存在，但返回了: {status_response.status}")
            return False

    except Exception as e:
        print(f"❌ 测试4失败: {e}")
        return False
    finally:
        if 'channel' in locals():
            channel.close()


def monitor_task_progress(stub, status_request, task_name):
    """监控任务进度"""
    print(f"⏳ 监控任务进度...")
    
    for attempt in range(100):
        try:
            status_response = stub.GetTaskStatus(status_request)
            print(f"   尝试{attempt+1:2d}: 状态: {status_response.status}")

            if status_response.status == "completed":
                print(f"🎉 {task_name}完成成功!")
                
                if status_response.result_json:
                    try:
                        result = json.loads(status_response.result_json)
                        print("📊 分析结果摘要:")
                        if "clustering_results" in result:
                            clusters = result["clustering_results"]
                            print(f"   - 发现集群数: {clusters.get('num_clusters', 'N/A')}")
                            print(f"   - 噪声比例: {clusters.get('noise_ratio', 'N/A')}")
                            print(f"   - 轮廓得分: {clusters.get('silhouette_score', 'N/A')}")
                        if "data_source" in result:
                            data = result["data_source"]
                            print(f"   - 处理评论数: {data.get('processed_comments', 'N/A')}")
                        print(f"   - 处理时间: {result.get('processing_time_ms', 'N/A')} ms")
                    except json.JSONDecodeError:
                        print("   - 结果JSON解析失败")
                else:
                    print("   - 无结果数据")
                return True
                
            elif status_response.status == "failed":
                print(f"❌ {task_name}失败: {status_response.message}")
                if status_response.error_json:
                    try:
                        error = json.loads(status_response.error_json)
                        print(f"   错误详情: {error}")
                    except json.JSONDecodeError:
                        print(f"   错误详情: {status_response.error_json}")
                return False
                
            elif status_response.status == "error":
                print(f"❌ {task_name}处理错误: {status_response.message}")
                return False
                
            time.sleep(2)
            
        except Exception as e:
            print(f"❌ 状态查询异常: {e}")
            return False
    
    print(f"⚠️  {task_name}超时，请检查服务状态")
    return False


def test_fullchain():
    """执行完整的全链路测试"""
    print("🚀 ML模块全链路测试开始")
    print("=" * 50)
    print("测试内容:")
    print("  1. 基本Reddit分析 (默认参数)")
    print("  2. 自定义参数配置")
    print("  3. 错误处理机制")
    print("  4. 任务状态查询")
    print("=" * 50)
    
    test_results = []
    
    # 运行所有测试
    test_results.append(("基本Reddit分析", test_basic_reddit_analysis()))
    test_results.append(("自定义参数配置", test_custom_parameters()))
    test_results.append(("错误处理机制", test_error_handling()))
    test_results.append(("任务状态查询", test_task_status_query()))
    
    # 输出测试结果
    print("\n" + "=" * 50)
    print("📋 测试结果汇总:")
    print("=" * 50)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"  {test_name:20s} | {status}")
        if result:
            passed += 1
    
    print("-" * 50)
    print(f"总体结果: {passed}/{total} 测试通过")
    
    if passed == total:
        print("🎉 全链路测试完全成功!")
        print("✨ 系统功能正常，参数自定义系统工作正常")
    else:
        print("⚠️  部分测试失败，请检查系统状态")
    
    print("=" * 50)
    return passed == total


if __name__ == "__main__":
    test_fullchain()
