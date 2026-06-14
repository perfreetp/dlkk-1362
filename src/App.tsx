import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Workbench } from '@/pages/Workbench';
import { ToolSquare } from '@/pages/ToolSquare';
import { PromptLibrary } from '@/pages/PromptLibrary';
import { TaskRecords } from '@/pages/TaskRecords';
import { TeamSpace } from '@/pages/TeamSpace';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-primary">
        <Sidebar />
        <main className="ml-64">
          <Routes>
            <Route path="/" element={<Workbench />} />
            <Route path="/tools" element={<ToolSquare />} />
            <Route path="/tools/:id" element={<ToolSquare />} />
            <Route path="/prompts" element={<PromptLibrary />} />
            <Route path="/tasks" element={<TaskRecords />} />
            <Route path="/team" element={<TeamSpace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
