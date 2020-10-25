import React from 'react';
import css from 'styled-jsx/css';

// From https://projects.lukehaas.me/css-loaders/
const styles = css`
  .loader {
    font-size: 10px;
    margin: 50px auto;
    text-indent: -9999em;
    width: 11em;
    height: 11em;
    border-radius: 50%;
    background: linear-gradient(
      to right,
      rgba(101, 69, 125, 1) 0%,
      rgba(190, 36, 51, 1) 40%,
      rgba(190, 36, 51, 1) 50%,
      rgba(255, 255, 255, 0) 50%
    );
    position: relative;
    animation: spinner 1.4s infinite linear;
    transform: translateZ(0);
  }

  .loader:before {
    width: 50%;
    height: 50%;
    background: linear-gradient(
      to bottom,
      rgba(14, 82, 198, 1) 10%,
      rgba(101, 69, 125, 1) 90%,
      rgba(101, 69, 125, 1) 100%
    );
    border-radius: 100% 0 0 0;
    position: absolute;
    top: 0;
    left: 0;
    content: '';
  }
  ,
  .loader:after {
    background: #fff;
    width: 75%;
    height: 75%;
    border-radius: 50%;
    content: '';
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Spinner = () => {
  return (
    <div className="loader">
      <style jsx>{styles}</style>Loading...
    </div>
  );
};

export default Spinner;
