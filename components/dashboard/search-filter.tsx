'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

interface SearchFilterProps {
  placeholder?: string
  filters?: Array<{
    key: string
    label: string
    options: Array<{ value: string; label: string }>
  }>
  onSearch?: (query: string) => void
  onFilterChange?: (filters: Record<string, string>) => void
}

export function SearchFilter({ 
  placeholder = 'Search...', 
  filters = [],
  onSearch,
  onFilterChange
}: SearchFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    filters.forEach(f => {
      const value = searchParams.get(f.key)
      if (value) initial[f.key] = value
    })
    return initial
  })

  const updateURL = useCallback((q: string, filterValues: Record<string, string>) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value)
    })
    const queryString = params.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }, [router, pathname])

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateURL(value, activeFilters)
    onSearch?.(value)
  }, 300)

  const handleQueryChange = (value: string) => {
    setQuery(value)
    debouncedSearch(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value }
    if (value === 'all') delete newFilters[key]
    setActiveFilters(newFilters)
    updateURL(query, newFilters)
    onFilterChange?.(newFilters)
  }

  const clearAll = () => {
    setQuery('')
    setActiveFilters({})
    router.push(pathname)
    onSearch?.('')
    onFilterChange?.({})
  }

  const hasActiveFilters = query || Object.keys(activeFilters).length > 0

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-9 h-9 text-[13px]"
        />
        {query && (
          <button
            onClick={() => handleQueryChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={activeFilters[filter.key] || 'all'}
          onValueChange={(value) => handleFilterChange(filter.key, value)}
        >
          <SelectTrigger className="w-[140px] h-9 text-[13px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-9 px-3 text-[13px]"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
