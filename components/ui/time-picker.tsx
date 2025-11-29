"use client"

import * as React from "react"
import { ChevronUp, ChevronDown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimePickerProps {
  value?: string // "HH:mm" format
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function TimePicker({
  value = "",
  onChange,
  className,
  disabled = false,
  placeholder = "Select time",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hours, setHours] = React.useState(value ? parseInt(value.split(":")[0]) : 12)
  const [minutes, setMinutes] = React.useState(value ? parseInt(value.split(":")[1]) : 0)
  const [period, setPeriod] = React.useState<"AM" | "PM">(
    value && parseInt(value.split(":")[0]) >= 12 ? "PM" : "AM"
  )

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number)
      setHours(h > 12 ? h - 12 : h === 0 ? 12 : h)
      setMinutes(m)
      setPeriod(h >= 12 ? "PM" : "AM")
    }
  }, [value])

  const formatTime = (h: number, m: number, p: "AM" | "PM") => {
    let hour24 = h
    if (p === "PM" && h !== 12) hour24 = h + 12
    if (p === "AM" && h === 12) hour24 = 0
    return `${hour24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  const displayTime = (h: number, m: number, p: "AM" | "PM") => {
    return `${h}:${m.toString().padStart(2, "0")} ${p}`
  }

  const handleHoursChange = (delta: number) => {
    let newHours = hours + delta
    if (newHours > 12) newHours = 1
    if (newHours < 1) newHours = 12
    setHours(newHours)
    onChange?.(formatTime(newHours, minutes, period))
  }

  const handleMinutesChange = (delta: number) => {
    let newMinutes = minutes + delta
    if (newMinutes >= 60) newMinutes = 0
    if (newMinutes < 0) newMinutes = 59
    setMinutes(newMinutes)
    onChange?.(formatTime(hours, newMinutes, period))
  }

  const handlePeriodToggle = () => {
    const newPeriod = period === "AM" ? "PM" : "AM"
    setPeriod(newPeriod)
    onChange?.(formatTime(hours, minutes, newPeriod))
  }

  const handleHoursInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val >= 1 && val <= 12) {
      setHours(val)
      onChange?.(formatTime(val, minutes, period))
    }
  }

  const handleMinutesInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val >= 0 && val <= 59) {
      setMinutes(val)
      onChange?.(formatTime(hours, val, period))
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 justify-start text-left text-[13px] font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? displayTime(hours, minutes, period) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center gap-2">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleHoursChange(1)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <input
              type="text"
              value={hours.toString().padStart(2, "0")}
              onChange={handleHoursInput}
              className="h-10 w-12 text-center text-lg font-medium border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-1"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleHoursChange(-1)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-xl font-medium text-muted-foreground pb-1">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleMinutesChange(1)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <input
              type="text"
              value={minutes.toString().padStart(2, "0")}
              onChange={handleMinutesInput}
              className="h-10 w-12 text-center text-lg font-medium border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-1"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleMinutesChange(-1)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* AM/PM */}
          <div className="flex flex-col gap-1 ml-2">
            <Button
              variant={period === "AM" ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 w-12 text-xs font-medium",
                period === "AM" && "bg-stone-900 hover:bg-stone-800"
              )}
              onClick={() => {
                setPeriod("AM")
                onChange?.(formatTime(hours, minutes, "AM"))
              }}
            >
              AM
            </Button>
            <Button
              variant={period === "PM" ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 w-12 text-xs font-medium",
                period === "PM" && "bg-stone-900 hover:bg-stone-800"
              )}
              onClick={() => {
                setPeriod("PM")
                onChange?.(formatTime(hours, minutes, "PM"))
              }}
            >
              PM
            </Button>
          </div>
        </div>

        {/* Quick time options */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <p className="text-[11px] text-muted-foreground mb-2">Quick select</p>
          <div className="grid grid-cols-4 gap-1">
            {["09:00", "12:00", "15:00", "18:00"].map((time) => {
              const [h] = time.split(":").map(Number)
              const displayH = h > 12 ? h - 12 : h
              const p = h >= 12 ? "PM" : "AM"
              return (
                <Button
                  key={time}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] px-2"
                  onClick={() => {
                    setHours(displayH === 0 ? 12 : displayH)
                    setMinutes(0)
                    setPeriod(p)
                    onChange?.(time)
                    setOpen(false)
                  }}
                >
                  {displayH === 0 ? 12 : displayH} {p}
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
