import React from 'react';

export function Label(props: { label: Label }) {
  return (
    <div className="center-items">
      <div
        className={`"text-xs font-semibold inline-block py-1 px-2 rounded-full text-${props.label.colour}-600 bg-${props.label.colour}-200 last:mr-0 mr-1semibold"`}
      >
        <span>{props.label.id}</span>
      </div>
      <span className="ml-1">{props.label.description}</span>
    </div>
  );
}

export default Label;
