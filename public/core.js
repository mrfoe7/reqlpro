import {List, Map, fromJS} from 'immutable';
import jdenticon from 'jdenticon';
import md5 from 'md5';
// import RethinkDbService from '../main/services/rethinkdb.service';

export function setState(state, newState) {
  return Object.assign({}, state, newState);
}

export function setConnections(state, connections) {
  return state.set('connections', List(connections));
}

export function setEmail(state, email) {
  if (email) {
    return Object.assign({}, state, {email});
  }
  return state;
}

export function showConnectionForm(state, mode) {
  switch(mode){
    case 'NEW':
      let newState = Object.assign({}, state, {showAddConnectionForm:true})
      if(state.showEditConnectionForm) {
        delete newState.showEditConnectionForm;
      }
      return newState;
  }

  return state;
}

export function hideConnectionForm(state) {
      let newState = Object.assign({}, state)
      if(state.showEditConnectionForm) {
        delete newState.showEditConnectionForm;
      }
      if(state.showAddConnectionForm) {
        delete newState.showAddConnectionForm;
      }
      return newState;
}

export function addConnection(state, connection) {
  let connections = [];
  if(state.connections) {
    connections = state.connections.slice();
  }
  if(connection) {
    connections.push({
      name: connection.name,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      database: "",
      authKey: "",
      identicon: jdenticon.toSvg(md5(connection.name), 40),
      index: state.connections?state.connections.length:0
    });
  }
  
  return Object.assign({}, state, {connections});
}

export function getConnection(dispatch, connection) {

  var RethinkDbService = require('../main/services/rethinkdb.service');

  RethinkDbService.getConnection(connection.host, connection.port, connection.authKey).then((conn)=>{
    console.log('getConnection conn',conn);
    // dispatch({
    //   type: 'SET_CONNECTION',
    //   connection: conn
    // });
  });

}