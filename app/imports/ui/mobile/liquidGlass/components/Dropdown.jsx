import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  DropdownContainer,
  DropdownTrigger,
  TriggerBackground,
  TriggerBlur,
  TriggerGlass,
  TriggerContent,
  TriggerText,
  TriggerIcon,
  DropdownMenu,
  MenuBackground,
  MenuBlur,
  MenuGlass,
  MenuList,
  MenuItem,
  MenuItemContent,
  MenuItemIcon,
  MenuItemText,
  MenuItemCheck,
  SearchInput,
  EmptyState,
  LoadingState,
  Divider,
} from "../styles/Dropdown";

/**
 * LiquidGlass Dropdown/Select component with glass morphism effect
 */
function LiquidGlassDropdown({
  options = [],
  value = null,
  placeholder = "Select an option...",
  searchable = false,
  multiple = false,
  disabled = false,
  loading = false,
  clearable = false,
  maxHeight = "300px",
  position = "bottom",
  width = "200px",
  onChange,
  onSearch,
  onOpen,
  onClose,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedValues, setSelectedValues] = useState(
    multiple ? (Array.isArray(value) ? value : []) : value,
  );

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);

  // Filter options based on search term
  const filteredOptions =
    searchable && searchTerm
      ? options.filter(
          (option) => option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.value?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : options;

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }

    return undefined; // No cleanup needed when not open
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
          break;
        case "Enter":
          event.preventDefault();
          if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleOptionSelect(filteredOptions[focusedIndex]);
          }
          break;
        case "Tab":
          handleClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }

    return undefined; // No cleanup needed when not open
  }, [isOpen, focusedIndex, filteredOptions]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100); // eslint-disable-line no-unused-expressions
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (disabled) return;

    if (!isOpen) {
      setIsOpen(true);
      setFocusedIndex(-1);
      onOpen?.(); // eslint-disable-line no-unused-expressions
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
    onClose?.(); // eslint-disable-line no-unused-expressions
  };

  const handleOptionSelect = (option) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(selectedValues) ? selectedValues : [];
      const isSelected = currentValues.some((v) => v === option.value);

      let newValues;
      if (isSelected) {
        newValues = currentValues.filter((v) => v !== option.value);
      } else {
        newValues = [...currentValues, option.value];
      }

      setSelectedValues(newValues);
      onChange?.(newValues, option); // eslint-disable-line no-unused-expressions
    } else {
      setSelectedValues(option.value);
      onChange?.(option.value, option); // eslint-disable-line no-unused-expressions
      handleClose();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    const newValue = multiple ? [] : null;
    setSelectedValues(newValue);
    onChange?.(newValue, null); // eslint-disable-line no-unused-expressions
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch?.(term); // eslint-disable-line no-unused-expressions
    setFocusedIndex(-1);
  };

  const isSelected = (option) => {
    if (multiple) {
      return (
        Array.isArray(selectedValues) && selectedValues.includes(option.value)
      );
    }
    return selectedValues === option.value;
  };

  const getDisplayText = () => {
    if (multiple) {
      const selected = Array.isArray(selectedValues) ? selectedValues : [];
      if (selected.length === 0) return placeholder;
      if (selected.length === 1) {
        const option = options.find((opt) => opt.value === selected[0]);
        return option?.label || selected[0];
      }
      return `${selected.length} items selected`;
    }

    if (selectedValues === null || selectedValues === undefined) {
      return placeholder;
    }

    const option = options.find((opt) => opt.value === selectedValues);
    return option?.label || selectedValues;
  };

  const hasValue = multiple
    ? Array.isArray(selectedValues) && selectedValues.length > 0
    : selectedValues !== null && selectedValues !== undefined;

  return (
    <DropdownContainer
      ref={dropdownRef}
      className={className}
      width={width}
      {...props}
    >
      <DropdownTrigger
        onClick={handleToggle}
        $disabled={disabled}
        $isOpen={isOpen}
        $hasValue={hasValue}
      >
        <TriggerBackground>
          <TriggerBlur />
          <TriggerGlass />
        </TriggerBackground>

        <TriggerContent>
          <TriggerText $hasValue={hasValue}>{getDisplayText()}</TriggerText>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {clearable && hasValue && (
              <TriggerIcon onClick={handleClear} $type="clear">
                ✕
              </TriggerIcon>
            )}
            <TriggerIcon $isOpen={isOpen} $type="chevron">
              ▼
            </TriggerIcon>
          </div>
        </TriggerContent>
      </DropdownTrigger>

      <DropdownMenu
        ref={menuRef}
        $isOpen={isOpen}
        $position={position}
        $maxHeight={maxHeight}
      >
        <MenuBackground>
          <MenuBlur />
          <MenuGlass />
        </MenuBackground>

        {searchable && (
          <>
            <SearchInput
              ref={searchInputRef}
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Divider />
          </>
        )}

        <MenuList>
          {loading ? (
            <LoadingState>
              <div className="spinner"></div>
              Loading options...
            </LoadingState>
          ) : filteredOptions.length === 0 ? (
            <EmptyState>
              {searchTerm ? "No matching options" : "No options available"}
            </EmptyState>
          ) : (
            filteredOptions.map((option, index) => (
              <MenuItem
                key={option.value || index}
                onClick={() => handleOptionSelect(option)}
                $disabled={option.disabled}
                $isSelected={isSelected(option)}
                $isFocused={index === focusedIndex}
              >
                <MenuItemContent>
                  {option.icon && <MenuItemIcon>{option.icon}</MenuItemIcon>}
                  <MenuItemText>{option.label || option.value}</MenuItemText>
                  {(multiple || isSelected(option)) && (
                    <MenuItemCheck $isVisible={isSelected(option)}>
                      ✓
                    </MenuItemCheck>
                  )}
                </MenuItemContent>
              </MenuItem>
            ))
          )}
        </MenuList>
      </DropdownMenu>
    </DropdownContainer>
  );
}

LiquidGlassDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string,
      icon: PropTypes.node,
      disabled: PropTypes.bool,
    }),
  ),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ),
  ]),
  placeholder: PropTypes.string,
  searchable: PropTypes.bool,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  clearable: PropTypes.bool,
  maxHeight: PropTypes.string,
  position: PropTypes.oneOf(["top", "bottom"]),
  width: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default LiquidGlassDropdown;
