import React, { useEffect, useState } from 'react';
import { useCombobox } from 'downshift';
import classNames from 'classnames';
import css from 'styled-jsx/css';

// TODO
// - grouping for candidate typeahead
// - highlight?
// - deburr
// - search substr rather than startsWith
// - pagination?
// - blank state
// - clicking item not selecting it

const styles = css`
  .root {
    position: relative;
  }

  label {
    margin-right: 5px;
  }

  .input {
    position: relative;
    display: inline-block;
    width: 300px;
  }

  .input input {
    width: 100%;
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 6px 10px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .input.selected input {
    padding-right: 35px;
  }

  .clear {
    width: 35px;
    position: absolute;
    border: 0;
    background-color: transparent;
    font-size: 24px;
    font-weight: 700;
    right: 0;
    margin-top: 0px;
    color: #000;
    opacity: 0.5;
    line-height: 1.4;
  }

  .clear:hover {
    opacity: 0.75;
  }

  .menu {
    display: none;
    position: absolute;
    right: -150px;
    background-color: white;
    z-index: 100;
    width: 450px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 8px 0;
  }

  .openMenu {
    display: block;
  }

  .menu li {
    padding: 4px 25px;
  }

  .menu li.selectedRow {
    background-color: #007bff;
    color: white;
  }
`;

const Combobox = ({ id, label, options, selected, placeholder, onChange }) => {
  const [inputItems, setInputItems] = useState(options);
  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    selectedItem,
    inputValue,
    setHighlightedIndex,
    openMenu,
    closeMenu,
    selectItem,
    getItemProps,
  } = useCombobox({
    id,
    items: inputItems,
    itemToString: (item) => {
      return item ? item.label : '';
    },
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        options.filter((item) =>
          item.label.toLowerCase().startsWith(inputValue.toLowerCase()),
        ),
      );
    },
    onSelectedItemChange: ({ selectedItem }) => {
      closeMenu();
      onChange(selectedItem);
    },
    selectedItem: selected || null,
  });

  // Update inputItems when options changes
  useEffect(() => {
    setInputItems(
      options.filter((item) =>
        item.label.toLowerCase().startsWith(inputValue.toLowerCase()),
      ),
    );
  }, [options, inputValue]);

  useEffect(() => {
    if (isOpen && inputItems.length === 1) {
      setHighlightedIndex(0);
    }
  }, [inputItems, isOpen, setHighlightedIndex]);

  return (
    <div className="root">
      <style jsx>{styles}</style>
      <label {...getLabelProps()}>{label}</label>
      <div
        className={classNames('input', { selected: selectedItem })}
        {...getComboboxProps()}
      >
        <input
          {...getInputProps()}
          placeholder={placeholder}
          spellCheck={false}
          onFocus={() => openMenu()}
          onBlur={() => {
            if (selectedItem && inputValue !== selectedItem.label) {
              selectItem(null);
            }
          }}
        />
        {selectedItem && (
          <button
            aria-label="Clear"
            className="clear"
            onClick={() => selectItem(null)}
          >
            <span>{'\u00d7'}</span>
          </button>
        )}
      </div>
      <ul
        {...getMenuProps()}
        className={classNames('menu', { openMenu: isOpen })}
      >
        {isOpen &&
          inputItems.map((item, index) => (
            <li
              className={highlightedIndex === index ? 'selectedRow' : null}
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item.label}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Combobox;
