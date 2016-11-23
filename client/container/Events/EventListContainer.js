import React from 'react';
import { OverlayTrigger, Popover, Button, Col, Row, Grid, FormGroup, FormControl, ControlLabel, Navbar } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { getEvent, attendEvent, searchEventsByUserName, searchEventsByEventName, showEvent } from '../../actions/eventForm';
import { connect } from 'react-redux';
import axios from 'axios';
import SimpleMapPage from '../Features/MapContainer';
import { toastr } from 'react-redux-toastr';


///This shows both the list of default events as well as the ones that users search
class EventList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            event: '',
            eventName: '',
            userName: '',
            search: false,
            justAttended: ''
        }
    }

    componentDidMount() {
        this.props.getEvent();
        this.props.showEvent(this.props.id);
    }

    attend(e) {
        let user_id = this.props.id;
        let eventId = e.currentTarget.getAttribute('data-eventID');
        let result = this.props.userEvents.filter((event) => event['event_id'] === Number(eventId))

        if(result.length > 0 || eventId === this.state.justAttended) {
          toastr.warning('Uh Oh!', 'you are already attending this event.')
          return null;
        }
        this.props.attendEvent(eventId, user_id)
            .catch((err) => console.log(err));
        toastr.success('Event Success!', `You added the event`);
        this.setState({justAttended: eventId})
    }

    // called as soon as the the shouldComponentUpdate returned true. Any state changes via this.setState are not allowed as this method should be strictly used to prepare for an upcoming update not trigger an update itself.
    componentWillUpdate(nextProps, nextState) {
        // perform any preparations for an upcoming update
        // console.log(nextProps, "props++++++state for EVENT LIST", nextState);
    }

    handleUserNameChange(e) {
      if(Boolean(e.currentTarget.value)) {
        this.props.searchEventsByUserName(e.currentTarget.value);
        this.setState({search: true})
      } else
      this.setState({search: false})
    }

    handleEventNameChange(e) {
      if(Boolean(e.currentTarget.value)) {
        this.props.searchEventsByEventName(e.currentTarget.value);
        this.setState({search: true})
      } else
      this.setState({search: false})
    }

    //The first render shows the event list in full as the default when landing on the event page
    render() {
        let defaultEvents = null;

        if (this.props.event) {
            let eventList = this.props.event;
            console.log(this.attend, 'this.attend');
            defaultEvents = (
                <div className="eventList">
                    <Grid>
                        <Row>
                            <Col xs={12}>
                                {
                                    eventList.map(function (e, i) {
                                        return (
                                            <div className="demo-card">
                                                <div className="card card-inverse card-primary text-center">
                                                    <div className="card-block">
                                                        <blockquote className="card-blockquote">
                                                            <h4 className="title">{e.name}</h4>
                                                            <p className="detail">Location: {e.location}</p>
                                                            <p className="detail mobile">{e.address}</p>
                                                            <p className="detail trigger">
                                                                <OverlayTrigger trigger="click" overlay={
                                                                            <Popover id="modal-popover" title="Map">
                                                                                <div><SimpleMapPage place={e.coordinates} address={e.address} name={e.location}/></div>
                                                                            </Popover>}>
                                                                    <a href="#">{e.address} <span>Click here to view on a map.</span></a>
                                                                </OverlayTrigger>
                                                            </p>
                                                            <p className="detail">Time: {e.time}</p>
                                                            <p className="detail">Date: {e.date}</p>
                                                            <p className="detail">Food Options? {e.eating}</p>
                                                            <p className="detail">Any Danger? {e.danger}</p>
                                                            <p className="detail">Animals in Attendance: {e.animals}</p>
                                                            <Button
                                                                className="events-btn"
                                                                bsStyle="success"
                                                                onClick={(e) => {this.attend(e)}}
                                                                data-eventID={e.id}
                                                                data-index={i}>
                                                                Attend Event
                                                            </Button>
                                                        </blockquote>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }, this)
                                }
                            </Col>
                        </Row>
                    </Grid>
                </div>
            );
        } else {
            defaultEvents = (<div>There are no events, fill out the form to create one!</div>);
        }

        //This section returns all the event information from the search by name of event or attendees
        let eventsFromSearch = this.props.searchedEvents.map((e, i) => {
          return(

          <div className="demo-card">
                <div className="card card-inverse card-info text-center">
                    <div className="card-block">
                        <blockquote className="card-blockquote">
                            <h4 className="title">{e.name}</h4>
                            <p className="detail">Location: {e.location}</p>
                            <p className="detail">
                                <OverlayTrigger trigger="click" overlay={
                                        <Popover id="modal-popover" title="map">
                                            <div><SimpleMapPage place={e.coordinates} address={e.address} name={e.location}/></div>
                                        </Popover>}>
                                    <a href="#">{e.address} <span>Click here to view on a map.</span></a>
                                </OverlayTrigger>
                            </p>
                            <p className="detail">Time: {e.time}</p>
                            <p className="detail">Date: {e.date}</p>
                            <p className="detail">Food Options? {e.eating}</p>
                            <p className="detail">Any Danger? {e.danger}</p>
                            <p className="detail">Animals in Attendance: {e.animals}</p>
                            <Button
                                className="events-btn"
                                bsStyle="success"
                                onClick={(e) => {this.attend(e)}}
                                data-eventID={e.id}
                                data-index={i}>
                                Attend Event
                            </Button>

                        </blockquote>
                    </div>
                </div>
            </div>
          )
        }, this) || null;

        //Two search bars for events
        return (
            <div className="eventList">
                <h1 className="section_title">List of Events</h1>
                <FormGroup controlId="formControlsTextarea">
                    <ControlLabel>Search by the name of the event</ControlLabel>
                    <FormControl
                      onChange={(e) => {this.handleEventNameChange(e)}}
                      componentClass="input"
                      placeholder="Event Name"
                      required='true'/>
                </FormGroup>
                <FormGroup controlId="formControlsTextarea">
                    <ControlLabel>Search by who is attending the event</ControlLabel>
                    <FormControl
                       onChange={(e) => {this.handleUserNameChange(e)}}
                       componentClass="input"
                       placeholder="Event Name"
                       required='true'/>
                </FormGroup>

                {this.state.search ? eventsFromSearch : defaultEvents}
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        email: state.reducers.isAuthorized.email,
        name: state.reducers.isAuthorized.name,
        id: state.reducers.isAuthorized.id,
        event: state.reducers.eventForm.events,
        searchedEvents: state.reducers.eventForm.searchedEvents,
        userEvents: state.reducers.eventForm.userEvents
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getEvent, attendEvent, searchEventsByUserName, searchEventsByEventName, showEvent}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(EventList);
