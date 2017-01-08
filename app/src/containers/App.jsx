import React, { Component } from 'react';
import OpenLayers3Map from './../components/OpenLayers3Map.jsx';

export default class App extends Component {
    render() {
        return (
          <div className="appContainer">
            <div className="appContainer__Title">This is Open Layers 3 map.</div>
            <OpenLayers3Map />             
          </div>
        );
    }
}