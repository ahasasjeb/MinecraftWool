import React from 'react';
import { WOOL_COLORS, WOOL_NAMES } from '../constants';
import { WoolColor } from '../types';

export const Legend: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-2 text-xs">
      {Object.keys(WOOL_COLORS).map((key) => {
        const id = Number(key) as WoolColor;
        return (
          <div key={id} className="flex items-center space-x-2 bg-gray-800 p-2 rounded border border-gray-700">
            <div 
              className="w-4 h-4 rounded-sm shadow-sm"
              style={{ backgroundColor: WOOL_COLORS[id] }}
            />
            <div className="flex flex-col">
              <span className="font-bold text-gray-200">{id.toString(16).toUpperCase()}</span>
              <span className="text-gray-500 scale-90 origin-top-left truncate max-w-[60px]">{WOOL_NAMES[id]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
