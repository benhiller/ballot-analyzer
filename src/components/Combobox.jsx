import React, { useState } from 'react';
import { useCombobox } from 'downshift';
import css from 'styled-jsx/css';

const items = ['Apple', 'Banana', 'Carrot'];

const styles = css`
  .menu {
    position: relative;
    width: 450px;
    border: 1px solid #888;
  }
`;

const Combobox = () => {
  const [inputItems, setInputItems] = useState(items);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    openMenu,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        items.filter((item) =>
          item.toLowerCase().startsWith(inputValue.toLowerCase()),
        ),
      );
    },
  });
  console.log(isOpen);
  return (
    <div>
      <style jsx>{styles}</style>
      <label {...getLabelProps()}>Choose an element:</label>
      <div {...getComboboxProps()}>
        <input {...getInputProps()} onFocus={() => openMenu()} />
        <button
          type="button"
          {...getToggleButtonProps()}
          aria-label="toggle menu"
        >
          &#8595;
        </button>
      </div>
      <ul {...getMenuProps()} className="menu">
        {isOpen &&
          inputItems.map((item, index) => (
            <li
              style={
                highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}
              }
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Combobox;
