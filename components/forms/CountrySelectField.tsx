'use client';

import { useState, useRef, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { countries } from '@/lib/countries';

const CountrySelectField = ({
  name,
  label = 'Country',
  control,
  error,
  required = false,
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Reset scroll to top whenever search value changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [searchValue]);

  return (
    <div className="space-y-2">
      <label className="form-label">{label}</label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label} is required` : false,
        }}
        render={({ field }) => {
          const selectedCountry = countries.find(
            (country) => country.value === field.value
          );

          const handleSelect = (countryValue: string) => {
            // Don't allow deselection - always set the new country
            field.onChange(countryValue);
            setOpen(false);
          };

          const handleOpenChange = (isOpen: boolean) => {
            setOpen(isOpen);
            if (!isOpen) {
              setSearchValue(''); // Clear search when closing
            }
          };

          return (
            <>
              <Popover
                open={open}
                onOpenChange={handleOpenChange}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="country-select-trigger"
                  >
                    {selectedCountry ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={`https://flagcdn.com/w40/${field.value.toLowerCase()}.png`}
                            alt={selectedCountry.label}
                          />
                          <AvatarFallback className="text-xs">
                            {field.value}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedCountry.label}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">
                        Select country...
                      </span>
                    )}
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="country-select-popover p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search country..."
                      className="country-select-input"
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandList
                      ref={listRef}
                      className="scrollbar-hide-default"
                    >
                      <CommandEmpty className="country-select-empty">
                        No country found.
                      </CommandEmpty>
                      <CommandGroup>
                        {countries.map((country) => (
                          <CommandItem
                            key={country.value}
                            value={country.label}
                            keywords={[
                              country.value,
                              country.label.toLowerCase(),
                            ]}
                            onSelect={() =>
                              handleSelect(country.value)
                            }
                            className="country-select-item"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={`https://flagcdn.com/w40/${country.value.toLowerCase()}.png`}
                                  alt={country.label}
                                />
                                <AvatarFallback className="text-xs">
                                  {country.value}
                                </AvatarFallback>
                              </Avatar>
                              <span>{country.label}</span>
                            </div>
                            <Check
                              className={cn(
                                'ml-auto h-4 w-4',
                                field.value === country.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {error && (
                <p className="text-sm text-red-500">
                  {error.message}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Helps us show market data and news relevant to you.
              </p>
            </>
          );
        }}
      />
    </div>
  );
};

export default CountrySelectField;
