import React, {ReactNode} from 'react';
import lightLogo from '../assets/westep-logo.png';
import darkLogo from '../assets/westep-logo-dark.png';

const AuthLayout: React.FC<{ children: ReactNode }> = ({children}) => {
    return (
        <div className='auth-back'>
            <div className='auth-glass'>
                <div className='w-full md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto'>
                    <div className='mb-8 flex justify-center'>
                        <div className="rounded-2xl bg-white/90 px-5 py-3 shadow-lg backdrop-blur-sm dark:bg-gray-900/80">
                            <img src={darkLogo} alt="Westep logo" className="block h-14 w-auto dark:hidden"/>
                            <img src={lightLogo} alt="Westep logo" className="hidden h-14 w-auto dark:block"/>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
