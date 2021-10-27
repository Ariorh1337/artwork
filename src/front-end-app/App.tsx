import './css/app.css';

import React from 'react';
import PlotPreview from './components/PlotPreview';

interface AppState {
	data: any;
}

export default class App extends React.Component<any, AppState> {
	render() {
		return (
			<div className="App">
				<PlotPreview />
			</div>
		);
	}
};
