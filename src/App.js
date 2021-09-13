import React, { useState, useEffect } from 'react';
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
  const [currDate, setDate] = useState(
    new Date(new Date().getTime() + 24 * 1000 * 3600)
  );
  useEffect(() => {
    const timer = setInterval(() => {
      // Creates an interval which will update the current data every minute
      // This will trigger a rerender every component that uses the useDate hook.
      setDate(new Date(new Date().getTime() + 24 * 1000 * 3600));
    }, 60 * 1000);
    return () => {
      clearInterval(timer); // Return a funtion to clear the timer so that it will stop being called on unmount
    };
  }, []);
  const weeks = [];
  console.log(currDate);
  for (const week of weekData) {
    weeks.push(<Week weekData={week} currDate={currDate} />);
  }
  return <div className="calendar">{weeks}</div>;
}

function Week({ weekData, currDate }) {
  const days = [];
  for (const day of weekData) {
    days.push(<Day dayData={day} currDate={currDate} />);
  }
  return <div className="week">{days}</div>;
}

function Day({ dayData: [dayDate, eventData], currDate }) {
  const getPrettyDatestamp = (date) => {
    return String(date).split(`${date.getFullYear()}`)[0];
  };

  const isActive = () => {
    return (
      dayDate.getTime() <= currDate.getTime() &&
      currDate.getTime() <= dayDate.getTime() + 1000 * 3600 * 24
    );
  };
  const events = [];
  for (const event of eventData) {
    events.push(<Event eventData={event} currDate={currDate} />);
  }
  const dayClasses = `day${isActive() ? ' active' : ''}`;
  return (
    <div className={dayClasses}>
      <div className="datestamp">{getPrettyDatestamp(dayDate)}</div>
      {events}
    </div>
  );
}

function Event({ eventData, currDate }) {
  const getTimeDifference = (date1, date2) => {
    const ms = date2.getTime() - date1.getTime();
    return Math.round((ms / 1000 / 60 / 60) * 100) / 100;
  };
  const isCurrent = () => {
    const currTime = currDate.getTime();
    return startTime <= currTime && currTime <= endTime;
  };

  const startTime = new Date(eventData.start.dateTime);
  const endTime = new Date(eventData.end.dateTime);
  const timeDiff = getTimeDifference(startTime, endTime);
  const description = eventData.summary;
  const eventClasses = `event${isCurrent() ? ' active' : ''}`;

  return (
    <div className={eventClasses} style={{ flexGrow: timeDiff }}>
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
