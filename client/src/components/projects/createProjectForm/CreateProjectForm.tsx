"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { ProjectService } from "../../../services/projects/project.service";
import {
  CreateProjectInput,
  CURRENCIES,
  Currency,
  PROJECT_CATEGORIES,
  ProjectCategory,
} from "../../../types/project.type";
import { Icon } from "../../icons/Icon";
import styles from "./CreateProjectForm.module.css";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectForm({ onClose, onSuccess }: Props) {
  const [projectData, setProjectData] = useState<CreateProjectInput>({
    name: "",
    type: "PERSONAL",
    price: 0,
    currency: "USD",
    deadline: "",
  });

  const [isOpenTypeOptions, setIsOpenTypeOptions] = useState(false);
  const [isOpenCurrencyOptions, setIsOpenCurrencyOptions] = useState(false);

  const handleOptionClick = (category: ProjectCategory) => {
    setProjectData((prev) => ({ ...prev, type: category }));
    setIsOpenTypeOptions(false);
  };

  const handleCurrencyClick = (currency: Currency) => {
    setProjectData((prev) => ({ ...prev, currency }));
    setIsOpenCurrencyOptions(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await ProjectService.createProject(projectData);
      onSuccess(); // Sayfayı yenilemek için
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.content}>
        <div className={styles.modalHeader}>
          <h3>New Project</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Project Name */}
          <div className={styles.formItem}>
            <label className={styles.label}>Project Name</label>
            <input
              className={styles.input}
              value={projectData.name}
              onChange={handleChange}
              name="name"
              type="text"
              placeholder="e.g. Portfolio Website"
              required
            />
          </div>

          {/* Type Selection */}
          <div className={styles.formItem}>
            <label className={styles.label}>Category</label>
            <div
              className={`${styles.selectHeader} ${
                isOpenTypeOptions ? styles.activeHeader : ""
              }`}
              onClick={() => setIsOpenTypeOptions(!isOpenTypeOptions)}
            >
              <span>{projectData.type}</span>
              <Icon name="chevronDown" />
            </div>
            <div
              className={`${styles.optionsDropdown} ${
                isOpenTypeOptions ? styles.open : ""
              }`}
            >
              {PROJECT_CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className={styles.optionItem}
                  onClick={() => handleOptionClick(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Conditional Price & Currency */}
          {projectData.type === "PAID" && (
            <div className={styles.priceRow}>
              <div className={styles.formItem} style={{ flex: 2 }}>
                <label className={styles.label}>Budget</label>
                <input
                  className={styles.input}
                  value={projectData.price}
                  onChange={handleChange}
                  name="price"
                  type="number"
                  placeholder="0.00"
                  min="1"
                  required
                />
              </div>
              <div className={styles.formItem} style={{ flex: 1 }}>
                <label className={styles.label}>Currency</label>
                <div
                  className={`${styles.selectHeader} ${
                    isOpenCurrencyOptions ? styles.activeHeader : ""
                  }`}
                  onClick={() =>
                    setIsOpenCurrencyOptions(!isOpenCurrencyOptions)
                  }
                >
                  <span>{projectData.currency}</span>
                  <Icon name="chevronDown" />
                </div>
                <div
                  className={`${styles.optionsDropdown} ${
                    isOpenCurrencyOptions ? styles.open : ""
                  }`}
                >
                  {CURRENCIES.map((cur) => (
                    <div
                      key={cur}
                      className={styles.optionItem}
                      onClick={() => handleCurrencyClick(cur)}
                    >
                      {cur}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={styles.formItem}>
            <label className={styles.label}>Deadline</label>
            <input
              className={styles.input}
              value={projectData.deadline as string}
              onChange={handleChange}
              name="deadline"
              type="date"
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
}
