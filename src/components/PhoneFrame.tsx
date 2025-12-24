import React, { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* iPhone 15 Frame */}
      <div className="relative w-[390px] h-[844px] rounded-[55px] p-3 shadow-phone" style={{ background: 'linear-gradient(135deg, #000000 0%, #6d3d84 100%)' }}>
        {/* Inner bezel highlight */}
        <div className="absolute inset-0 rounded-[55px] ring-1 ring-white/10" />
        
        {/* Screen */}
        <div className="relative w-full h-full bg-background rounded-[44px] overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[126px] h-[35px] bg-black rounded-full z-50" />
          
          {/* App Content */}
          <div className="h-full w-full overflow-hidden">
            {children}
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-foreground/20 rounded-full z-50" />
        </div>
      </div>
    </div>
  );
};

export default PhoneFrame;
