import Label from '@/components/Label';
import React, { useState } from 'react';

const IndexPage = () => {
  const [handle, setHandle] = useState('');
  const [labels, setLabels] = useState<Labels>({ labelList: [], error: '' });
  const [first, setFirst] = useState<boolean>(true);
  const [buttonState, setButtonState] = useState<boolean>(true);

  const handleChange = (event: any) => {
    setHandle(event.target.value);
  };

  const fetchLabels = async () => {
    if (handle.length == 0) return;
    setButtonState(false);
    const response = await fetch(`/api/check-handle?handle=${handle}`);
    const data = await response.json();
    setFirst(false);
    setLabels(data);
    setButtonState(true);
  };

  return (
    <div className="mx-auto max-w-xl mt-8">
      <p className="text-2xl">Label checker</p>

      <div className="relative flex w-full flex-wrap items-stretch mb-3">
        <span className="z-10 h-full leading-normal font-normal absolute text-center text-slate-300 absolute bg-transparent rounded text-lg items-center justify-center w-8 pl-3 py-3">
          @
        </span>
        <input
          type="text"
          placeholder="handle"
          className="px-3 py-4 placeholder-slate-300 text-slate-600 relative bg-white bg-white rounded text-base border border-slate-300 outline-none focus:outline-none focus:ring w-full pl-10"
          value={handle}
          onChange={handleChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && buttonState == true) {
              fetchLabels();
            }
          }}
        />
      </div>
      <button
        onClick={fetchLabels}
        className={`bg-blue-${
          buttonState ? 500 : 200
        } text-white py-2 px-4 rounded-md`}
        disabled={!buttonState}
      >
        Submit
      </button>

      {labels.labelList.map((label) => (
        <Label key={label.id} label={label} />
      ))}
      {(labels.error !== '' && (
        <div className="text-red-500 mt-2">
          <p>{labels.error}</p>
        </div>
      )) ||
        (!first && labels.labelList.length == 0 && (
          <div className="text-green-500 mt-2">
            <p>No labels found, you&apos;re OK!</p>
          </div>
        ))}
    </div>
  );
};

export default IndexPage;
