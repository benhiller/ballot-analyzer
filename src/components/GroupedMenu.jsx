import React, { Fragment } from 'react';
import css from 'styled-jsx/css';

const styles = css`
  .divider {
    border-top: 1px solid #e9ecef;
    height: 0;
    margin: 8px 0;
  }

  .groupHeader {
    font-size: 14px;
    color: #888;
    padding: 3px 15px;
  }
`;

const GroupedMenu = ({
  items,
  highlightedIndex,
  getItemProps,
  highlightedClass,
}) => {
  if (items.length === 0) {
    return null;
  }

  const groupedItems = items.reduce((acc, item) => {
    if (acc[item.groupBy]) {
      acc[item.groupBy].push(item);
    } else {
      acc[item.groupBy] = [item];
    }

    return acc;
  }, {});

  let index = 0;
  return (
    <>
      <style jsx>{styles}</style>
      {Object.keys(groupedItems).map((group) => (
        <Fragment key={group}>
          {index !== 0 && <div className="divider" />}
          <div className="groupHeader">{group}</div>
          {groupedItems[group].map((item) => {
            const row = (
              <li
                className={highlightedIndex === index ? highlightedClass : null}
                key={item.id}
                {...getItemProps({ item, index })}
              >
                {item.menuLabel}
              </li>
            );
            index += 1;
            return row;
          })}
        </Fragment>
      ))}
    </>
  );
};

export default GroupedMenu;
