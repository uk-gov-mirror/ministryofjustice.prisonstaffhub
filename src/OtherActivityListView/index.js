import React from "react";
import { getHoursMinutes, getEventDescription } from "../utils";

export default ({ offenderMainEvent }) => shouldShowOtherActivities(offenderMainEvent) && (
  <ul>
    {offenderMainEvent.releaseScheduled && <li><span className="bold-font16">** Release scheduled **</span></li>}
    {offenderMainEvent.atCourt && <li><span className="bold-font16">** Court visit scheduled **</span></li>}
    {offenderMainEvent.scheduledTransfers && offenderMainEvent.scheduledTransfers.map(transfer)}
    {offenderMainEvent.others && offenderMainEvent.others.map((event, index) => otherEvent(event, index))}
  </ul>
);

const shouldShowOtherActivities = (offenderMainEvent) =>
  Boolean(offenderMainEvent &&
        (offenderMainEvent.others ||
            offenderMainEvent.releaseScheduled ||
            offenderMainEvent.atCourt ||
            offenderMainEvent.scheduledTransfers));

const otherEvent = (event, index) => {
  const text = `${getEventDescription(event)} ${getHoursMinutes(event.startTime)}`;
  const key = `${event.offenderNo}_others_${index}`;
  const cancelled = event.event === 'VISIT' && event.eventStatus === 'CANC';

  if (cancelled) {
    return <li key={key}>{text} <span className="cancelled">(cancelled)</span></li>;
  } else {
    return <li key={key}>{text}</li>;
  }
};
const transfer = (event) => {
  const expired = <span className="cancelled">(expired)</span>;
  const cancelled = <span className="cancelled">(cancelled)</span>;
  const complete = <span className="complete">(complete)</span>;

  return (<li className="transfer" key={event.eventId}>
    <span className="bold-font16">** {event.eventDescription} ** </span>
    {event.expired && expired}
    {event.complete && complete}
    {event.cancelled && cancelled}
  </li>);
};