import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <div className="bg-gray-800 text-white h-screen w-64 fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-2xl font-bold">MarsTrack</h1>
      </div>
      
      <nav className="mt-8">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `block py-2 px-4 ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
              end
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/habits" 
              className={({ isActive }) => 
                `block py-2 px-4 ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              Tracking d'Habitudes
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/todo" 
              className={({ isActive }) => 
                `block py-2 px-4 ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              Todo Global
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/journal" 
              className={({ isActive }) => 
                `block py-2 px-4 ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              Journal
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/planning" 
              className={({ isActive }) => 
                `block py-2 px-4 ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              Planning
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;