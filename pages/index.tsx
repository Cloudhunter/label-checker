import Label from '@/components/Label';
import React, { useState } from 'react';
import { AiFillGithub } from 'react-icons/ai';

const IndexPage = () => {
  const [checkee, setCheckee] = useState('');
  const [labels, setLabels] = useState<Labels>({ labelList: [], error: '' });
  const [first, setFirst] = useState<boolean>(true);
  const [buttonState, setButtonState] = useState<boolean>(true);

  const checkeeChange = (event: any) => {
    setCheckee(event.target.value);
  };

  const fetchLabels = async () => {
    if (checkee.length == 0) return;
    setLabels({ labelList: [], error: ' ' });
    setButtonState(false);
    const response = await fetch(
      `/api/check-labels?checkee=${encodeURIComponent(checkee)}`
    );
    const data = await response.json();
    setFirst(false);
    setLabels(data);
    setButtonState(true);
  };

  return (
    <div className="mx-auto max-w-3xl mt-8">
      <p className="text-2xl">Label checker</p>
      <a href="https://github.com/Cloudhunter/label-checker" target="_blank">
        <div className="flex absolute top-0 right-0 items-center">
          <AiFillGithub />
          <span className="ml-0.5">Find on GitHub!</span>
        </div>
      </a>

      <div className="relative flex w-full flex-wrap items-stretch mb-3">
        <input
          type="text"
          placeholder="handle or post"
          className="px-3 py-4 placeholder-slate-300 text-slate-600 relative bg-white bg-white rounded text-base border border-slate-300 outline-none focus:outline-none focus:ring w-full pl-10"
          value={checkee}
          onChange={checkeeChange}
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
        {buttonState ? 'Submit' : 'Checking'}
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
