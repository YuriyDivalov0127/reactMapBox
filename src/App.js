import * as React from 'react';
import {Component} from 'react';
import ReactMapGL , { Marker, Layer, Source, Popup } from 'react-map-gl';
import busStopPositions from './data/stops.json';
import passengerPositions from './data/passengers.json';
import axios from 'axios';
 
import { distance, point } from '@turf/turf';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmlsbG9uZWlsIiwiYSI6ImNraHF2c2lycTB4Z2oyc3A1NTZxb2EzZzAifQ.BOYz_7zIr-TUJoYdaCvsMg'; // Set your mapbox token here



class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 45.5129604703,
        longitude: -73.5729924601,
        zoom: 14,
        bearing: 0,
        pitch: 0
      },

      closetPBPositions: [],
      selectedBusStopPosition: null,
      closetPassengerCount: null,
    };
  }

  componentDidMount () {
    this.callGetDistanceFunc();
  }
 
  callGetDistanceFunc = () => {
    if (passengerPositions && busStopPositions) {
      let tempClosetPBPositions = [];

      tempClosetPBPositions = passengerPositions.map((pPosition, pPositionIndex) => {
        let closetBPostion = null;

        // make new array of distance for each busStop per person
        let distancesPerPg = busStopPositions.map((bPosition, bPositionIndex) => {
          let pPoint = point([pPosition.lat, pPosition.lon]);
          let bPoint = point([bPosition.lat, bPosition.lon]);
          let options = {units: 'kilometers'}
          return (distance(pPoint, bPoint, options));
        });

        
        let minDistance = this.getFloatMaxValue(distancesPerPg);

        console.log(minDistance, distancesPerPg);
        let minDistanceIndex = distancesPerPg.indexOf(minDistance);
        if (typeof(minDistanceIndex) == "number") {
          closetBPostion = busStopPositions[minDistanceIndex];
        }

        return { pPosition: pPosition, bPosition: closetBPostion }
      })

      this.setState({ closetPBPositions: tempClosetPBPositions });
    }
  }

  getFloatMaxValue = (array) => {
    let min = array[0];
    let max = array[0];

    for (let i = 0; i < array.length; i++) {
      let value = array[i];
      min = (value < min) ? value: min;
      max = (value > max) ? value: max;
    }

    return min;
  }

  handleMouseOverBusStop = (stopPosition) => {
    let tempClosetPassengerCount = 0;
    const { closetPBPositions } = this.state;
    
    if (closetPBPositions) {
      closetPBPositions.forEach((closetPBPosition) => {
        if ((closetPBPosition.bPosition.lat === stopPosition.lat) && (closetPBPosition.bPosition.lon === stopPosition.lon)) {
          tempClosetPassengerCount+=1;
        }
      })
    }
    console.log(tempClosetPassengerCount);
    this.setState({ selectedBusStopPosition: stopPosition, closetPassengerCount: tempClosetPassengerCount })    
  }

  componentDidUpdate () {
    console.log(this.element);
    this.element.onLoad = () => {
        this.element.addSource('route',
        {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {
              
            },
            'geometry': {
              'type': 'LineString',
              'coordinates': [
                [
                  45.509251,
                  -73.568071
                ],
                [
                  45.512056,
                  -73.566417
                ],
                [
                  45.509507,
                  -73.573516
                ],
                [
                  -122.48356819152832,
                  37.832056363179625
                ],
                [
                  -122.48404026031496,
                  37.83114119107971
                ],
                [
                  -122.48404026031496,
                  37.83049717427869
                ],
                [
                  -122.48348236083984,
                  37.829920943955045
                ],
                [
                  -122.48356819152832,
                  37.82954808664175
                ],
                [
                  -122.48507022857666,
                  37.82944639795659
                ],
                [
                  -122.48610019683838,
                  37.82880236636284
                ],
                [
                  -122.48695850372314,
                  37.82931081282506
                ],
                [
                  -122.48700141906738,
                  37.83080223556934
                ],
                [
                  -122.48751640319824,
                  37.83168351665737
                ],
                [
                  -122.48803138732912,
                  37.832158048267786
                ],
                [
                  -122.48888969421387,
                  37.83297152392784
                ],
                [
                  -122.48987674713133,
                  37.83263257682617
                ],
                [
                  -122.49043464660643,
                  37.832937629287755
                ],
                [
                  -122.49125003814696,
                  37.832429207817725
                ],
                [
                  -122.49163627624512,
                  37.832564787218985
                ],
                [
                  -122.49223709106445,
                  37.83337825839438
                ],
                [
                  -122.49378204345702,
                  37.83368330777276
                ]
              ]
            }
          }
        });
        this.element.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#888',
            'line-width': 8
          }
        });
      };

  }

  render() {
    const { viewport, closetPBPositions, selectedBusStopPosition, closetPassengerCount } = this.state;
    console.log(closetPBPositions);
 
    return (

      <ReactMapGL 
        {...viewport}
        width="100vw"
        height="100vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={viewport => this.setState({viewport})}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        ref={(el) => this.element = el}
      >
        {
          busStopPositions.map((stopPosition, index) => {
            return (
              <Marker 
                key={"stopPosition"+index}
                longitude={stopPosition.lon}
                latitude={stopPosition.lat}
              >
                <button 
                  onMouseLeave={() => this.setState({ selectedBusStopPosition: null })}
                  onMouseEnter={() => this.handleMouseOverBusStop(stopPosition)}
                >
                  <img src="./bus.svg" alt="bus icon" style={{width: "20px", height: "20px" }}/>
                </button>
              </Marker>
            )
          })
        }

        {
          passengerPositions.map((passengerPosition, index) => {
            return (
              <Marker 
                key={"passengerPosition"+index}
                longitude={passengerPosition.lon}
                latitude={passengerPosition.lat}
              >
                <button>
                  <img src="./person.svg" alt="person icon" style={{width: "20px", height: "20px" }}/>
                </button>
              </Marker>
            )
          })
        }

        { 
          selectedBusStopPosition && 
          (
            <Popup
              offsetLeft={10}
              latitude={selectedBusStopPosition.lat}
              longitude={selectedBusStopPosition.lon}
            >
              <div>lat: {selectedBusStopPosition.lat}</div>
              <div>lon: {selectedBusStopPosition.lat}</div>
              <div>closet passenger count: {closetPassengerCount}</div>
            </Popup>
          )
        }
      </ReactMapGL>
    );
  }
}

export default App;