import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [activeProject, setActiveProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      // We will try to fetch projects from Supabase. 
      // If the projects table doesn't exist yet, we will mock it gracefully.
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      
      if (!error && data) {
        setProjects(data);
        if (data.length > 0 && !activeProject) {
          setActiveProject(data[0]);
        }
      } else {
        // Fallback mock data if the user hasn't run the new SQL yet
        const mockProjects = [
          { id: '1', name: 'ProductPilot Platform', description: 'AI driven product management workspace', created_at: new Date().toISOString() }
        ];
        setProjects(mockProjects);
        setActiveProject(mockProjects[0]);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  const createProject = async (name, description) => {
    const { data, error } = await supabase.from('projects').insert([{ name, description }]).select();
    if (!error && data) {
      setProjects([data[0], ...projects]);
      setActiveProject(data[0]);
      return data[0];
    }
    return null;
  };

  return (
    <ProjectContext.Provider value={{ activeProject, setActiveProject, projects, setProjects, createProject, isLoading }}>
      {children}
    </ProjectContext.Provider>
  );
};
