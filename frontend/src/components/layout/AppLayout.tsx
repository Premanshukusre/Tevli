import { Link, useLocation, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useUser, useLogout } from '../../features/auth/queries';
import { useWorkspaces, useCreateWorkspace } from '../../features/workspaces/queries';
import { useProjectsByWorkspace, useCreateProject } from '../../features/projects/queries';
import { Button } from '../ui/Button';
import { getThemeForString } from '../../lib/color';
import { NotificationBell } from '../../features/notifications/components/NotificationBell';
import { CreateWorkspaceModal } from '../../features/workspaces/components/CreateWorkspaceModal';
import { CreateProjectModal } from '../../features/projects/components/CreateProjectModal';
import { HelpDrawer } from './HelpDrawer';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export const AppLayout = () => {
  const { data: user } = useUser();
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspaceId, projectId } = useParams();
  
  const { data: workspaces } = useWorkspaces();
  const activeWorkspace = workspaces?.find(w => w.id === workspaceId) || workspaces?.[0];
  const { data: projects } = useProjectsByWorkspace(activeWorkspace?.id || '');

  const createWorkspaceMutation = useCreateWorkspace();
  const createProjectMutation = useCreateProject();

  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  
  const isWorkspaceModalOpen = searchParams.get('createWorkspace') === 'true';
  const isProjectModalOpen = searchParams.get('createProject') === 'true';

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('tevli_sidebar_width');
    return saved ? parseInt(saved, 10) : 260;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('tevli_sidebar_collapsed') === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = () => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    const ws = (workspaces || []).filter(w => w.name.toLowerCase().includes(q)).map(w => ({ ...w, type: 'Workspace', link: `/workspaces/${w.id}` }));
    const pjs = (projects || []).filter(p => p.name.toLowerCase().includes(q)).map(p => ({ ...p, type: 'Project', link: `/projects/${p.id}` }));
    return [...ws, ...pjs];
  };

  const toggleCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('tevli_sidebar_collapsed', String(newState));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 400) newWidth = 400;
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('tevli_sidebar_width', String(sidebarWidth));
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  const renderSidebarContent = (isMobile = false) => (
    <div className={`py-4 flex flex-col h-full ${sidebarCollapsed && !isMobile ? 'items-center' : ''}`}>
      {/* Collapse Button (Desktop Only) */}
      {!isMobile && (
        <div className="px-3 mb-4 flex justify-end">
          <button 
            onClick={toggleCollapse}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
          </button>
        </div>
      )}

      {/* TEVLI HOME */}
      <div className={`px-3 mb-6 ${sidebarCollapsed && !isMobile ? 'flex justify-center' : ''}`}>
        <Link 
          to="/workspaces" 
          title="Home"
          onClick={() => isMobile && setMobileMenuOpen(false)}
          className={`flex items-center text-sm font-medium rounded-md transition-colors ${sidebarCollapsed && !isMobile ? 'p-2 justify-center' : 'px-3 py-2'} ${location.pathname === '/workspaces' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          <svg className={`text-gray-400 ${sidebarCollapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          {(!sidebarCollapsed || isMobile) && "Home"}
        </Link>
      </div>

      {/* MY WORK */}
      <div className={`px-3 mb-6 ${sidebarCollapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
        {(!sidebarCollapsed || isMobile) && <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">My Work</p>}
        <div className={`space-y-1 ${sidebarCollapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
          <Link to="/my-tasks" title="My Tasks" onClick={() => isMobile && setMobileMenuOpen(false)} className={`flex items-center text-sm font-medium rounded-md transition-colors ${sidebarCollapsed && !isMobile ? 'p-2 justify-center' : 'px-3 py-1.5'} ${location.pathname === '/my-tasks' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <svg className={`text-gray-400 ${sidebarCollapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            {(!sidebarCollapsed || isMobile) && "My Tasks"}
          </Link>
          <Link to="/recent" title="Recent" onClick={() => isMobile && setMobileMenuOpen(false)} className={`flex items-center text-sm font-medium rounded-md transition-colors ${sidebarCollapsed && !isMobile ? 'p-2 justify-center' : 'px-3 py-1.5'} ${location.pathname === '/recent' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <svg className={`text-gray-400 ${sidebarCollapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {(!sidebarCollapsed || isMobile) && "Recent"}
          </Link>
          <Link to="/starred" title="Starred" onClick={() => isMobile && setMobileMenuOpen(false)} className={`flex items-center text-sm font-medium rounded-md transition-colors ${sidebarCollapsed && !isMobile ? 'p-2 justify-center' : 'px-3 py-1.5'} ${location.pathname === '/starred' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <svg className={`text-gray-400 ${sidebarCollapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
            {(!sidebarCollapsed || isMobile) && "Starred"}
          </Link>
        </div>
      </div>

      {/* ACTIVE WORKSPACE */}
      {activeWorkspace && (
        <div className={`px-3 mb-6 ${sidebarCollapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
          {(!sidebarCollapsed || isMobile) && <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Workspace</p>}
          <div className="space-y-0.5">
            <Link to={`/workspaces/${activeWorkspace.id}`} title={activeWorkspace.name} onClick={() => isMobile && setMobileMenuOpen(false)} className={`flex items-center text-sm font-medium rounded-md transition-colors ${sidebarCollapsed && !isMobile ? 'p-2 justify-center' : 'px-3 py-2'} ${location.pathname === `/workspaces/${activeWorkspace.id}` ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              <div className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-bold shrink-0 ${getThemeForString(activeWorkspace.name)} ${!sidebarCollapsed || isMobile ? 'mr-3' : ''}`}>
                {activeWorkspace.name.charAt(0).toUpperCase()}
              </div>
              {(!sidebarCollapsed || isMobile) && <span className="truncate flex-1">{activeWorkspace.name}</span>}
            </Link>
          </div>

          {/* PROJECTS */}
          {projects && projects.length > 0 && (
            <div className={`mt-4 ${sidebarCollapsed && !isMobile ? '' : 'px-3'}`}>
              {(!sidebarCollapsed || isMobile) && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Projects</p>}
              <div className={`space-y-1 ${sidebarCollapsed && !isMobile ? 'flex flex-col items-center mt-2' : 'ml-1'}`}>
                {projects.map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`} title={p.name} onClick={() => isMobile && setMobileMenuOpen(false)} className={`flex items-center text-sm font-medium rounded-md transition-colors ${sidebarCollapsed && !isMobile ? 'p-2 justify-center' : 'px-2 py-1.5'} ${location.pathname.startsWith(`/projects/${p.id}`) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${location.pathname.startsWith(`/projects/${p.id}`) ? 'bg-primary-500' : 'bg-gray-300'} ${!sidebarCollapsed || isMobile ? 'mr-3' : ''}`}></span>
                    {(!sidebarCollapsed || isMobile) && <span className="truncate">{p.name}</span>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background font-sans text-gray-900">
      {/* Top Navigation */}
      <header className="h-14 bg-surface border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>

          <Link to="/workspaces" className="text-xl font-bold tracking-tight text-primary-700 hover:text-primary-800 transition-colors flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            Tevli
          </Link>
          
          {/* Workspace Switcher (Simple visual indicator for now) */}
          <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors">
            <span className="truncate max-w-[150px]">{activeWorkspace?.name || 'Select Workspace'}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Global Search Trigger */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-500 w-64 transition-colors text-left"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <span className="flex-1 text-left">Search...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 rounded">Cmd K</kbd>
          </button>

          {/* Create Button */}
          <div className="relative">
            <Button size="sm" onClick={() => setCreateMenuOpen(!createMenuOpen)} className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <span className="hidden sm:inline">Create</span>
            </Button>
            {createMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Create New</div>
                <button 
                  onClick={() => {
                    setCreateMenuOpen(false);
                    setSearchParams(prev => { prev.set('createWorkspace', 'true'); return prev; });
                  }}
                  disabled={createWorkspaceMutation.isPending}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Workspace
                </button>
                <button 
                  onClick={() => {
                    setCreateMenuOpen(false);
                    if (!activeWorkspace) return;
                    setSearchParams(prev => { prev.set('createProject', 'true'); return prev; });
                  }}
                  disabled={!activeWorkspace || createProjectMutation.isPending}
                  title={!activeWorkspace ? "Navigate to a workspace to create projects" : ""}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Project
                </button>
                <button 
                  onClick={() => {
                    setCreateMenuOpen(false);
                    if (!projectId) return;
                    navigate(`/projects/${projectId}?createTask=true`);
                  }}
                  disabled={!projectId}
                  title={!projectId ? "Navigate to a project to create tasks" : ""}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Task
                </button>
              </div>
            )}
          </div>

          {/* Help */}
          <button 
            onClick={() => setHelpOpen(true)}
            title="Help & Support"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors hidden sm:block"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Profile */}
          <div className="relative">
            <button 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm hover:ring-2 ring-primary-300 transition-all focus:outline-none"
            >
              {user?.name.charAt(0).toUpperCase()}
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link 
                  to="/settings" 
                  onClick={() => setProfileMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Account Settings
                </Link>
                <button 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div 
              className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-in slide-in-from-left duration-200 z-50 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-14 border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
                <span className="font-bold text-primary-700">Menu</span>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderSidebarContent(true)}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside 
          ref={sidebarRef}
          style={{ width: sidebarCollapsed ? 72 : sidebarWidth }}
          className="bg-surface border-r border-gray-200 flex-col flex-shrink-0 z-10 overflow-y-auto hidden md:flex relative transition-[width] duration-300 ease-in-out"
        >
          {renderSidebarContent(false)}
          
          {/* Drag Handle */}
          {!sidebarCollapsed && (
            <div 
              onMouseDown={handleMouseDown}
              className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary-300 group transition-colors z-20"
            >
              <div className={`w-0.5 h-full bg-transparent group-hover:bg-primary-400 mx-auto ${isResizing ? 'bg-primary-500' : ''}`}></div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto flex flex-col relative bg-gray-50/30">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-[10vh] px-4" onClick={() => setSearchOpen(false)}>
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center px-4 py-3 border-b border-gray-100">
              <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                autoFocus
                type="text" 
                placeholder="Search workspaces and projects..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">ESC</kbd>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!searchQuery ? (
                <div className="py-14 text-center text-sm text-gray-500">
                  Type to search across your current workspace.
                </div>
              ) : searchResults().length === 0 ? (
                <div className="py-14 text-center text-sm text-gray-500">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <ul className="space-y-1">
                  {searchResults().map((item, i) => (
                    <li key={i}>
                      <button 
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          navigate(item.link);
                        }}
                        className="w-full text-left px-4 py-3 flex items-center hover:bg-primary-50 rounded-lg group transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold mr-4 text-sm ${getThemeForString(item.name)}`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-700">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.type}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => {
          setSearchParams(prev => {
            prev.delete('createWorkspace');
            return prev;
          }, { replace: true });
        }}
        onSuccess={(id) => {
          setSearchParams(prev => {
            prev.delete('createWorkspace');
            return prev;
          }, { replace: true });
          navigate(`/workspaces/${id}`);
        }}
      />

      {activeWorkspace && (
        <CreateProjectModal
          isOpen={isProjectModalOpen}
          workspaceId={activeWorkspace.id}
          workspaceName={activeWorkspace.name}
          onClose={() => {
            setSearchParams(prev => {
              prev.delete('createProject');
              return prev;
            }, { replace: true });
          }}
          onSuccess={(id) => {
            setSearchParams(prev => {
              prev.delete('createProject');
              return prev;
            }, { replace: true });
            navigate(`/projects/${id}`);
          }}
        />
      )}

      <HelpDrawer 
        isOpen={helpOpen} 
        onClose={() => setHelpOpen(false)} 
      />
    </div>
  );
};
