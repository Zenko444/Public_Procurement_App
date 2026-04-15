import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FormSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Selectează...',
  error,
  searchable = false,
  disabled = false,
  displayKey = 'name',
  valueKey = 'id',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchable
    ? options.filter(opt => 
        opt[displayKey]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(opt => opt[valueKey] === value);

  const handleSelect = (option) => {
    onChange(option[valueKey], option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="block text-lg font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full h-12 px-4 rounded-xl border text-left text-lg font-extralight
            flex items-center justify-between transition-all
            ${disabled
              ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
            }
            ${isOpen ? 'ring-2 ring-baby-blue/50 border-baby-blue' : ''}
            ${error ? 'border-red-300' : ''}
          `}
        >
          <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
            {selectedOption ? selectedOption[displayKey] : placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
            >
              {searchable && (
                <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Caută..."
                      className="w-full h-10 pl-10 pr-10 rounded-lg bg-slate-50 border border-slate-200 text-lg font-extralight focus:outline-none focus:ring-2 focus:ring-baby-blue/50"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center text-lg text-slate-500 font-extralight">
                    Nu s-au găsit rezultate
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option[valueKey]}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`
                        w-full px-4 py-3 text-left text-lg font-extralight hover:bg-slate-50 transition-colors
                        ${option[valueKey] === value ? 'bg-baby-light/30 text-baby-dark' : 'text-slate-700'}
                      `}
                    >
                      {option[displayKey]}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <p className="text-lg text-red-500 font-extralight">{error}</p>
      )}
    </div>
  );
}
