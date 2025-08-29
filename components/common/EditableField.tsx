import React, { useState, useRef, useEffect } from 'react';

interface EditableFieldProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  multiline?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  initialValue,
  onSave,
  as: Component = 'span',
  className = '',
  inputClassName = '',
  placeholder = 'Clique para editar',
  multiline = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    setIsEditing(false);
    if (value.trim() !== initialValue.trim()) {
      onSave(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      ref.current?.blur();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
      ref.current?.blur();
    }
  };
  
  useEffect(() => {
      if(isEditing && ref.current) {
          ref.current.focus();
          ref.current.select();
      }
  }, [isEditing]);

  if (isEditing) {
    if (multiline) {
        return (
            <textarea
                ref={ref as React.RefObject<HTMLTextAreaElement>}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`${className} ${inputClassName} bg-transparent border-2 border-dashed border-brand-primary rounded-md p-1 -m-1`}
                rows={3}
            />
        );
    }
    return (
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} ${inputClassName} bg-transparent border-2 border-dashed border-brand-primary rounded-md p-1 -m-1`}
      />
    );
  }

  return (
    <Component
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-pointer hover:bg-brand-primary/10 p-1 -m-1 rounded-md transition-colors`}
      title="Clique para editar"
    >
      {value || <span className="text-brand-text-secondary italic">{placeholder}</span>}
    </Component>
  );
};

export default EditableField;
