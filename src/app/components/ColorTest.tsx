"use client";

import React from "react";

const ColorTest = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Drift Color Test</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Neutrals */}
        <div className="bg-neutrals-10 p-4 rounded shadow">
          <p className="text-neutrals-100">bg-neutrals-10</p>
          <p className="text-neutrals-60">text-neutrals-60</p>
        </div>

        {/* Purple */}
        <div className="bg-purple-10 p-4 rounded shadow">
          <p className="text-purple-100">bg-purple-10</p>
          <p className="text-purple-60">text-purple-60</p>
        </div>

        {/* Green */}
        <div className="bg-green-10 p-4 rounded shadow">
          <p className="text-green-100">bg-green-10</p>
          <p className="text-green-60">text-green-60</p>
        </div>

        {/* Red */}
        <div className="bg-red-10 p-4 rounded shadow">
          <p className="text-red-100">bg-red-10</p>
          <p className="text-background">text-red-60</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Gradient Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-fuel-gradient p-4 rounded shadow text-white">
            bg-primary-gradient
          </div>
          <div className="bg-buy-gradient p-4 rounded shadow text-white">
            bg-buy-gradient
          </div>
          <div className="bg-sell-gradient p-4 rounded shadow text-white">
            bg-sell-gradient
          </div>
          <div className="bg-prize-gradient p-4 rounded shadow text-black">
            bg-prize-gradient
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button className="bg-purple-50 hover:bg-purple-60 text-white px-4 py-2 rounded transition-colors">
          Button with bg-purple-50
        </button>
      </div>
    </div>
  );
};

export default ColorTest;
