import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Toast from '../ui/Toast';
import './Layout.css';

import { useApp } from '../../context/AppContext';

export default function Layout({ children }) {
  const location = useLocation();
  const { state } = useApp();

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <TopBar />
        <main className="layout-content">
          <div key={`${location.pathname}-${state.user.mode}`} className="page-enter">
            {children}
          </div>
        </main>
      </div>
      <Toast />
    </div>
  );
}
