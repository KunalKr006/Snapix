import React from 'react';

/**
 * ScrollAnimation component to easily add AOS animations to elements
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {string} [props.type='fade-up'] - Animation type (fade-up, fade-down, fade-left, fade-right, flip-up, zoom-in, etc.)
 * @param {number} [props.duration=800] - Animation duration in ms
 * @param {number} [props.delay=0] - Animation delay in ms
 * @param {string} [props.easing='ease-in-out'] - Animation easing
 * @param {string} [props.once=false] - Whether to animate only once
 * @param {string} [props.className=''] - Additional CSS classes
 */
const ScrollAnimation = ({
  children,
  type = 'fade-up',
  duration = 800,
  delay = 0,
  easing = 'ease-in-out',
  once = false,
  anchor = null,
  className = '',
  ...rest
}) => {
  return (
    <div
      data-aos={type}
      data-aos-duration={duration}
      data-aos-delay={delay}
      data-aos-easing={easing}
      data-aos-once={once}
      data-aos-anchor={anchor}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation; 