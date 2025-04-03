
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ChartBarIcon, 
  PlusIcon, 
  HomeIcon, 
  DownloadIcon 
} from "lucide-react";
import { exportAsCSV } from "@/utils/expenseUtils";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed w-full z-20 top-0 left-0">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <Link to="/" className="flex items-center">
          <span className="self-center text-xl font-semibold whitespace-nowrap text-primary">
            Personal Expense Tracker
          </span>
        </Link>
        
        <div className="flex md:order-2">
          <Button
            variant="outline" 
            className="mr-2 hidden md:inline-flex"
            onClick={() => exportAsCSV()}
          >
            <DownloadIcon className="h-4 w-4 mr-2" /> Export
          </Button>
          
          <Link to="/expense/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </Link>
          
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center p-2 text-sm rounded-lg md:hidden ml-1 text-gray-500"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        <div className={`justify-between items-center w-full md:flex md:w-auto md:order-1 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <ul className="flex flex-col p-4 mt-4 bg-gray-50 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white">
            <li>
              <Link 
                to="/" 
                className={`block py-2 pr-4 pl-3 rounded ${isActive('/') ? 'text-white bg-primary md:bg-transparent md:text-primary' : 'text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-primary'} md:p-0`}
              >
                <div className="flex items-center">
                  <HomeIcon className="h-4 w-4 mr-1" />
                  Dashboard
                </div>
              </Link>
            </li>
            <li>
              <Link 
                to="/reports" 
                className={`block py-2 pr-4 pl-3 rounded ${isActive('/reports') ? 'text-white bg-primary md:bg-transparent md:text-primary' : 'text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-primary'} md:p-0`}
              >
                <div className="flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Reports
                </div>
              </Link>
            </li>
            <li className="md:hidden">
              <button 
                onClick={() => exportAsCSV()} 
                className="block py-2 pr-4 pl-3 text-gray-700 rounded hover:bg-gray-100 w-full text-left"
              >
                <div className="flex items-center">
                  <DownloadIcon className="h-4 w-4 mr-1" />
                  Export Data
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
