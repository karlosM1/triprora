import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { MapPin } from 'lucide-react'
import { searchPlaces, type PlaceRegion } from '@/lib/places'
import { cn } from '@/lib/utils'

type PlaceInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  region?: PlaceRegion
  className?: string
  fieldClassName?: string
  inputClassName?: string
  icon?: ReactNode
}

type DropdownRect = {
  top: number
  left: number
  width: number
}

const DROPDOWN_VIEWPORT_MARGIN = 8

function clampDropdownRect(bounds: DOMRect): DropdownRect {
  const maxWidth = window.innerWidth - DROPDOWN_VIEWPORT_MARGIN * 2
  const width = Math.min(bounds.width, maxWidth)
  const left = Math.max(
    DROPDOWN_VIEWPORT_MARGIN,
    Math.min(bounds.left, window.innerWidth - width - DROPDOWN_VIEWPORT_MARGIN),
  )

  return { top: bounds.bottom, left, width }
}

export function PlaceInput({
  value,
  onChange,
  placeholder,
  region,
  className,
  fieldClassName,
  inputClassName,
  icon,
}: PlaceInputProps) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [rect, setRect] = useState<DropdownRect | null>(null)

  const suggestions = open ? searchPlaces(value, { region, limit: 20 }) : []
  const showDropdown = open && suggestions.length > 0

  const updateRect = useCallback(() => {
    const element = containerRef.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    setRect(clampDropdownRect(bounds))
  }, [])

  useLayoutEffect(() => {
    if (!showDropdown) return
    updateRect()
  }, [showDropdown, updateRect])

  useEffect(() => {
    if (!showDropdown) return

    function handleReposition() {
      updateRect()
    }

    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)
    return () => {
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [showDropdown, updateRect])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
      setActiveIndex(-1)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function selectPlace(name: string) {
    onChange(name)
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true)
      return
    }

    if (!suggestions.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1,
      )
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      selectPlace(suggestions[activeIndex].name)
    } else if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative min-w-0', className)}>
      <label
        className={cn(
          'flex h-12 w-full min-w-0 items-center gap-2 rounded-xl bg-white/95 px-3 transition-colors focus-within:bg-white',
          fieldClassName,
        )}
      >
        {icon ?? <MapPin className="size-4 shrink-0 text-[#86868b]" />}
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-[13px] font-normal text-[#1d1d1f] placeholder:text-[#1d1d1f]/50 focus:outline-none',
            inputClassName,
          )}
        />
      </label>

      {showDropdown && rect
        ? createPortal(
            <ul
              ref={dropdownRef}
              id={listboxId}
              role="listbox"
              style={{
                position: 'fixed',
                top: rect.top + 6,
                left: rect.left,
                width: rect.width,
              }}
              className="z-[1000] max-h-60 overflow-auto rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {suggestions.map((place, index) => (
                <li
                  key={place.id}
                  role="option"
                  aria-selected={activeIndex === index}
                >
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectPlace(place.name)}
                    className={cn(
                      'flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors',
                      activeIndex === index
                        ? 'bg-[#0071e3]/10'
                        : 'hover:bg-[#f5f5f7]',
                    )}
                  >
                    <span className="text-[13px] font-medium text-[#1d1d1f]">
                      {place.name}
                    </span>
                    {place.subtitle ? (
                      <span className="text-[11px] text-[#86868b]">
                        {place.subtitle}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}
