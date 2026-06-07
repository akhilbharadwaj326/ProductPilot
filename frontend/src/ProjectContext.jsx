import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [activeProject, setActiveProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    const userId = localStorage.getItem('userId');
    
    // If not logged in, do not fetch projects
    if (!userId) {
      setProjects([]);
      setActiveProject(null);
      setIsLoading(false);
      return;
    }
    
    const query = supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    const { data, error } = await query;
    
    if (!error && data) {
      setProjects(data);
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0]);
      } else if (data.length === 0) {
        setActiveProject(null);
      }
    } else {
      setProjects([]);
      setActiveProject(null);
    }
    setIsLoading(false);
  };

  // Fetch all projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (name, description) => {
    const userId = localStorage.getItem('userId');
    const { data, error } = await supabase.from('projects').insert([{ 
      name, 
      description,
      user_id: userId || 'anonymous'
    }]).select();
    
    if (!error && data) {
      setProjects([data[0], ...projects]);
      setActiveProject(data[0]);
      return data[0];
    }
    return null;
  };

  return (
    <ProjectContext.Provider value={{ activeProject, setActiveProject, projects, setProjects, createProject, fetchProjects, isLoading }}>
      {children}
    </ProjectContext.Provider>
  );
};
