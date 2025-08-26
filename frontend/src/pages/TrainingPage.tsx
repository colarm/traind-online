/**
 * Training Configuration Page
 * Allows users to configure analysis parameters and start Reddit post analysis
 *
 * Filename: TrainingPage.tsx
 * Author: Haicheng Zhao
 * Date: 2025-08-10
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-20
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import React, { useState, useEffect } from "react";
import useRequireAuth from "../utils/useRequireAuth";
import styles from "./TrainingPage.module.css";
import { saveParameterSet } from "../api/parameterSet";
import { runAnalysis } from "../api/traind";
import { ParamsType } from "../types/taskConfig";
import {
  getDefaultParams as getConfigDefaultParams,
  getDefaultUIConfigs,
} from "../utils/taskConfigHelper";

interface CustomSelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

/**
 * Custom dropdown select component for form inputs
 */
// [AI-GENERATED: Claude, 2025-08-20]
const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.customSelectContainer}>
      <label className={styles.inputLabel}>{label}</label>
      <div className={styles.customSelect}>
        <div
          className={styles.customSelectTrigger}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>
            {options.find((opt) => opt.value === value)?.label || value}
          </span>
          <span
            className={`${styles.customSelectArrow} ${
              isOpen ? styles.open : ""
            }`}
          >
            ▼
          </span>
        </div>
        {isOpen && (
          <div className={styles.customSelectDropdown}>
            {options.map((option) => (
              <div
                key={option.value}
                className={`${styles.customSelectOption} ${
                  value === option.value ? styles.selected : ""
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main training configuration page component
 */
const TrainingPage: React.FC = () => {
  useRequireAuth();
  const [target, setTarget] = useState("");
  const [useCustomParams, setUseCustomParams] = useState(false);

  // [AI-GENERATED: Claude, 2025-08-20]
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    basic_settings: true,
    clustering_parameters: false,
    preprocessing_settings: false,
    model_settings: false,
    summary_settings: false,
    sentiment_analysis: false,
    topic_keywords: false,
    stop_words: false,
  });

  const defaultParams = getConfigDefaultParams("reddit_analysis");
  const uiConfigs = getDefaultUIConfigs("reddit_analysis");

  const [params, setParams] = useState<ParamsType>(defaultParams);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  /**
   * Handle the start training process
   * Saves parameter set and initiates Reddit analysis
   */
  // [AI-GENERATED: Claude, 2025-08-10]
  const handleStartTraining = async () => {
    setLoading(true);
    setResult(null);
    try {
      const currentParams = useCustomParams ? params : getDefaultParams();

      // Save parameter set to database
      const saveRes = await saveParameterSet({
        name: "Reddit Analysis Parameter Set",
        config: currentParams,
      });
      if (!saveRes || !saveRes.id) {
        setResult("Failed to save parameter set: Unknown error");
        setLoading(false);
        return;
      }

      const parameterSetId = saveRes.id;
      let redditId = target;

      // Extract Reddit post ID from URL if provided
      const redditUrlMatch = target.match(
        /reddit\.com\/r\/[^\/]+\/comments\/([a-zA-Z0-9]+)\//
      );
      if (redditUrlMatch && redditUrlMatch[1]) {
        redditId = redditUrlMatch[1];
      }

      // Start the analysis
      const runRes = await runAnalysis(redditId, parameterSetId);
      if (runRes.error) {
        setResult("Analysis failed: " + runRes.error);
      } else {
        setResult(`Task created!`);
      }
    } catch (err: any) {
      setResult("Request error: " + (err?.message || err));
    }
    setLoading(false);
  };

  const getDefaultParams = () => {
    return useCustomParams ? params : defaultParams;
  };

  const resetToDefaults = () => {
    setParams({ ...defaultParams });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  /**
   * Get parameter constraints for validation
   */
  // [AI-GENERATED: Claude, 2025-08-20]
  const getParameterConstraints = () => {
    return {
      max_comments: { min: 1, max: 10000, step: 1 },
      min_score: { min: -100, max: 100, step: 1 },
      min_cluster_size: { min: 2, max: 1000, step: 1 },
      min_samples: { min: 1, max: 100, step: 1 },
      cluster_selection_epsilon: { min: 0, max: 1, step: 0.01 },
      alpha: { min: 0.1, max: 10, step: 0.1 },
      min_comment_length: { min: 1, max: 1000, step: 1 },
      min_word_count: { min: 1, max: 100, step: 1 },
      batch_size: { min: 1, max: 512, step: 1 },
      top_clusters_display: { min: 1, max: 50, step: 1 },
      keywords_per_cluster: { min: 1, max: 50, step: 1 },
      enhanced_keywords: { min: 1, max: 100, step: 1 },
      sample_comments_per_cluster: { min: 1, max: 20, step: 1 },

      sentence_transformer_model: {
        pattern: /^[a-zA-Z0-9\-_\/]+$/,
        minLength: 3,
        maxLength: 100,
      },

      positive: { minItems: 0, maxItems: 100 },
      negative: { minItems: 0, maxItems: 100 },
      filter_prefixes: { minItems: 0, maxItems: 20 },
      stop_words: { minItems: 0, maxItems: 500 },
      discussion: { minItems: 0, maxItems: 50 },
      experience: { minItems: 0, maxItems: 50 },
      question: { minItems: 0, maxItems: 50 },
      humor: { minItems: 0, maxItems: 50 },
      technical: { minItems: 0, maxItems: 50 },
      social: { minItems: 0, maxItems: 50 },
    };
  };

  /**
   * Validate parameter values against constraints
   */
  // [AI-GENERATED: Claude, 2025-08-20]
  const validateParameterValue = (
    paramKey: string,
    value: any
  ): { isValid: boolean; message?: string } => {
    const constraints = getParameterConstraints();
    const constraint = (constraints as any)[paramKey];

    if (!constraint) {
      return { isValid: true };
    }

    // Validate numeric constraints
    if (typeof value === "number" && constraint.min !== undefined) {
      if (value < constraint.min) {
        return { isValid: false, message: `Minimum is ${constraint.min}` };
      }
      if (constraint.max !== undefined && value > constraint.max) {
        return { isValid: false, message: `Maximum is ${constraint.max}` };
      }
    }

    // Validate string constraints
    if (typeof value === "string" && constraint.pattern) {
      if (!constraint.pattern.test(value)) {
        return { isValid: false, message: "Format is incorrect" };
      }
      if (constraint.minLength && value.length < constraint.minLength) {
        return {
          isValid: false,
          message: `Minimum length is ${constraint.minLength}`,
        };
      }
      if (constraint.maxLength && value.length > constraint.maxLength) {
        return {
          isValid: false,
          message: `Maximum length is ${constraint.maxLength}`,
        };
      }
    }

    // Validate array constraints
    if (Array.isArray(value) && constraint.minItems !== undefined) {
      if (value.length < constraint.minItems) {
        return {
          isValid: false,
          message: `Minimum is ${constraint.minItems}`,
        };
      }
      if (
        constraint.maxItems !== undefined &&
        value.length > constraint.maxItems
      ) {
        return {
          isValid: false,
          message: `Maximum is ${constraint.maxItems}`,
        };
      }
    }

    return { isValid: true };
  };

  /**
   * Update parameter value with validation
   */
  // [AI-GENERATED: Claude, 2025-08-20]
  const updateParam = (path: string[], value: any) => {
    const paramKey = path[path.length - 1];
    const validation = validateParameterValue(paramKey, value);

    if (!validation.isValid) {
      setValidationErrors((prev) => ({
        ...prev,
        [paramKey]: validation.message || "Invalid value",
      }));
      return;
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[paramKey];
        return newErrors;
      });
    }

    setParams((prev) => {
      const newParams = { ...prev };
      let current = newParams as any;

      // Navigate to the nested property
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;

      return newParams;
    });
  };

  /**
   * Update array parameter from comma-separated string
   */
  // [AI-GENERATED: Claude, 2025-08-20]
  const updateArrayParam = (path: string[], value: string) => {
    const arrayValue = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);

    const paramKey = path[path.length - 1];
    const validation = validateParameterValue(paramKey, arrayValue);

    if (!validation.isValid) {
      setValidationErrors((prev) => ({
        ...prev,
        [paramKey]: validation.message || "Invalid value",
      }));
      return;
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[paramKey];
        return newErrors;
      });
    }

    updateParam(path, arrayValue);
  };

  /**
   * Render a collapsible parameter section
   */
  // [AI-GENERATED: Claude, 2025-08-20]
  const renderParameterSection = (
    sectionKey: string,
    sectionConfig: any,
    sectionData: any
  ) => {
    return (
      <div key={sectionKey} className={styles.sectionContainer}>
        <h4
          className={`${styles.sectionHeader} ${styles.collapsibleHeader}`}
          onClick={() => toggleSection(sectionKey)}
        >
          <span>
            {(uiConfigs.section_labels as any)[sectionKey] || sectionKey}
          </span>
          <span
            className={
              expandedSections[sectionKey] ? styles.expanded : styles.collapsed
            }
          >
            ▼
          </span>
        </h4>
        {expandedSections[sectionKey] && (
          <div className={styles.sectionContent}>
            {Object.entries(sectionData).map(([paramKey, paramValue]) =>
              renderParameterField(
                sectionKey,
                paramKey,
                paramValue,
                sectionData
              )
            )}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render individual parameter input fields based on type
   */
  // [AI-GENERATED: Claude, 2025-08-20]
  const renderParameterField = (
    sectionKey: string,
    paramKey: string,
    paramValue: any,
    sectionData: any
  ) => {
    const fieldLabel = (uiConfigs.field_labels as any)[paramKey] || paramKey;
    const fieldId = `${sectionKey}_${paramKey}`;

    const getParamPath = () => {
      if (sectionKey === "basic_settings") {
        return [paramKey];
      } else {
        const parentKey = getParentParamKey(sectionKey);
        return parentKey ? [parentKey, paramKey] : [paramKey];
      }
    };

    const getParentParamKey = (sectionKey: string): string | null => {
      const mapping: Record<string, string> = {
        clustering_parameters: "hdbscan_params",
        model_settings: "model_params",
        preprocessing_settings: "preprocessing_params",
        summary_settings: "summary_params",
        sentiment_analysis: "sentiment_words",
        topic_keywords: "topic_keywords",
        stop_words: "stop_words",
      };
      return mapping[sectionKey] || null;
    };

    if (typeof paramValue === "boolean") {
      return (
        <label
          key={paramKey}
          className={`${styles.inputLabel} ${styles.checkboxLabel}`}
        >
          <input
            type="checkbox"
            checked={paramValue}
            onChange={(e) => updateParam(getParamPath(), e.target.checked)}
          />
          {fieldLabel}
        </label>
      );
    }

    if (Array.isArray(paramValue)) {
      const placeholder =
        (uiConfigs.text_fields as any)[`${paramKey}_placeholder`] ||
        `Enter ${paramKey} separated by commas`;
      const isLargeArray = paramValue.length > 10;

      return (
        <div key={paramKey}>
          <label className={styles.inputLabel} htmlFor={fieldId}>
            {fieldLabel}
          </label>
          {isLargeArray ? (
            <textarea
              id={fieldId}
              className={styles.trainingInput}
              rows={3}
              value={paramValue.join(", ")}
              placeholder={placeholder}
              onChange={(e) => updateArrayParam(getParamPath(), e.target.value)}
            />
          ) : (
            <input
              id={fieldId}
              type="text"
              className={styles.trainingInput}
              value={paramValue.join(", ")}
              placeholder={placeholder}
              onChange={(e) => updateArrayParam(getParamPath(), e.target.value)}
            />
          )}
        </div>
      );
    }

    if (typeof paramValue === "string") {
      const optionsKey = `${paramKey}_options`;
      if ((uiConfigs as any)[optionsKey]) {
        return (
          <CustomSelect
            key={paramKey}
            label={fieldLabel}
            value={paramValue}
            options={(uiConfigs as any)[optionsKey]}
            onChange={(value) => updateParam(getParamPath(), value)}
          />
        );
      }

      return (
        <div key={paramKey}>
          <label className={styles.inputLabel} htmlFor={fieldId}>
            {fieldLabel}
          </label>
          <input
            id={fieldId}
            type="text"
            className={`${styles.trainingInput} ${
              validationErrors[paramKey] ? styles.inputError : ""
            }`}
            value={paramValue}
            onChange={(e) => updateParam(getParamPath(), e.target.value)}
            onBlur={(e) => {
              const validation = validateParameterValue(
                paramKey,
                e.target.value
              );
              if (!validation.isValid) {
                setValidationErrors((prev) => ({
                  ...prev,
                  [paramKey]: validation.message || "Invalid format",
                }));
              } else {
                setValidationErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors[paramKey];
                  return newErrors;
                });
              }
            }}
            maxLength={(getParameterConstraints() as any)[paramKey]?.maxLength}
          />
          {validationErrors[paramKey] && (
            <div className={styles.errorMessage}>
              {validationErrors[paramKey]}
            </div>
          )}
        </div>
      );
    }

    if (typeof paramValue === "number") {
      const constraints = getParameterConstraints();
      const constraint = (constraints as any)[paramKey];

      const step =
        constraint?.step ||
        (uiConfigs.step_values as any)[paramKey] ||
        (Number.isInteger(paramValue) ? 1 : 0.01);

      const min = constraint?.min;
      const max = constraint?.max;

      return (
        <div key={paramKey}>
          <label className={styles.inputLabel} htmlFor={fieldId}>
            {fieldLabel}
            {min !== undefined && max !== undefined && (
              <span className={styles.rangeHint}>
                {" "}
                ({min} - {max})
              </span>
            )}
          </label>
          <input
            id={fieldId}
            type="number"
            step={step}
            min={min}
            max={max}
            className={`${styles.trainingInput} ${
              validationErrors[paramKey] ? styles.inputError : ""
            }`}
            value={paramValue}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              updateParam(getParamPath(), newValue);
            }}
            onBlur={(e) => {
              const newValue = Number(e.target.value);
              if (min !== undefined && newValue < min) {
                updateParam(getParamPath(), min);
              } else if (max !== undefined && newValue > max) {
                updateParam(getParamPath(), max);
              }
            }}
          />
          {validationErrors[paramKey] && (
            <div className={styles.errorMessage}>
              {validationErrors[paramKey]}
            </div>
          )}
        </div>
      );
    }

    if (typeof paramValue === "object" && paramValue !== null) {
      return (
        <div key={paramKey} className={styles.nestedSection}>
          <h5 className={styles.nestedSectionTitle}>{fieldLabel}</h5>
          {Object.entries(paramValue).map(([nestedKey, nestedValue]) =>
            renderParameterField(paramKey, nestedKey, nestedValue, paramValue)
          )}
        </div>
      );
    }

    return null;
  };

  /**
   * Get organized parameter sections for rendering
   */
  // [AI-GENERATED: Claude, 2025-08-20]
  const getParameterSections = (): Array<{ key: string; data: any }> => {
    const sections: Array<{ key: string; data: any }> = [];

    const parameterMapping = {
      basic_settings: [
        "max_comments",
        "min_score",
        "skip_removed",
        "skip_deleted",
      ],
      clustering_parameters: ["hdbscan_params"],
      model_settings: ["model_params"],
      preprocessing_settings: ["preprocessing_params"],
      summary_settings: ["summary_params"],
      sentiment_analysis: ["sentiment_words"],
      topic_keywords: ["topic_keywords"],
      stop_words: ["stop_words"],
    };

    const skipParams = ["comment_limit", "reddit_fetch_params"];

    // Process mapped sections
    Object.entries(parameterMapping).forEach(([sectionKey, paramKeys]) => {
      const sectionData: any = {};
      let hasData = false;

      paramKeys.forEach((paramKey) => {
        if (params.hasOwnProperty(paramKey) && !skipParams.includes(paramKey)) {
          if (sectionKey === "basic_settings") {
            sectionData[paramKey] = (params as any)[paramKey];
          } else {
            const value = (params as any)[paramKey];
            if (typeof value === "object" && !Array.isArray(value)) {
              Object.assign(sectionData, value);
            } else {
              sectionData[paramKey] = value;
            }
          }
          hasData = true;
        }
      });

      if (hasData) {
        sections.push({
          key: sectionKey,
          data: sectionData,
        });
      }
    });

    // Process unmapped parameters
    Object.entries(params).forEach(([key, value]) => {
      if (skipParams.includes(key)) return;

      const alreadyMapped = Object.values(parameterMapping).some((paramKeys) =>
        paramKeys.includes(key)
      );

      if (!alreadyMapped) {
        const sectionKey = key.replace(/_/g, "_");
        sections.push({
          key: sectionKey,
          data:
            typeof value === "object" && !Array.isArray(value)
              ? value
              : { [key]: value },
        });
      }
    });

    return sections;
  };

  return (
    <div className={styles.trainingPageWrapper}>
      <div className={styles.mainCard}>
        <h2 className={styles.title}>Reddit Analysis</h2>

        <div className={styles.panelRow}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              {uiConfigs.panel_titles.task_configuration}
            </div>

            <label htmlFor="target-input" className={styles.inputLabel}>
              {uiConfigs.input_labels.reddit_target}
            </label>
            <input
              id="target-input"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={uiConfigs.text_fields.target_placeholder}
              className={styles.trainingInput}
            />

            <div className={styles.toggleContainer}>
              <label className={`${styles.inputLabel} ${styles.checkboxLabel}`}>
                <input
                  type="checkbox"
                  checked={useCustomParams}
                  onChange={(e) => setUseCustomParams(e.target.checked)}
                />
                {uiConfigs.button_labels.use_custom_params}
              </label>
            </div>
          </div>

          {useCustomParams && (
            <div className={styles.panel}>
              <div className={styles.panelTitle}>
                {uiConfigs.panel_titles.parameter_configuration}
                <button
                  onClick={resetToDefaults}
                  className={styles.resetBtn}
                  type="button"
                >
                  {uiConfigs.button_labels.reset_to_defaults}
                </button>
              </div>

              <div className={styles.paramInputs}>
                {getParameterSections().map((section) =>
                  renderParameterSection(section.key, {}, section.data)
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.startBtnRow}>
          <button
            onClick={handleStartTraining}
            disabled={loading || !target}
            className={styles.startBtn}
          >
            {loading
              ? uiConfigs.button_labels.creating
              : uiConfigs.button_labels.start_analysis}
          </button>
        </div>

        {result && <div className={styles.resultBox}>{result}</div>}
      </div>
    </div>
  );
};

export default TrainingPage;
