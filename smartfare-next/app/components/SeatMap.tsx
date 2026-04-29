"use client";

import { useState, useEffect } from "react";

interface SeatMapProps {
  selectedSeats: string[];
  onSeatSelect: (seat: string, price: number) => void;
}

export default function SeatMap({ selectedSeats, onSeatSelect }: SeatMapProps) {
  const rows = Array.from({ length: 15 }, (_, i) => i + 1);

  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Randomize seat occupancy on client mount to avoid hydration mismatch
    const randomOccupied = new Set<string>();
    const rowCount = 15;
    const letters = ["A", "B", "C", "D", "E", "F"];
    for (let r = 1; r <= rowCount; r++) {
      for (const l of letters) {
        // ~35% of seats randomly occupied
        if (Math.random() < 0.35) {
          randomOccupied.add(`${r}${l}`);
        }
      }
    }
    setOccupiedSeats(randomOccupied);
  }, []);

  const getSeatPrice = (row: number) => {
    if (row <= 3) return 900;
    if (row <= 8) return 400;
    return 200;
  };

  const renderSeat = (row: number, letter: string) => {
    const seatId = `${row}${letter}`;
    const isSelected = selectedSeats.includes(seatId);
    const isOccupied = occupiedSeats.has(seatId);
    const price = getSeatPrice(row);

    if (isOccupied) {
      return (
        <div
          key={seatId}
          title="Occupied"
          className="w-10 h-10 md:w-12 md:h-12 rounded-t-[14px] rounded-b-md border-2 border-slate-200 bg-slate-100 flex items-center justify-center cursor-not-allowed opacity-50"
        >
          <span className="material-symbols-outlined text-slate-400 text-[16px]">person</span>
        </div>
      );
    }

    return (
      <button
        key={seatId}
        onClick={() => onSeatSelect(seatId, price)}
        className={`w-10 h-10 md:w-12 md:h-12 rounded-t-[14px] rounded-b-md border-2 transition-all shadow-sm flex items-center justify-center font-bold text-xs group relative
          ${isSelected
            ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 -translate-y-1"
            : "bg-white border-slate-200 text-slate-500 hover:border-primary/50 hover:bg-primary/5"}`}
      >
        {isSelected ? <span className="material-symbols-outlined text-[18px]">check</span> : letter}

        {/* Price tooltip */}
        {!isSelected && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
            ₹{price}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col items-center py-8 gap-4">
      {/* Legend */}
      <div className="flex items-center gap-6 text-xs font-semibold text-slate-500 mb-2">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-white border-2 border-slate-200 inline-block" />Available</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-primary inline-block border-2 border-primary" />Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-slate-100 border-2 border-slate-200 inline-block opacity-50" />Occupied</span>
      </div>

      <div className="bg-surface-container-lowest p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-outline-variant/20 inline-block overflow-x-auto custom-scrollbar">
        <div className="flex flex-col gap-5 min-w-[300px] mt-4">
          {rows.map(row => (
            <div key={row} className="flex items-center justify-between gap-6 md:gap-10">
              <div className="flex gap-2">
                {renderSeat(row, "A")}
                {renderSeat(row, "B")}
                {renderSeat(row, "C")}
              </div>
              <div className="w-8 flex items-center justify-center font-black text-slate-300 text-sm">{row}</div>
              <div className="flex gap-2">
                {renderSeat(row, "D")}
                {renderSeat(row, "E")}
                {renderSeat(row, "F")}
              </div>
            </div>
          ))}
          <div className="w-full flex justify-center mt-6">
            <div className="w-24 h-8 bg-slate-100 rounded-b-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
