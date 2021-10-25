import React from 'react';
import { PlotPreview } from './components/PlotPreview';
import './App.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="App">
      <Toaster
        position="bottom-left"
        reverseOrder={false}
      />
      <PlotPreview />

    </div>
  );
}

export default App;
