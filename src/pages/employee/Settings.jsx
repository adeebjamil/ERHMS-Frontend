import { FaCog, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import EmployeeLayout from '../../layouts/EmployeeLayout';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <EmployeeLayout>
      <div className="space-y-8">
        <div className="flex items-center mb-6">
          <FaCog className="mr-2 text-indigo-600 text-xl" />
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Settings</h2>
        </div>
        
        <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>
            <h3 className="text-lg font-medium">Appearance</h3>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-md font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Dark Mode
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Toggle between light and dark theme
                </p>
              </div>
              
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center w-12 h-6 rounded-full ${
                  isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'
                } focus:outline-none transition-colors duration-200`}
                aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-200 ${
                    isDarkMode ? 'translate-x-2.5' : '-translate-x-2.5'
                  }`}
                />
                {isDarkMode ? (
                  <FaMoon className="text-white ml-1 text-xs" />
                ) : (
                  <FaSun className="text-yellow-500 mr-1 text-xs" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default Settings;