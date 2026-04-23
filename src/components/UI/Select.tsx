'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  error,
  className,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={twMerge('w-full', className)} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={clsx(
            'w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-left',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-200 flex items-center justify-between',
            error ? 'border-error' : 'border-slate-700',
            disabled && 'opacity-50 cursor-not-allowed',
            isOpen && 'ring-2 ring-primary'
          )}
        >
          <span className={clsx(selectedOption ? 'text-white' : 'text-slate-500')}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon && <span>{selectedOption.icon}</span>}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-slate-500 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-fade-in">
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full px-4 py-2.5 text-left flex items-center justify-between',
                    'hover:bg-slate-800Hover transition-colors duration-150',
                    value === option.value ? 'text-primary' : 'text-white'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {option.icon && <span>{option.icon}</span>}
                    {option.label}
                  </span>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
}

interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select options',
  error,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className={twMerge('w-full', className)} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-left',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-200 flex items-center justify-between min-h-[46px]',
            error ? 'border-error' : 'border-slate-700',
            isOpen && 'ring-2 ring-primary'
          )}
        >
          <span className={clsx(selectedOptions.length > 0 ? 'text-white' : 'text-slate-500')}>
            {selectedOptions.length > 0
              ? `${selectedOptions.length} selected`
              : placeholder}
          </span>
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-slate-500 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-fade-in">
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleToggle(option.value)}
                    className={clsx(
                      'w-full px-4 py-2.5 text-left flex items-center justify-between',
                      'hover:bg-slate-800Hover transition-colors duration-150',
                      isSelected ? 'text-primary bg-primary/10' : 'text-white'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {option.icon && <span>{option.icon}</span>}
                      {option.label}
                    </span>
                    <div
                      className={clsx(
                        'w-5 h-5 rounded border flex items-center justify-center transition-colors duration-150',
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-white/30'
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
}