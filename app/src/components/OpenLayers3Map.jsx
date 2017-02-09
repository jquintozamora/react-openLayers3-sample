import React, { Component } from 'react';
import ol from 'openlayers';
// import proj4 from 'proj4';
import { MapOptions } from './../constants/MapConstants';
import { ChangeLayerControl } from './ChangeLayerControl.jsx';
import { getWKTData } from './../utils/mock/mockApi.js';

//window.map = null;

export default class OpenLayers3Map extends Component {

    constructor() {
        super();

        this.state = {
            wkts: [],
            selectedWKT: undefined,
            errors: [],
            layer: "OSM",
            selectedLayer: MapOptions.Colour,
            // red:     rgba(174, 7, 7, 0.7)
            // green:   rgba(76, 175, 80, 0.7)
            color: "rgba(174, 7, 7, 0.7)" 
        }

        this._map = null;

    }

    // Function called on olCustomControls.ChangeLayer when "Update map" button clicked.
    updateMap = (selectedId, selectedWKT) => {
        switch (selectedId) {
            case MapOptions.Colour:
                this.setState({ selectedLayer: selectedId, layer: "OSM", color: "rgba(174, 7, 7, 0.7)", selectedWKT: selectedWKT });
                break;
            case MapOptions.Grey:
                this.setState({ selectedLayer: selectedId, layer: "OSM", color: "rgba(176,176,176,0.7)", selectedWKT: selectedWKT });
                break;
            case MapOptions.AerialPhoto:
                this.setState({ selectedLayer: selectedId, layer: "Aerial", selectedWKT: selectedWKT });
                break;
            case MapOptions.NoBaseLayer:
                this.setState({ selectedLayer: selectedId, layer: "", selectedWKT: selectedWKT });
                break;
            default:
        }
    }

    // This promise is useful to return the titleNumber and to avoid that all promises fails when one of then do it.
    _promiseWrapperAttachTitle = function (prom, titleNumber) {
        return new Promise((resolve, reject) => {
            prom
                .then((response) => { resolve({ data: response, key: titleNumber }) })
                .catch((err) => resolve({ error: err }))
        })
    }

    _getWKTs() {

        let arrayWKTs = ["WKT1", "WKT2"];
        if (arrayWKTs !== undefined && arrayWKTs.length > 0) {

            let promises = [];
            arrayWKTs.forEach((item, i) => {
                // IMPORTANT: TODO. Replace Emapsite mock by the good one once CORS enabled in the server side.
                promises.push(this._promiseWrapperAttachTitle(getWKTData(item), item));
            });

            Promise.all(promises)
                .then((values) => {

                    let newValues = [];
                    let errors = [];
                    for (var i = 0; i < values.length; i++) {
                        const item = values[i];
                        if (item.hasOwnProperty('error')) {
                            errors = errors.concat(item);
                        } else {
                            var newObj = { key: item.key, data: item.data.data.polygons.map((item2) => item2.wkt) };
                            newValues = newValues.concat(newObj);
                        }
                    }
                    this.setState({ errors: [...errors, ...this.state.errors], wkts: [...newValues, ...this.state.wkts], selectedWKT: values[0].key });
                })
                .catch(error => {
                    this.setState({ errors: [error, ...this.state.errors] });
                });

        }

    }

    _configureMap() {

        // Register Proj4 in Open Layers
        //ol.proj.setProj4(proj4);
        // Register EPSG:27700 projection
        //proj4.defs("EPSG:27700", "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717+x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs");

        this._map = new ol.Map({
            controls: ol.control.defaults({
                zoom: true,
                attribution: true,
                rotate: true
            }).extend([
                new ol.control.FullScreen(),
                new ol.control.ScaleLine()
            ]),
            layers: [new ol.layer.Tile({
                source: new ol.source.OSM()
            })],
            // div targeted included in the render method
            target: 'map',
            view: new ol.View({
                center: [0, 0],
                zoom: 4
            })
        });
    }



    componentDidMount() {

        // Register EPSG:27700 projection format (british coordinates) and create the map as Global variable 
        this._configureMap();

        // Call SharePoint list to get Land Registry Numbers and for each one call emapsite web service
        this._getWKTs();

    }


    _addChangeLayerCustomOLControl() {
        const {wkts, selectedWKT, selectedLayer } = this.state;
        // Add Change Layer  custom Control
        this._map.removeControl(this._customControl);
        this._customControl = new ChangeLayerControl({
            updateMapFc: this.updateMap,
            values: [
                { id: MapOptions.Colour, value: "Colour", default: selectedLayer === MapOptions.Colour }
                , { id: MapOptions.Grey, value: "Grey", default: selectedLayer === MapOptions.Grey }
                , { id: MapOptions.AerialPhoto, value: "Aerial Photo", default: selectedLayer === MapOptions.AerialPhoto }
                , { id: MapOptions.NoBaseLayer, value: "No base layer", default: selectedLayer === MapOptions.NoBaseLayer }
            ],
            wktsNumbers: wkts.map((item) => { return { key: item.key, selected: selectedWKT === item.key } }),
            selectedId: selectedLayer,
            selectedWKT: selectedWKT
        });
        this._map.addControl(this._customControl);
    }

    _removeAllLayers() {
        for (var i = this._map.getLayers().getLength() - 1; i >= 0; i--) {
            var l = this._map.getLayers().item(i);
            this._map.removeLayer(l);
        }
    }
    
    _applySelectedLayer() {
        const { layer } = this.state;
        switch (layer) {
            case "OSM":
                this._map.addLayer(new ol.layer.Tile({
                    source: new ol.source.OSM()
                }));
                break;
            case "Aerial":
                // imagerySet: 'Road', 'Aerial', 'AerialWithLabels','collinsBart', 'ordnanceSurvey'
                this._map.addLayer(new ol.layer.Tile({
                    source: new ol.source.BingMaps({
                        // TODO. Change this Bing Maps key 
                        key: 'Ag69SworaTWDMpEnRFUvs1-Nd-EJ6yf4tB4HFmbBg4qXvLiNuG4Ay14nAnIWAdyt',
                        imagerySet: 'AerialWithLabels',
                        maxZoom: 19
                    })
                }));
                break;
            default:
        }
    }

    _addLandShareToMap() {
        const { wkts, selectedWKT, color } = this.state;
        if (selectedWKT !== undefined) {
            var format = new ol.format.WKT();

            //Self defined style
            var myStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: 4
                }),
                fill: new ol.style.Fill({
                    color: color
                })
            });

            var vector = new ol.layer.Vector({
                source: new ol.source.Vector({}),
                style: myStyle
            });

            var filteredWKTs = wkts.filter((item) => { return item.key === selectedWKT });
            if (filteredWKTs !== null && filteredWKTs.length > 0) {
                filteredWKTs[0].data.forEach((element) => {
                    var feature = format.readFeature(element, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857'
                    });
                    vector.getSource().addFeature(feature);
                });

                this._map.addLayer(vector);

                // Centering the map
                var extent = vector.getSource().getExtent();
                this._map.getView().fit(extent, this._map.getSize());
            }
        }

    }

    render() {
        // TODO. add errors layer using this.state.errors array.
        console.log(this._map);
        if (this._map) {

            // Add Change Layer custom control to map
            this._addChangeLayerCustomOLControl();

            // Remove all layers
            this._removeAllLayers();
            console.log("this._removeAllLayers()");

            // Apply the selected layer based on this.state.layer
            this._applySelectedLayer();

            // Add land shape to map in WKT format
            this._addLandShareToMap();
        }

        return (
            <div id="map" className="map" />
        );
    }
}