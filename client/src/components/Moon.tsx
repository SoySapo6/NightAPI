import { FC } from 'react';

const Moon: FC = () => {
  return (
    <div className="fixed top-14 right-10 md:top-20 md:right-20 z-0 animate-float">
      <div className="w-14 h-14 md:w-24 md:h-24 bg-yellow-100 rounded-full shadow-lg moon"></div>
    </div>
  );
};

export default Moon;
