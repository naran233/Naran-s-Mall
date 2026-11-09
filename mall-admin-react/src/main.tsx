import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'antd/dist/reset.css'
import './styles/global.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#409eff', borderRadius: 6 } }}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ConfigProvider>
)
