import React from 'react';
import { AiOutlineSend } from 'react-icons/ai';
import CinetechSpinner from './message-spinner';

const InputForm = ({ handleSubmit, handlePromptChange, prompt, isLoading, inputRef }) => (
  <form onSubmit={handleSubmit} className="m-2 flex flex-col md:flex-row items-center">
    <input
      disabled={isLoading}
      className="border rounded w-full md:w-auto py-2 px-3 text-gray-700 mb-2 md:mb-0 md:mr-2"
      onChange={handlePromptChange}
      value={prompt}
      placeholder="Type your query here..."
      style={{ minWidth: '200px', flexGrow: 1 }}
      backgroundcolor="whitesmoke"
      ref={inputRef}
    />
    {isLoading ? (
      <button
        disabled
        className="bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 md:mb-0 md:ml-2"
      >
        <CinetechSpinner />
      </button>
    ) : (
      <button
        disabled={prompt.length === 0}
        className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 md:mb-0 md:ml-2"
      >
        <AiOutlineSend />
      </button>
    )}
  </form>
);

export default InputForm;
