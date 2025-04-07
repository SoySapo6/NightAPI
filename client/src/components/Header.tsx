import { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="pt-8 pb-6 px-4 relative z-10">
      <div className="container mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-2 font-heading">
          <span className="text-cyan-500">Night</span>API
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl text-center">
          Powerful, easy-to-use APIs for your next project under the night sky
        </p>
      </div>
    </header>
  );
};

export default Header;
