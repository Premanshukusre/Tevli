export const useRecentWorkspaces = () => {
  const getRecent = () => {
    try {
      const data = localStorage.getItem('tevli_recent_workspaces');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const addRecent = (workspace: { id: string; name: string }) => {
    try {
      let recent = getRecent();
      recent = recent.filter((w: any) => w.id !== workspace.id);
      recent.unshift({ ...workspace, accessedAt: new Date().toISOString() });
      if (recent.length > 5) recent = recent.slice(0, 5);
      localStorage.setItem('tevli_recent_workspaces', JSON.stringify(recent));
    } catch {}
  };

  return { getRecent, addRecent };
};

export const useStarredWorkspaces = () => {
  const getStarred = () => {
    try {
      const data = localStorage.getItem('tevli_starred_workspaces');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const toggleStarred = (workspace: { id: string; name: string }) => {
    try {
      let starred = getStarred();
      const exists = starred.find((w: any) => w.id === workspace.id);
      if (exists) {
        starred = starred.filter((w: any) => w.id !== workspace.id);
      } else {
        starred.unshift(workspace);
      }
      localStorage.setItem('tevli_starred_workspaces', JSON.stringify(starred));
      // Dispatch custom event to update other components
      window.dispatchEvent(new Event('tevli_starred_updated'));
      return !exists;
    } catch {
      return false;
    }
  };

  const isStarred = (id: string) => {
    return getStarred().some((w: any) => w.id === id);
  };

  return { getStarred, toggleStarred, isStarred };
};
