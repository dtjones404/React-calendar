import React from 'react';
import useFetch from 'react-fetch-hook';
import Loading from './Loading';
import './App.css';

function App() {
  const { isLoading, data } = useFetch(
    'http://slack-server-production.us-west-2.elasticbeanstalk.com/calendar/FTRI/4'
  );

  if (isLoading)
    return (
      <div className="App">
        <Loading />
      </div>
    );
  const weekData = splitScheduleByWeek(data);
  return (
    <div className="App">
      <Calendar weekData={weekData} />
    </div>
  );
}

function Calendar({ weekData }) {
  const weeks = [];
  for (const week of weekData) {
    weeks.push(<Week data={week} />);
  }
  return <div className="calendar">{weeks}</div>;
}

function Week({ data }) {
  const days = [];
  for (const day of data) {
    days.push(<Day data={day} />);
  }
  return <div className="week">{days}</div>;
}

function Day({ data: [date, eventData] }) {
  const getPrettyDatestamp = (date) => {
    return String(date).split(`${date.getFullYear()}`)[0];
  };
  const events = [];
  for (const event of eventData) {
    events.push(<Event data={event} />);
  }
  return (
    <div className="day">
      <div className="datestamp">{getPrettyDatestamp(date)}</div>
      {events}
    </div>
  );
}

function Event({ data }) {
  const getTimeDifference = (date1, date2) => {
    const ms = date2.getTime() - date1.getTime();
    return Math.round((ms / 1000 / 60 / 60) * 100) / 100;
  };

  const startTime = new Date(data.start.dateTime);
  const endTime = new Date(data.end.dateTime);
  const timeDiff = getTimeDifference(startTime, endTime);
  const description = data.summary;

  return (
    <div className="event" style={{ flexGrow: timeDiff }}>
      <EventTime startTime={startTime} endTime={endTime} />
      <EventDesc description={description} />
    </div>
  );
}

function EventTime({ startTime, endTime }) {
  const getPrettyTimestamp = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours <= 12 ? hours : hours - 12}: ${
      minutes >= 10 ? minutes : '0' + minutes
    } ${hours <= 12 ? 'AM' : 'PM'}`;
  };

  const prettyTimestamp =
    getPrettyTimestamp(startTime) + ' - ' + getPrettyTimestamp(endTime);

  return <div className="timestamp">{prettyTimestamp}</div>;
}

function EventDesc({ description }) {
  return <div className="eventDescription">{description}</div>;
}

function splitScheduleByWeek(schedule) {
  function getDateOffset(date, offset) {
    const origTime = date.getTime();
    const newTime = origTime + offset * 24 * 60 * 60 * 1000;
    return new Date(newTime);
  }

  const res = [];
  let data = Object.entries(schedule).map(([k, v]) => [new Date(k), v]);
  const firstDay = getDateOffset(data[0][0], -data[0][0].getDay());
  const lastDay = getDateOffset(
    data[data.length - 1][0],
    7 - data[data.length - 1][0].getDay()
  );
  let nextDay = firstDay;
  let j = 0;
  let newWeek = [];
  while (j < data.length && nextDay <= lastDay) {
    if (+nextDay === +data[j][0]) {
      newWeek.push(data[j]);
      j++;
    } else {
      newWeek.push([nextDay, []]);
    }
    nextDay = getDateOffset(nextDay, 1);
    if (newWeek.length === 7) {
      res.push(newWeek);
      newWeek = [];
    }
  }
  return res;
}

export default App;
