import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

/** 用户端占位首页，后续用户业务模块从这里接入。 */
function App() {
  return <main><div className="card"><span>AI STOCK ATLAS</span><h1>上市公司知识图鉴</h1><p>用户端将在管理后台的数据体系稳定后正式开发。</p></div></main>;
}

// 将用户端 React 应用挂载到 index.html 的根节点。
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
