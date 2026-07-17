import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return <main><div className="card"><span>AI STOCK ATLAS</span><h1>上市公司知识图鉴</h1><p>用户端将在管理后台的数据体系稳定后正式开发。</p></div></main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

