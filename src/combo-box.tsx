import { useState, useRef, useEffect } from "react";
import { dropdownData } from "./data";
import "./App.scss";

interface ComboBoxProps {
  label: string;
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export const ComboBox = ({ label, selectedValues, onChange }: ComboBoxProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = dropdownData.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Toggle selection of an option
  const handleSelect = (value: string) => {
    if (!value.trim()) return;
    
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    
    onChange(newValues);
    setInputValue("");
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  // Remove a selected value
  const handleRemoveTag = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => prev >= filteredOptions.length - 1 ? 0 : prev + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => prev <= 0 ? filteredOptions.length - 1 : prev - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setInputValue("");
        break;
      case "Tab":
        if (isOpen) setIsOpen(false);
        break;
      case "Backspace":
        if (inputValue === "" && selectedValues.length > 0) {
          onChange(selectedValues.slice(0, -1));
        }
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && containerRef.current && isOpen) {
      const option = containerRef.current.querySelector(`[data-index="${focusedIndex}"]`);
      option?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, isOpen]);

  return (
    <div 
      className="combobox"
      ref={containerRef}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <label 
        id="combo-label" 
        htmlFor="combobox-input"
        className="label"
      >
        {label}
      </label>

      <div
        className={`tag-input ${isOpen ? "open" : ''}`}
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
        role="combobox"
        aria-controls="dropdown-options"
        aria-labelledby="combo-label"
      >
         {/* Render selected values */}
        {selectedValues.map((value) => {
          const optionLabel = dropdownData.find((item) => item.value === value)?.label;
          return (
            <span
              key={value}
              className="tag"
              role="option"
              aria-selected="true"
              aria-label={`Selected: ${optionLabel}`}
            >
              {optionLabel}
              <button
                onClick={(e) => handleRemoveTag(value, e)}
                className="remove-button"
                aria-label={`Remove ${optionLabel}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRemoveTag(value, e as any);
                  }
                }}
              >
                ×
              </button>
            </span>
          );
        })}

        <input
          id="combobox-input"
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedValues.length === 0 ? "Options" : ""}
          className="input"
          aria-autocomplete="list"
          aria-controls="dropdown-options"
          aria-activedescendant={
            focusedIndex >= 0 ? `option-${filteredOptions[focusedIndex]?.value}` : undefined
          }
          aria-label="Search for options"
          aria-describedby="combo-label"
          tabIndex={0}
        />
        <span>▼</span>
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <ul
          id="dropdown-options"
          className="dropdown"
          role="listbox"
          aria-live="polite"
          aria-multiselectable="true"
          aria-labelledby="combo-label"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <li
                  key={option.value}
                  id={`option-${option.value}`}
                  className={`option ${
                    isSelected ? "selected" : ''
                  } ${
                    focusedIndex === index ? "focused" : ''
                  }`}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={option.label}
                  data-index={index}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelect(option.value);
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(option.value);
                    }
                  }}
                >
                  {option.label}
                </li>
              );
            })
          ) : (
            <li
              className="noOptions"
              role="option"
              aria-selected="false"
              tabIndex={-1}
            >
              No options found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};