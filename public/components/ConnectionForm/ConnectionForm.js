const React = require('react');
const classNames = require('classnames');
const Segment = require('../../services/segment.service');
import {connect} from 'react-redux';

const ConnectionForm = ({
  showAddConnectionForm,
  showEditConnectionForm,
  selectedConnection,
  onCancel,
  onSave,
  onUpdate
}) => {
  let form = {};
  let connection = {
    name: '',
    host: '',
    port: ''
  };


  if(showEditConnectionForm){
    connection = selectedConnection;
  }
  console.log('lasdjkfakfdskhjfashjksfakjhsafhjk selectedConnection',selectedConnection)
  console.log("    --->>>>>   connection", connection)

  //if creating connection should be empty object
  //if editing should be selectedConnection

  // getInitialState: function() {
  //   return {
  //     store: this.context.store,
  //     connection: this.context.store.connection,
  //     show: this.context.store.router.ConnectionForm.show,
  //     action: this.context.store.router.ConnectionForm.action
  //   };
  // },
  // componentDidMount: function() {
  //   this.setupEvents();
  // },
  // setupEvents: function() {
  //   const updateState = () => {
  //     this.setState({
  //       connection: this.context.store.connection,
  //       show: this.context.store.router.ConnectionForm.show,
  //       action: this.context.store.router.ConnectionForm.action
  //     });
  //   }

  //   this.state.store.on('updateRehinkDbClient', () => {
  //     updateState();
  //   });
  //   this.state.store.on('showConnectionForm', () => {
  //     updateState();
  //   });
  //   this.state.store.on('hideConnectionForm', () => {
  //     updateState();
  //   });
  // },
  // handleTextChange: function(key, e) {
  //   var attribute = this.state.connection;
  //   attribute[key].value = e.target.value;
  //   this.setState(attribute);
  // },
  // handleValidation: function() {
  //   var attributes = this.state.connection;
  //   attributes.name.valid = this.state.connection.name.value ? true : false;
  //   attributes.host.valid = this.state.connection.host.value ? true : false;
  //   attributes.port.valid = this.state.connection.port.value ? true : false;
  //   this.setState(attributes);
  // },
  // handleSubmit: function(e) {
  //   this.handleValidation();
  //   if (this.state.connection.name.valid && this.state.connection.host.valid && this.state.connection.port.valid) {
  //     // Save new favorite and turn off form
  //     if (this.state.action === 'Add') {
  //       this.state.store.addFavorite(this.state.connection);
  //       Segment.track({
  //         event: 'connection.add',
  //         properties: {}
  //       });
  //     } else {
  //       this.state.store.editFavorite(this.state.connection);
  //     }
  //     this.state.store.hideConnectionForm();
  //   }
  // },
  // handleCancel: function(e) {
  //   this.state.store.hideConnectionForm();
  // },
  // handleDelete: function(e) {
  //   this.state.store.deleteFavorite(this.state.connection);
  //   this.state.store.hideConnectionForm();
  // },
  // render: function() {
    // const {showAddConnectionForm, showEditConnectionForm} = this.props;
    var containerStyles = {
      display: showAddConnectionForm || showEditConnectionForm ? 'block' : 'none'
    };

    // Validation Classes
    // const inputValidationClasses = {
    //   name: classNames({
    //     'form-group': true,
    //     'has-error': !this.state.connection.name.valid
    //   }),
    //   host: classNames({
    //     'form-group': true,
    //     'has-error': !this.state.connection.host.valid
    //   }),
    //   port: classNames({
    //     'form-group': true,
    //     'has-error': !this.state.connection.port.valid
    //   }),
    //   database: classNames({
    //     'form-group': true
    //   }),
    //   authKey: classNames({
    //     'form-group': true
    //   })
    // };

    let deleteButton = '';
    if (showEditConnectionForm) {
      deleteButton = <button type="delete" className="btn btn-default" onClick="">Delete</button>
    }

    console.log("connection.name", connection.name)

    return (
      <div className="ConnectionForm" style={containerStyles}>
        <div className="panel panel-default">
          <div className="panel-heading">
            <strong>{ showAddConnectionForm ? 'Add New' : 'Edit' } RethinkDB Connection</strong>
          </div>
          <div className="panel-body">
            <div className="row">
              <div className="col-sm-12">
                <form>
                  <div >
                    <label htmlFor="name">Connection Name</label>
                    <input
                    ref={node => { if (!node) return; node.focus(); form.name = node; }}
                    type="text" className="form-control" id="name" placeholder="i.e. TodoApp-local" />
                  </div>
                  <div>
                    <label htmlFor="host">Host</label>
                    <input
                    ref={node => { if (!node) return; form.host = node; }}
                    type="text" className="form-control" id="host" placeholder="i.e. localhost" />
                  </div>
                  <div >
                    <label htmlFor="port">Port</label>
                    <input
                    ref={node => { if (!node) return; form.port = node; }}
                    type="text" className="form-control" id="port" placeholder="i.e. 28015" />
                  </div>
                  {/*<div className={inputValidationClasses.database}>
                    <label htmlFor="database">Database</label>
                    <input type="text" className="form-control" id="database" placeholder="Database" value={this.state.connection.database.value} onChange={this.handleTextChange.bind(this, 'database')} />
                  </div>
                  <div className={inputValidationClasses.authKey}>
                    <label htmlFor="authKey">Auth Key</label>
                    <input type="text" className="form-control" id="authKey" placeholder="Auth Key" value={this.state.connection.authKey.value} onChange={this.handleTextChange.bind(this, 'authKey')} />
                  </div>*/}
                </form>
              </div>
            </div>
          </div>
          <div className="panel-footer">
            <button type="submit" onClick={ showAddConnectionForm ? ()=>onSave(form) : ()=>onUpdate(form) } className="btn btn-primary pull-right">Save</button>
            <button type="cancel" onClick={onCancel} className="btn btn-default pull-left">Cancel</button>
            {deleteButton}
            <div className="clearfix"/>
          </div>
        </div>
      </div>
    );
  // }
};

// ConnectionForm.contextTypes = {
//   store: React.PropTypes.object
// };

function mapStateToProps(state) {
  console.log('ConnectionForm ConnectionForm ConnectionForm', state.selectedConnection);
  return {
    showAddConnectionForm: state.showAddConnectionForm,
    showEditConnectionForm: state.showEditConnectionForm,
    selectedConnection: state.selectedConnection
  };
}

() => params()


const mapDispatchToProps = (dispatch) => {
  return {
    onCancel: () =>{
      dispatch({
        type: "HIDE_CONNECTION_FORM"
      })
    },
    onSave: (connection) =>{
      dispatch({
        type: "ADD_CONNECTION",
        connection: {
          name: connection.name.value,
          host: connection.host.value,
          port: connection.port.value
        }
      });

      connection.name.value = null;
      connection.host.value = null;
      connection.port.value = null;
    },
    onUpdate: (connection) =>{
      console.log("    --------> onUpdate connection", connection)
      dispatch({
        type: "UPDATE_CONNECTION",
        connection: {
          name: connection.name.value,
          host: connection.host.value,
          port: connection.port.value
        }
      });

      connection.name.value = null;
      connection.host.value = null;
      connection.port.value = null;
    }
  }
};

const ConnectionFormContainer = connect(mapStateToProps, mapDispatchToProps)(ConnectionForm);

module.exports = ConnectionFormContainer;
