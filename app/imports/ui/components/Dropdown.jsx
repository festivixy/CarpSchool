import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DropdownContainer,
  DropdownLabel,
  DropdownTrigger,
  TriggerContent,
  TriggerValue,
  TriggerPlaceholder,
  TriggerIcon,
  DropdownMenu,
  MenuItem,
  MenuItemText,
  MenuItemIcon,
  SearchInput,
  NoResults,
  RequiredIndicator,
  ErrorMessage,
  HelperText,
} from "../styles/Dropdown";

/**
 * Base Dropdown component for use across desktop and mobile platforms
 * Provides comprehensive selection functionality with search and accessibility
 */
const Dropdown = ({
  options = [],
  value,
  defaultValue,
  placeholder = "Select an option...",
  label,
  required = false,
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search...",
  clearable = false,
  multiple = false,
  size = "medium",
  variant = "default",
  error,
  helperText,
  maxHeight = "200px",
  onChange,
  onOpen,
  onClose,
  onSearch,
  className,
  id,
  name,
  "aria-describedby": ariaDescribedBy,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);

  // Use controlled or uncontrolled pattern
  const selectedValue = value !== undefined ? value : internalValue;
  const isControlled = value !== undefined;

  // Generate unique IDs for accessibility
  const dropdownId = id || `dropdown-${Math.random().toString(36).substr(2, 9)}`;
  const menuId = `${dropdownId}-menu`;
  const triggerId = `${dropdownId}-trigger`;
  const errorId = error ? `${dropdownId}-error` : undefined;
  const helperId = helperText ? `${dropdownId}-helper` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(" ");

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.searchText && option.searchText.toLowerCase().includes(searchTerm.toLowerCase())))
    : options;

  // Get display value
  const getDisplayValue = () => {
    if (multiple && Array.isArray(selectedValue)) {
      if (selectedValue.length === 0) return null;
      if (selectedValue.length === 1) {
        const option = options.find(opt => opt.value === selectedValue[0]);
        return option ? option.label : selectedValue[0];
      }
      return `${selectedValue.length} selected`;
    }

    const option = options.find(opt => opt.value === selectedValue);
    return option ? option.label : selectedValue;
  };

  const displayValue = getDisplayValue();

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          closeDropdown();
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
          break;
        case "Enter":
          event.preventDefault();
          if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleSelect(filteredOptions[focusedIndex]);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, focusedIndex, filteredOptions]);

  const openDropdown = () => {
    if (disabled) return;

    setIsOpen(true);
    setFocusedIndex(-1);
    if (onOpen) onOpen();

    // Focus search input if searchable
    if (searchable) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
    if (onClose) onClose();

    // Return focus to trigger
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  const handleSelect = (option) => {
    let newValue;

    if (multiple) {
      const currentValues = Array.isArray(selectedValue) ? selectedValue : [];
      if (currentValues.includes(option.value)) {
        newValue = currentValues.filter(v => v !== option.value);
      } else {
        newValue = [...currentValues, option.value];
      }
    } else {
      newValue = option.value;
      closeDropdown();
    }

    if (!isControlled) {
      setInternalValue(newValue);
    }

    if (onChange) {
      onChange(newValue, option);
    }
  };

  const handleClear = (event) => {
    event.stopPropagation();
    const newValue = multiple ? [] : null;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    setFocusedIndex(-1);

    if (onSearch) {
      onSearch(term);
    }
  };

  return (
    <DropdownContainer ref={dropdownRef} className={className} hasError={!!error}>
      {label && (
        <DropdownLabel htmlFor={triggerId} required={required} disabled={disabled}>
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </DropdownLabel>
      )}

      <DropdownTrigger
        ref={triggerRef}
        id={triggerId}
        onClick={openDropdown}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDropdown();
          }
        }}
        size={size}
        variant={variant}
        hasError={!!error}
        isOpen={isOpen}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-owns={menuId}
        aria-describedby={describedBy || undefined}
        aria-invalid={!!error}
        {...props}
      >
        <TriggerContent>
          {displayValue ? (
            <TriggerValue>{displayValue}</TriggerValue>
          ) : (
            <TriggerPlaceholder>{placeholder}</TriggerPlaceholder>
          )}
        </TriggerContent>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {clearable && displayValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                color: "#8E8E93",
              }}
              aria-label="Clear selection"
            >
              ×
            </button>
          )}

          <TriggerIcon isOpen={isOpen}>
            ▼
          </TriggerIcon>
        </div>
      </DropdownTrigger>

      {isOpen && (
        <DropdownMenu
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-multiselectable={multiple}
          maxHeight={maxHeight}
        >
          {searchable && (
            <SearchInput
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {filteredOptions.length === 0 ? (
            <NoResults>
              {searchTerm ? `No results for "${searchTerm}"` : "No options available"}
            </NoResults>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = multiple
                ? Array.isArray(selectedValue) && selectedValue.includes(option.value)
                : selectedValue === option.value;
              const isFocused = index === focusedIndex;

              return (
                <MenuItem
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  isSelected={isSelected}
                  isFocused={isFocused}
                  disabled={option.disabled}
                  role="option"
                  aria-selected={isSelected}
                >
                  {option.icon && (
                    <MenuItemIcon>{option.icon}</MenuItemIcon>
                  )}
                  <MenuItemText>{option.label}</MenuItemText>
                  {multiple && isSelected && (
                    <MenuItemIcon>✓</MenuItemIcon>
                  )}
                </MenuItem>
              );
            })
          )}
        </DropdownMenu>
      )}

      {(error || helperText) && (
        <div>
          {error && (
            <ErrorMessage id={errorId} role="alert">
              {error}
            </ErrorMessage>
          )}

          {helperText && !error && (
            <HelperText id={helperId}>
              {helperText}
            </HelperText>
          )}
        </div>
      )}
    </DropdownContainer>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      disabled: PropTypes.bool,
      searchText: PropTypes.string,
    }),
  ).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  ]),
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  ]),
  placeholder: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  searchable: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  clearable: PropTypes.bool,
  multiple: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["default", "outline", "filled"]),
  error: PropTypes.string,
  helperText: PropTypes.string,
  maxHeight: PropTypes.string,
  onChange: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  onSearch: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  "aria-describedby": PropTypes.string,
};

export default Dropdown;
