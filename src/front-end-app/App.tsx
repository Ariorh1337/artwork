import './css/app.css';

import React from 'react';
import PlotPreview from './components/PlotPreview';

interface AppState {
	data: any;
}

export default class App extends React.Component<any, AppState> {
	eventSource: EventSource;

	constructor(props: any) {
		super(props);
		
		this.eventSource = new EventSource("http://localhost:5000/handshake");
	}

	componentDidMount() {
		this.setState(Object.assign({}, { data: [] }));
		this.eventSource.onmessage = (e) => {
			this.updateFlightState(JSON.parse(e.data));
		};
	}
	
	updateFlightState(flightState: any) {
		const newData = this.state.data.map((item: any) => {
			if (item.flight === flightState.flight) {
				item.state = flightState.state;
			}
			
			return item;
		});
	
		this.setState(Object.assign({}, { data: newData }));
	}

	render() {
		return (
			<div className="App">
				<PlotPreview />
			</div>
		);
	}
};
