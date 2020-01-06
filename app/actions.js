import co from 'co';
import RethinkDbService from './services/rethinkdb.service';
import ReQLEval from './services/reql-eval.service';
import { convertStringsToDates } from './services/date-type.service'
import configService from './services/config.service';
import * as types from './action-types';

export function queryTable(conn, db, table, query = {
  filterPredicate: '',
  orderByPredicate: '',
  limit: 25,
  page: 1
}) {
  if (query.page) {
    return getTableData(conn, db, table, query);
  } else if (query.index) {
    return getTableDataBetween(query.index, query.start, query.end, conn, db, table);
  }
}

function cleanseQuerySettings(query) {
  return new Promise((resolve, reject) => {
    co(function *() {
      let { filterPredicate, orderByPredicate, page } = query;

      if (filterPredicate) {
        filterPredicate = yield ReQLEval(filterPredicate);
      }

      orderByPredicate = yield orderByPredicate.split(',')
        .map((p) => {
          if (p) {
            return ReQLEval(p);
          } else {
            return '';
          }
        });

      if (page < 1) {
        page = 1;
      }

      resolve({
        ...query,
        filterPredicate,
        orderByPredicate,
        page
      });
    })
      .catch(reject);
  });
}

export function getTableData(conn, db, table, query) {
  return dispatch => {
    dispatch({
      type: types.SET_CONNECTION_LOADING,
      loading: true
    });
    dispatch({
      type: types.SET_TABLE_QUERY,
      query
    });
    return new Promise((resolve, reject) => {
      co(function *() {
        const queryOpts = yield cleanseQuerySettings(query);

        // TODO: Use this to enable auto refreshing
        // const onUpdate = () => dispatch(refreshExplorerBody());
        // const result = yield RethinkDbService.getTableData(conn, db, table, queryOpts, onUpdate);
        const result = yield RethinkDbService.getTableData(conn, db, table, queryOpts);

        console.log('result', result); // eslint-disable-line no-console
        dispatch({
          type: types.UPDATE_SELECTED_TABLE,
          lastResult: result,
          data: result.value
        });
        dispatch(getTableSize(conn, db, table, queryOpts.filterPredicate));
        dispatch({
          type: types.SET_CONNECTION_LOADING,
          loading: false
        });
        resolve(result);
      })
        .catch(error => {
          console.log('error', error); // eslint-disable-line no-console
          if (!error.msg) {
            error.msg = error.message;
          }
          dispatch({
            type: types.UPDATE_SELECTED_TABLE,
            queryError: error
          });
          dispatch({
            type: types.SET_CONNECTION_LOADING,
            loading: false
          });
          reject(error);
        });
    });
  }
}

function getTableDataBetween(index, start, end, dbConnection, databaseName, tableName) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'SET_CONNECTION_LOADING',
        loading: true
      });
      const conn = dbConnection;
      const db = databaseName;
      const table = tableName;

      RethinkDbService.getTableDataBetween(conn, db, table, index, start, end).then((result) => {
        // this was in the old function before refactor, not sure what its for -Cassie
        if (end) {
          result.value.reverse();
        }

        dispatch({
          type: 'UPDATE_SELECTED_TABLE',
          lastResult: result,
          data: result.value
        });
        dispatch(getTableSize(conn, db, table));
        dispatch({
          type: 'SET_CONNECTION_LOADING',
          loading: false
        });
        resolve(result);

      }).catch(function(error) {
        dispatch({
          type: 'UPDATE_SELECTED_TABLE',
          queryError: error
        });
        dispatch({
          type: 'SET_CONNECTION_LOADING',
          loading: false
        });
        reject(error);
      });
    });
  }
}

export function executeQuery(script) {
  //TODO: 
  // RethinkDbService.ReQLEval()
}

export function deleteDatabase(conn, dbName) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      RethinkDbService.deleteDb(conn, dbName).then((results) => {
        dispatch({
          type: "DELETE_DATABASE",
          dbName
        });
        resolve();
      }).catch((err) => {
        dispatch({
          type: types.TOGGLE_DELETE_DATABASE_FORM,
          showDeleteDatabaseForm: true
        });
        dispatch({
          type: types.SET_DATABASE_FORM_ERROR,
          databaseFormError: err
        });
        reject(err);
      });
    });
  }
}

export function saveInlineEdit(originalRow, row) {
  return (dispatch, getState) => {
    dispatch({
      type: 'SET_ROW_INLINE_EDIT',
      row: originalRow
    });
    const { dbConnection, selectedTable } = getState().main;
    dispatch(saveRow(dbConnection, selectedTable, row));
  }
}

export function saveRow(conn, selectedTable, row) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      ReQLEval(row).then(async (rowObj) => {
        row = convertStringsToDates(selectedTable.editingRecord, rowObj);
        selectedTable.code.error = null;

        if (selectedTable.code.action === 'update') {
          // Extra protection here if people alter the id when updating
          // Using replace will insert a new record
          // I'm assuming replace is less performant than update so lets use update when possible
          const matched = selectedTable.data.filter((item) => item.id === row.id).length === 1;

          if (matched) {
            /*
             * TODO: Figure out if this is relevant - but it was removed to solve HelpScout #49
             * i.e. document fields can not be removed via the update operation
             * const result = await RethinkDbService.update(conn, selectedTable.databaseName, selectedTable.name, row);
             */
            const result = await RethinkDbService.replace(conn, selectedTable.databaseName, selectedTable.name, row);
            handleResult(dispatch, result);
          } else {
            // The difference here is that it will create a new record if an id is not found
            const result = await RethinkDbService.replace(conn, selectedTable.databaseName, selectedTable.name, row);
            handleResult(dispatch, result);
          }
        } else if (selectedTable.code.action === 'add') {
          const result = await RethinkDbService.insert(conn, selectedTable.databaseName, selectedTable.name, row);
          handleResult(dispatch, result);
        }
      }).catch((err) => {
        const codeBodyError = err.first_error || err + '' || 'There was an error. You can only save valid json to your table';
        dispatch({
          type: 'SET_CODE_BODY_ERROR',
          codeBodyError
        });

      });
    });
  }
}

function handleResult(dispatch, result) {
  console.log('result', result); // eslint-disable-line no-console
  dispatch({
    type: 'SET_LAST_DB_RESULT',
    lastResult: result
  });

  if (result.value.errors) {
    throw(result.value)
  } else {
    dispatch({
      type: "TOGGLE_EXPLORER_BODY",
      key: 'table'
    });
    dispatch(refreshExplorerBody());
  }
}

export function getTableSize(conn, dbName, tableName, filter) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      RethinkDbService.getTableSize(conn, dbName, tableName, filter).then((size) => {
        dispatch({
          type: "SET_TABLE_SIZE",
          size
        });
        resolve();
      }).catch(function(err) {
        reject(err);
      });
    });
  }
}

export function refreshExplorerBody() {
  return (dispatch, getState) => {
    // Run last query to update view

    const conn = getState().main.dbConnection;
    const dbName = getState().selectedTable.databaseName;
    const tableName = getState().selectedTable.name;
    const query = getState().selectedTable.query;

    return dispatch(queryTable(conn, dbName, tableName, query));
  }

}

export function deleteRow(row) {
  return (dispatch, getState) => {
    const conn = getState().main.dbConnection;
    const dbName = getState().selectedTable.databaseName;
    const tableName = getState().selectedTable.name;
    return RethinkDbService.delete(conn, dbName, tableName, row).then((result) => {
      if (result.value.errors) {
        throw(result.value)
      } else {
        // Toggle ConfirmRowDelete popup
        dispatch({
          type: "TOGGLE_CONFIRM_ROW_DELETE"
        });
        // Run last query to update view
        dispatch(refreshExplorerBody());
      }

    }).catch((err) => {
      const rowDeleteError = err.first_error || err + '' || 'There was an error. You can only save valid json to your table';
      dispatch({
        type: "SET_ROW_DELETE_ERROR",
        rowDeleteError
      });
    });
  }
}

export function writeConfigFile() {
  return (dispatch, getState) => {
    const state = getState();
    return configService.writeConfigFile({
      email: state.main.email,
      created: state.main.created,
      connections: state.connections
    });
  }
}
