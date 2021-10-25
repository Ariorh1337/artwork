import './front-end-app/css/index.css';

import { render } from 'react-dom';
import App from './front-end-app/App';

declare global {
  interface Window {
    drawState: boolean;
  }
}

window.drawState = false;

render(<App />, document.getElementById('root'));
