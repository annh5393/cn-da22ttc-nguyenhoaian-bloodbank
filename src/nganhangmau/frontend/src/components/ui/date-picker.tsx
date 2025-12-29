"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

// Normalize date to noon local time to avoid timezone issues
function normalizeDate(date: Date | undefined): Date | undefined {
  if (!date) return undefined
  const normalized = new Date(date)
  normalized.setHours(12, 0, 0, 0)
  return normalized
}

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  className?: string
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Chọn ngày",
  disabled = false,
  label,
  className
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [month, setMonth] = React.useState<Date | undefined>(value || new Date())
  const [inputValue, setInputValue] = React.useState(formatDate(value))

  React.useEffect(() => {
    const normalized = normalizeDate(value)
    setDate(normalized)
    setInputValue(formatDate(normalized))
    if (normalized) {
      setMonth(normalized)
    }
  }, [value])

  return (
    <div className={`flex flex-col gap-2 w-full col-2 ${className || ''}`}>
      {label && (
        <Label htmlFor="date" className="px-1">
          {label}
        </Label>
      )}
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={inputValue}
          placeholder={placeholder}
          className="p-6 text-gray-700 border-gray-400 rounded-md cursor-pointer"
          disabled={disabled}
          readOnly
          onClick={() => !disabled && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2 bg-white text-gray-700 border-gray-400"
              disabled={disabled}
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Chọn ngày</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0 bg-white text-gray-700 border-gray-400"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(selectedDate) => {
                const normalized = normalizeDate(selectedDate)
                setDate(normalized)
                setInputValue(formatDate(normalized))
                onChange?.(normalized)
                setOpen(false)
              }}
              startMonth={new Date(1900, 0)}
              endMonth={new Date(2100, 11)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
