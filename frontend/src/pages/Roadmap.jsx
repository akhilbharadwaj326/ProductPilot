import React, { useState, useEffect } from 'react';
import { Calendar, Check, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useProject } from '../ProjectContext';

export const Roadmap = () => {
  const { activeProject } = useProject();
  const [roadmapData, setRoadmapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, [activeProject]);

  const fetchRoadmap = async () => {
    if (!activeProject) {
      setRoadmapData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data } = await supabase.from('roadmaps')
      .select('*')
      .eq('project_id', activeProject.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (data && data.length > 0 && data[0].milestone_data) {
      setRoadmapData(data[0].milestone_data);
    } else {
      setRoadmapData([]);
    }
    setIsLoading(false);
  };

  const handleSyncCalendar = () => {
    setSyncing(true);
    // Mock API call to Google Calendar / ICS generation
    setTimeout(() => {
      let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ProductPilot//Roadmap//EN\n`;
      roadmapData.forEach((item, idx) => {
        icsContent += `BEGIN:VEVENT\nSUMMARY:${item.title}\nDTSTART:2026070${idx+1}T090000Z\nDTEND:2026071${idx+5}T170000Z\nEND:VEVENT\n`;
      });
      icsContent += `END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'roadmap_sync.ics';
      link.click();
      
      setSyncing(false);
      setSynced(true);
      setTimeout(() => setSynced(false), 3000);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="content-area animate-fade-in" style={{ maxWidth: '1200px', textAlign: 'center', marginTop: '100px' }}>
        <Loader size={48} className="animate-spin" color="var(--accent-color)" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
        <h2>Loading Roadmap...</h2>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in" style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Product Roadmap</h1>
          <p>Strategic timeline and milestone planning for {activeProject?.name || 'this product'}.</p>
        </div>
        <button className="btn btn-secondary" style={{ background: 'var(--bg-panel)' }} onClick={handleSyncCalendar} disabled={syncing || synced || !activeProject || roadmapData.length === 0}>
          {synced ? <Check size={18} /> : <Calendar size={18} />} 
          {syncing ? 'Generating...' : synced ? 'Downloaded!' : 'Add to Calendar (.ics)'}
        </button>
      </div>
      
      <div className="glass-card" style={{ marginTop: '32px', overflowX: 'auto' }}>
        {roadmapData.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No roadmap data available. Use the Idea Wizard to generate one.</p>
        ) : (
          <div style={{ minWidth: '800px' }}>
            {/* Timeline Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ width: '250px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Initiative</div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Month 1</span>
                <span>Month 2</span>
                <span>Month 3</span>
              </div>
            </div>

            {/* Timeline Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {roadmapData.map((item, index) => {
                const color = index % 3 === 0 ? 'var(--accent-color)' : index % 3 === 1 ? 'var(--info)' : 'var(--warning)';
                const leftPos = index === 0 ? '0%' : index === 1 ? '33%' : '66%';
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '250px' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', paddingRight: '10px' }}>{item.title}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.status}</span>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '40px', background: 'var(--bg-panel)', borderRadius: '20px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          position: 'absolute', 
                          height: '100%', 
                          background: color, 
                          left: leftPos, 
                          width: '33%',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 16px',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}
                      >
                        {item.timeframe}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};
