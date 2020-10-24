import React from 'react';
import { createUseStyles } from 'react-jss';

// From https://projects.lukehaas.me/css-loaders/
const useStyles = createUseStyles({
  'loader': {
    'fontSize': '10px',
    'margin': '50px auto',
    'textIndent': '-9999em',
    'width': '11em',
    'height': '11em',
    'borderRadius': '50%',
    'background':
      'linear-gradient(to right, rgba(101,69,125,1) 0%, rgba(190,36,51,1) 40%, rgba(190,36,51,1) 50%, rgba(255, 255, 255, 0) 50%)',
    'position': 'relative',
    'animation': '$load3 1.4s infinite linear',
    'transform': 'translateZ(0)',
    '&:before': {
      width: '50%',
      height: '50%',
      background:
        'linear-gradient(to bottom, rgba(14,82,198,1) 10%, rgba(101,69,125,1) 90%, rgba(101,69,125,1) 100%)',
      borderRadius: '100% 0 0 0',
      position: 'absolute',
      top: 0,
      left: 0,
      content: "''",
    },
    '&:after': {
      background: '#fff',
      width: '75%',
      height: '75%',
      borderRadius: '50%',
      content: "''",
      margin: 'auto',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
  },
  '@keyframes load3': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
});

const Spinner = () => {
  const classes = useStyles();

  return <div className={classes.loader}>Loading...</div>;
};

export default Spinner;
