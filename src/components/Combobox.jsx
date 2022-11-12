import React, { useEffect, useState } from 'react';
import { useCombobox } from 'downshift';
import classNames from 'classnames';
import css from 'styled-jsx/css';
import deburr from 'lodash.deburr';

import GroupedMenu from 'src/components/GroupedMenu';

const styles = css`
  .root {
    position: relative;
    margin-bottom: 10px;
    width: 100%;
  }
  @media (min-width: 1024px) {
    .root {
      width: inherit;
      margin-left: 10px;
      flex: 0;
    }
  }

  label {
    display: block;
    font-size: 16px;
    margin-right: 5px;
  }
  @media (min-width: 1024px) {
    label {
      display: inline-block;
      padding-bottom: 2px;
    }
  }

  .input {
    position: relative;
    display: inline-block;
    width: 100%;
  }
  @media (min-width: 1024px) {
    .input {
      width: 275px;
    }
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
    color: #000;
    opacity: 0.5;
  }

  .clear:hover {
    opacity: 0.75;
  }

  .menu {
    display: none;
    position: absolute;
    max-height: 300px;
    overflow: scroll;
    left: 0;
    background-color: white;
    z-index: 100;
    width: 100%;
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 8px 0;
    margin-top: 2px;
  }
  @media (min-width: 1024px) {
    .menu {
      width: 450px;
    }
  }

  .openMenu {
    display: block;
  }

  .menu :global(li) {
    padding: 4px 25px;
  }

  .menu :global(li.selectedRow) {
    background-color: #007bff;
    color: white;
  }

  .emptyRow {
    color: #888;
  }
`;

const isMatch = (item, filterBy, query) => {
  const fields = filterBy || ['label'];
  const processString = (str) => deburr(str.toLowerCase());
  return fields.some(
    (field) => processString(item[field]).indexOf(processString(query)) !== -1,
  );
};

const Combobox = ({
  id,
  label,
  options,
  grouped,
  selected,
  placeholder,
  onChange,
  filterBy,
}) => {
  const [inputItems, setInputItems] = useState(options);
  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getItemProps,
    getComboboxProps,
    highlightedIndex,
    selectedItem,
    inputValue,
    setHighlightedIndex,
    openMenu,
    closeMenu,
    selectItem,
  } = useCombobox({
    id,
    items: inputItems,
    itemToString: (item) => {
      if (!item) {
        return '';
      }
      if (
        item.label.toLowerCase() == 'no' ||
        item.label.toLowerCase() == 'yes'
      ) {
        return `${item.groupBy}: ${item.label}`;
      }
      return item.label;
    },
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        inputItems.filter((item) => isMatch(item, filterBy, inputValue)),
      );
    },
    onSelectedItemChange: ({ selectedItem }) => {
      closeMenu();
      onChange(selectedItem);
    },
    selectedItem: selected || null,
    onStateChange: (change) => {
      if (change.type === useCombobox.stateChangeTypes.InputBlur) {
        const validItem = inputItems.find((item) => item.label === inputValue);
        if (validItem) {
          if (selectedItem?.id !== validItem.id) {
            selectItem(validItem);
          }
        } else {
          selectItem(null);
        }
      }
    },
  });

  // Update inputItems when options changes
  useEffect(() => {
    setInputItems(
      options.filter((item) => isMatch(item, filterBy, inputValue)),
    );
  }, [options, filterBy, inputValue]);

  useEffect(() => {
    if (isOpen && inputItems.length === 1) {
      setHighlightedIndex(0);
    }
  }, [inputItems, isOpen, setHighlightedIndex]);

  const inputProps = getInputProps({
    onClick: () => {
      openMenu();
    },
  });

  return (
    <div className="root">
      <style jsx>{styles}</style>
      <label {...getLabelProps()}>{label}</label>
      <div
        className={classNames('input', { selected: selectedItem })}
        {...getComboboxProps()}
      >
        <input placeholder={placeholder} spellCheck={false} {...inputProps} />
        {selectedItem && (
          <button
            aria-label="Clear"
            className="clear"
            onClick={() => selectItem(null)}
          >
            <span>{'\u00d7'}</span>
          </button>
        )}
        <ul
          {...getMenuProps()}
          className={classNames('menu', { openMenu: isOpen })}
        >
          {isOpen && (
            <>
              {inputItems.length === 0 && (
                <li className="emptyRow">No matches found.</li>
              )}
              {grouped ? (
                <GroupedMenu
                  items={inputItems}
                  highlightedIndex={highlightedIndex}
                  getItemProps={getItemProps}
                  highlightedClass="selectedRow"
                />
              ) : (
                inputItems.map((item, index) => (
                  <li
                    className={
                      highlightedIndex === index ? 'selectedRow' : null
                    }
                    key={item.id}
                    {...getItemProps({ item, index })}
                  >
                    {item.label}
                  </li>
                ))
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Combobox;
