'use client';

import React, { useId } from 'react';
import ReactSelect, { StylesConfig, MultiValue, ActionMeta } from 'react-select';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: readonly Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
    title?: string; // Kept for interface compatibility, though native "X Selected" might replace or complement
    isOpen?: boolean; // react-select "menuIsOpen"
    onToggle?: (isOpen: boolean) => void;
}

export default function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Select...',
    className = '',
    title,
    isOpen: controlledIsOpen,
    onToggle
}: MultiSelectProps) {
    // Map string[] selected to Option[]
    const value = options.filter(opt => selected.includes(opt.value));

    const handleChange = (newValue: MultiValue<Option>, actionMeta: ActionMeta<Option>) => {
        console.log('MultiSelect onChange:', { newValue, actionMeta, mappedValues: newValue.map(v => v.value) });
        onChange(newValue.map(v => v.value));
    };


    // Custom styles to match the "Dusty Olive" / "Ebony" theme
    const customStyles: StylesConfig<Option, true> = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderRadius: '0.5rem', // rounded-lg
            borderColor: state.isFocused ? 'var(--color-dusty-olive-500)' : '#e2e8f0', // slate-200
            boxShadow: state.isFocused ? '0 0 0 1px var(--color-dusty-olive-500)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? 'var(--color-dusty-olive-500)' : '#cbd5e1', // slate-300
            },
            backgroundColor: 'white',
            fontSize: '12px',
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: 'var(--color-dusty-olive-100)',
            borderRadius: '0.375rem', // rounded-md
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: 'var(--color-dusty-olive-800)',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '10px',
            paddingLeft: '6px',
            paddingRight: '6px',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: 'var(--color-dusty-olive-800)',
            ':hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                color: '#ef4444', // red-500
            },
            borderRadius: '0px 0.375rem 0.375rem 0px',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? 'var(--color-dusty-olive-50)'
                : state.isFocused
                    ? '#f8fafc' // slate-50
                    : 'transparent',
            color: state.isSelected ? 'var(--color-dusty-olive-900)' : '#475569', // slate-600
            fontSize: '12px',
            ':active': {
                backgroundColor: 'var(--color-dusty-olive-100)',
            },
            cursor: 'pointer',
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '0.5rem',
            zIndex: 1000, // Increased from 100 to ensure visibility in modals
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-xl
        }),
    };

    // Generate stable instance ID
    const instanceId = useId();

    return (
        <div className={className}>
            <ReactSelect
                isMulti
                options={options}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                styles={customStyles}
                // Handle controlled open state only if explicitly provided
                {...(controlledIsOpen !== undefined && { menuIsOpen: controlledIsOpen })}
                onMenuOpen={() => onToggle && onToggle(true)}
                onMenuClose={() => onToggle && onToggle(false)}
                instanceId={instanceId}
                closeMenuOnSelect={false} // Keep open for multi-select convenience
                hideSelectedOptions={false}
            />
        </div>
    );
}
