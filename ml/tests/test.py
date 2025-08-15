"""
Reddit Analysis Test Module

This module provides testing functionality for the Reddit comment clustering analysis system.
It includes methods for testing the analysis pipeline, generating reports, and validating results.
"""

import time
import signal
import sys
import json
import os
from datetime import datetime

# Add parent directory to path for module imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analysis.reddit_analyser import RedditAnalyser
from config import SUMMARY_PARAMS, HDBSCAN_PARAMS, MODEL_PARAMS, PREPROCESSING_PARAMS


def convert_numpy_types(obj):
    """
    Recursively convert numpy types to Python native types for JSON serialization.

    Args:
        obj: Object that may contain numpy types

    Returns:
        Object with numpy types converted to Python native types
    """
    import numpy as np

    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj


def test_reddit_analysis():
    """
    Main test function for Reddit comment analysis.

    Tests the complete analysis pipeline including:
    - Reddit data fetching
    - Comment preprocessing
    - Clustering analysis
    - Report generation
    """
    print("🧪 Testing Reddit analysis...")

    # Initialize the analyzer
    analyzer = RedditAnalyser()

    # Test with a sample Reddit post ID
    test_reddit_id = "1mn95cp"

    print(f"📋 Analyzing Reddit post ID: {test_reddit_id}")
    print(
        "💡 Note: Please configure Reddit API credentials in config.py for actual testing"
    )

    try:
        # Execute the analysis pipeline
        print("🔄 Starting analysis...")
        start_time = time.time()
        result = analyzer.analyse_reddit_post(test_reddit_id)
        analysis_time = time.time() - start_time

        # Process successful results
        if result["success"]:
            print("✅ Analysis completed successfully!")
            print(f"   ⏱️  Analysis time: {analysis_time:.2f} seconds")
            print(f"   📊 Clusters found: {result['num_clusters']}")
            print(f"   🔇 Noise ratio: {result['noise_ratio']:.1%}")
            print(f"   📝 Processed comments: {result['total_processed']}")

            # Display post information if available
            if "post_info" in result:
                print(f"   📋 Post title: {result['post_info']['title'][:100]}...")
                print(f"   👥 Subreddit: r/{result['post_info']['subreddit']}")
                print(f"   ⭐ Score: {result['post_info']['score']:,}")
                print(f"   💬 Total comments: {result['post_info']['num_comments']:,}")

            # Calculate and display quality metrics
            noise_ratio = result["noise_ratio"]
            categorized_ratio = 1 - noise_ratio
            print(f"   📈 Successfully categorized: {categorized_ratio:.1%}")

            # Provide quality assessment based on noise ratio
            if noise_ratio < 0.3:
                print(f"   🎯 Analysis Quality: Excellent (low noise)")
            elif noise_ratio < 0.6:
                print(f"   🎯 Analysis Quality: Good")
            elif noise_ratio < 0.8:
                print(f"   🎯 Analysis Quality: Fair (consider parameter tuning)")
            else:
                print(f"   ⚠️  Analysis Quality: Poor (high noise - needs optimization)")

            # Display top discussion topics
            if "summaries" in result and result["summaries"]:
                print(f"\n🎨 Top discussion topics:")
                for i, summary in enumerate(result["summaries"][:5], 1):
                    print(f"   {i}. {summary['summary']} ({summary['size']} comments)")

            # Generate detailed reports
            print("\n📄 Generating analysis reports...")
            generate_analysis_reports(result, test_reddit_id, analysis_time)

        else:
            print(f"❌ Analysis failed: {result.get('error', 'Unknown error')}")

    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")


def generate_analysis_reports(result, reddit_id, analysis_time):
    """
    Generate comprehensive analysis reports in JSON and text formats.

    Args:
        result: Analysis result dictionary
        reddit_id: Reddit post ID
        analysis_time: Time taken for analysis in seconds
    """
    # Create reports directory if it doesn't exist
    output_dir = "reports"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Generate timestamp for unique filenames
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Define output filenames
    json_filename = f"{output_dir}/reddit_analysis_{reddit_id}_{timestamp}.json"
    txt_filename = f"{output_dir}/reddit_analysis_{reddit_id}_{timestamp}.txt"

    # Prepare detailed report data
    report_data = prepare_detailed_report(result, reddit_id, timestamp, analysis_time)

    # Convert numpy types for JSON serialization
    report_data = convert_numpy_types(report_data)

    # Write JSON report
    with open(json_filename, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)

    # Write text report
    generate_text_report(report_data, txt_filename)

    # Display file information
    json_size = os.path.getsize(json_filename) / 1024
    txt_size = os.path.getsize(txt_filename) / 1024

    print(f"✅ Reports generated successfully!")
    print(f"   📄 JSON Report: {json_filename} ({json_size:.1f} KB)")
    print(f"   📄 Text Report: {txt_filename} ({txt_size:.1f} KB)")


def prepare_detailed_report(result, reddit_id, timestamp, analysis_time):
    """
    Prepare comprehensive report data structure with statistics and insights.

    Args:
        result: Analysis result dictionary
        reddit_id: Reddit post ID
        timestamp: Report generation timestamp
        analysis_time: Analysis execution time

    Returns:
        Dictionary containing detailed report data
    """
    # Calculate cluster statistics if analysis was successful
    if result["success"] and result["clusters"]:
        cluster_sizes = [len(comments) for comments in result["clusters"].values()]
        import numpy as np

        cluster_statistics = {
            "total_clusters": int(result["num_clusters"]),
            "avg_cluster_size": f"{float(np.mean(cluster_sizes)):.1f}",
            "largest_cluster_size": int(max(cluster_sizes)) if cluster_sizes else 0,
            "smallest_cluster_size": int(min(cluster_sizes)) if cluster_sizes else 0,
            "median_cluster_size": f"{float(np.median(cluster_sizes)):.1f}",
            "cluster_size_distribution": {
                "small_clusters": len([s for s in cluster_sizes if s <= 5]),
                "medium_clusters": len([s for s in cluster_sizes if 6 <= s <= 15]),
                "large_clusters": len([s for s in cluster_sizes if s > 15]),
            },
        }
    else:
        # Default statistics for failed analysis
        cluster_statistics = {
            "total_clusters": 0,
            "avg_cluster_size": "0.0",
            "largest_cluster_size": 0,
            "smallest_cluster_size": 0,
            "median_cluster_size": "0.0",
            "cluster_size_distribution": {
                "small_clusters": 0,
                "medium_clusters": 0,
                "large_clusters": 0,
            },
        }

    # Prepare detailed cluster summaries
    detailed_summaries = []
    if result["success"] and "summaries" in result:
        # Use configuration parameters to control display quantity
        max_clusters = SUMMARY_PARAMS["top_clusters_display"]
        for summary in result["summaries"][:max_clusters]:
            # Process sample comments with length truncation
            sample_comments = []
            max_samples = SUMMARY_PARAMS["sample_comments_per_cluster"]
            for comment in summary.get("sample_comments", [])[:max_samples]:
                if len(comment) > 200:
                    sample_comments.append(comment[:200] + "...")
                else:
                    sample_comments.append(comment)

            # Extract keywords and calculate statistics
            keywords = summary.get("keywords", [])
            cluster_info = {
                "cluster_id": int(summary["cluster_id"]),
                "rank": int(summary["rank"]),
                "size": int(summary["size"]),
                "summary": summary["summary"],
                "keywords": keywords,
                "keyword_count": len(keywords),
                "sample_comments": sample_comments,
                "avg_comment_length": (
                    float(
                        np.mean(
                            [
                                len(comment)
                                for comment in summary.get("sample_comments", [])
                            ]
                        )
                    )
                    if summary.get("sample_comments")
                    else 0.0
                ),
                "relative_size": f"{(summary['size'] / result['total_processed']) * 100:.1f}%",
            }
            detailed_summaries.append(cluster_info)

    # Build complete report structure
    report = {
        "metadata": {
            "title": "Reddit Comment Clustering Analysis Report - Optimized",
            "generated_at": timestamp,
            "reddit_post_id": reddit_id,
            "analysis_method": "HDBSCAN + SentenceTransformers",
            "analysis_time_seconds": analysis_time,
            "optimization_version": "1.0",
        },
        "executive_summary": {
            "analysis_success": result["success"],
            "total_comments_processed": int(result.get("total_processed", 0)),
            "clusters_discovered": int(result.get("num_clusters", 0)),
            "noise_ratio": f"{float(result.get('noise_ratio', 1.0)):.1%}",
            "successfully_categorized": f"{float(1-result.get('noise_ratio', 1.0)):.1%}",
            "processing_efficiency": (
                f"{result.get('total_processed', 0)/analysis_time:.1f} comments/second"
                if analysis_time > 0
                else "N/A"
            ),
        },
        "post_info": result.get("post_info", {}),
        "cluster_statistics": cluster_statistics,
        "top_clusters": detailed_summaries,
        "optimization_insights": generate_optimization_insights(result),
        "methodology": {
            "preprocessing": [
                f"Remove URLs and normalize whitespace",
                f"Filter comments with minimum {PREPROCESSING_PARAMS['min_comment_length']} characters and {PREPROCESSING_PARAMS['min_word_count']} words",
                f"Exclude low-quality comments starting with common phrases: {', '.join(PREPROCESSING_PARAMS['filter_prefixes'])}",
                f"Skip deleted comments: {PREPROCESSING_PARAMS['filter_deleted']}",
                f"Skip removed comments: {PREPROCESSING_PARAMS['filter_removed']}",
            ],
            "embedding": f"SentenceTransformers {MODEL_PARAMS['sentence_transformer_model']} model",
            "clustering": {
                "algorithm": "HDBSCAN",
                "parameters": {
                    "min_cluster_size": HDBSCAN_PARAMS["min_cluster_size"],
                    "min_samples": HDBSCAN_PARAMS["min_samples"],
                    "metric": HDBSCAN_PARAMS["metric"],
                    "cluster_selection_epsilon": HDBSCAN_PARAMS[
                        "cluster_selection_epsilon"
                    ],
                    "alpha": HDBSCAN_PARAMS["alpha"],
                },
                "optimization": "Tuned for reduced noise and better small cluster detection",
            },
            "summarization": [
                f"Dynamic keyword extraction (up to {SUMMARY_PARAMS['keywords_per_cluster']} per cluster)",
                f"Enhanced keyword analysis ({SUMMARY_PARAMS['enhanced_keywords']} keywords)",
                "Sentiment analysis (positive/negative/neutral)",
                "Topic categorization using 8 universal categories",
                "Natural language summary generation with context awareness",
                f"Display top {SUMMARY_PARAMS['top_clusters_display']} clusters",
                f"Show {SUMMARY_PARAMS['sample_comments_per_cluster']} sample comments per cluster",
            ],
        },
    }

    return report


def generate_optimization_insights(result):
    """
    Generate optimization insights and recommendations based on analysis results.

    Args:
        result: Analysis result dictionary

    Returns:
        List of optimization insights and recommendations
    """
    insights = []

    if result["success"]:
        noise_ratio = result.get("noise_ratio", 1.0)
        num_clusters = result.get("num_clusters", 0)
        total_processed = result.get("total_processed", 0)

        # Analyze noise ratio and provide recommendations
        if noise_ratio > 0.8:
            insights.append(
                "High noise ratio detected - consider increasing cluster_selection_epsilon"
            )
        elif noise_ratio < 0.3:
            insights.append("Excellent clustering performance - parameters well-tuned")

        # Analyze cluster count and provide recommendations
        if num_clusters > total_processed * 0.1:
            insights.append(
                "High number of small clusters - consider increasing min_cluster_size"
            )
        elif num_clusters < 5:
            insights.append(
                "Very few clusters found - consider decreasing clustering parameters"
            )

        # Add general insights about the analysis
        insights.append(
            f"Successfully identified {num_clusters} distinct discussion topics"
        )
        insights.append(f"Analysis covers {total_processed} comments")
        insights.append("Dynamic topic identification adapts to Reddit dataset")
        insights.append("Sentiment analysis reveals community opinion patterns")

    return insights


def generate_text_report(report_data, filename):
    """
    Generate a comprehensive text-format analysis report.

    Args:
        report_data: Complete report data dictionary
        filename: Output filename for the text report
    """

    with open(filename, "w", encoding="utf-8") as f:
        # Write report header and metadata
        f.write("REDDIT COMMENT CLUSTERING ANALYSIS REPORT - OPTIMIZED\n")
        f.write("=" * 60 + "\n\n")

        metadata = report_data["metadata"]
        f.write(f"Generated: {metadata['generated_at']}\n")
        f.write(f"Reddit Post ID: {metadata['reddit_post_id']}\n")
        f.write(f"Analysis Method: {metadata['analysis_method']}\n")
        f.write(f"Analysis Time: {metadata['analysis_time_seconds']:.2f} seconds\n")
        f.write(f"Optimization Version: {metadata['optimization_version']}\n\n")

        # Write executive summary section
        f.write("EXECUTIVE SUMMARY\n")
        f.write("-" * 30 + "\n")

        summary = report_data["executive_summary"]
        f.write(
            f"Analysis Status: {'Success' if summary['analysis_success'] else 'Failed'}\n"
        )
        f.write(f"Comments Processed: {summary['total_comments_processed']}\n")
        f.write(f"Clusters Discovered: {summary['clusters_discovered']}\n")
        f.write(f"Noise Ratio: {summary['noise_ratio']}\n")
        f.write(f"Successfully Categorized: {summary['successfully_categorized']}\n")
        f.write(f"Processing Efficiency: {summary['processing_efficiency']}\n\n")

        # Write post information if available
        if "post_info" in report_data and report_data["post_info"]:
            f.write("POST INFORMATION\n")
            f.write("-" * 30 + "\n")
            post_info = report_data["post_info"]
            f.write(f"Title: {post_info.get('title', 'N/A')}\n")
            f.write(f"Subreddit: r/{post_info.get('subreddit', 'N/A')}\n")
            f.write(f"Score: {post_info.get('score', 0):,}\n")
            f.write(f"Upvote Ratio: {post_info.get('upvote_ratio', 0):.1%}\n")
            f.write(f"Comments: {post_info.get('num_comments', 0):,}\n\n")

        # Write detailed cluster statistics
        f.write("CLUSTER STATISTICS - DETAILED\n")
        f.write("-" * 30 + "\n")
        stats = report_data["cluster_statistics"]
        f.write(f"Total Clusters: {stats['total_clusters']}\n")
        f.write(f"Average Cluster Size: {stats['avg_cluster_size']}\n")
        f.write(f"Largest Cluster: {stats['largest_cluster_size']} comments\n")
        f.write(f"Smallest Cluster: {stats['smallest_cluster_size']} comments\n")
        f.write(f"Median Cluster Size: {stats['median_cluster_size']}\n")
        if "cluster_size_distribution" in stats:
            dist = stats["cluster_size_distribution"]
            f.write(f"Small Clusters (≤5): {dist['small_clusters']}\n")
            f.write(f"Medium Clusters (6-15): {dist['medium_clusters']}\n")
            f.write(f"Large Clusters (>15): {dist['large_clusters']}\n")
        f.write("\n")

        # Write detailed analysis of top clusters
        f.write("🏆 TOP CLUSTERS DETAILED ANALYSIS\n")
        f.write("-" * 50 + "\n")
        for cluster in report_data["top_clusters"]:
            f.write(
                f"\n#{cluster['rank']}. Cluster {cluster['cluster_id']} ({cluster['size']} comments, {cluster['relative_size']} of total)\n"
            )
            f.write(f"   Summary: {cluster['summary']}\n")
            if cluster["keywords"]:
                f.write(
                    f"   Keywords ({cluster['keyword_count']}): {', '.join(cluster['keywords'])}\n"
                )
            f.write(f"   Avg Length: {cluster['avg_comment_length']:.0f} characters\n")
            f.write("   Sample Comments:\n")
            for i, comment in enumerate(cluster["sample_comments"], 1):
                f.write(f"     {i}. {comment}\n")

        # Write optimization insights
        if "optimization_insights" in report_data:
            f.write(f"\n\nOPTIMIZATION INSIGHTS\n")
            f.write("-" * 30 + "\n")
            for insight in report_data["optimization_insights"]:
                f.write(f"• {insight}\n")

        # Write methodology section
        f.write(f"\n\nMETHODOLOGY\n")
        f.write("-" * 20 + "\n")
        method = report_data["methodology"]
        f.write("Preprocessing Steps:\n")
        for step in method["preprocessing"]:
            f.write(f"  - {step}\n")
        f.write(f"\nEmbedding Model: {method['embedding']}\n")
        f.write(f"Clustering Algorithm: {method['clustering']['algorithm']}\n")
        f.write("Clustering Parameters (Optimized):\n")
        for param, value in method["clustering"]["parameters"].items():
            f.write(f"  - {param}: {value}\n")
        f.write(f"Optimization: {method['clustering']['optimization']}\n")


def signal_handler(signum, frame):
    """
    Handle system signals for graceful shutdown.

    Args:
        signum: Signal number
        frame: Current stack frame
    """
    print(f"\n🛑 Received signal {signum}, shutting down...")
    sys.exit(0)


def main():
    """
    Main entry point for the Reddit analysis test.

    Sets up signal handlers and runs the complete test suite.
    """
    print("🚀 Traind ML Service - Optimized Reddit Analysis")
    print("=" * 60)

    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        # Execute the main test function
        test_reddit_analysis()

    except KeyboardInterrupt:
        print("\n🛑 Service interrupted by user")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")


if __name__ == "__main__":
    main()
