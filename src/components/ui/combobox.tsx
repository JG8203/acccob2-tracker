import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Option {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
}

const Combobox = ({
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  className = "",
  value: controlledValue,
  onChange: controlledOnChange,
  name,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const setValue = isControlled ? controlledOnChange : setInternalValue;

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    setValue?.(newValue);
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-center w-full">
      <input 
        type="hidden" 
        name={name} 
        value={value} 
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`justify-between ${className}`}
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={className}>
          <Command className="w-full md:w-auto flex-grow md:flex-grow-0 max-h-[150px] overflow-y-auto">
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        value === option.value ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Combobox;