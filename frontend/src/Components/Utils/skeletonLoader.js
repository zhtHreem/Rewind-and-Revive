import React from 'react';

const SkeletonLoader = ({ 
  variant = 'rectangular',
  width = '100%',
  height = '100%',
  animate = true,
  count = 1,
  className = '',
  style = {},
  children
}) => {
  // Base styles for the skeleton
  const baseStyles = {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: variant === 'circular' ? '50%' : '4px',
    display: 'block',
    animation: animate ? 'pulse 1.5s ease-in-out infinite' : 'none',
    ...style
  };

  // Custom animation
  const keyframes = `
    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
      100% {
        opacity: 1;
      }
    }
  `;

  // If children are provided, wrap them in skeleton loading state
  if (children) {
    return (
      <div style={{ position: 'relative' }}>
        <div 
          style={{   ...baseStyles, position: 'absolute',  top: 0,  left: 0, right: 0,  bottom: 0,  zIndex: 1 }}
          className={className}
        />
        <div style={{ visibility: 'hidden' }}>
          {children}
        </div>
      </div>
    );
  }

  // Generate multiple skeleton elements if count > 1
  const skeletons = Array(count).fill(0).map((_, index) => (
    <div
      key={index}
      style={{  ...baseStyles,   width,   height, marginBottom: index < count - 1 ? '0.5rem' : 0 }} className={className} />
  ));

  return (
    <>
      <style>{keyframes}</style>
      {skeletons}
    </>
  );
};

// Preset configurations for common use cases
const Card = ({ height = '500px', width = '100%' }) => (
  <div className="space-y-4">
    <SkeletonLoader height={height} width={width} />
  </div>
);

const Text = ({ lines = 3, width = '100%' }) => (
  <SkeletonLoader  count={lines}  height="20px"   width={width} style={{ marginBottom: '0.5rem' }}/>
);

const Avatar = ({ size = '40px' }) => (
  <SkeletonLoader  variant="circular"  width={size} height={size}/>
);

SkeletonLoader.Card = Card;
SkeletonLoader.Text = Text;
SkeletonLoader.Avatar = Avatar;

export default SkeletonLoader;