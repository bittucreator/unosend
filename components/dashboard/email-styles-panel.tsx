'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Minus,
  Palette,
  X
} from 'lucide-react'

export interface EmailStyles {
  body: {
    backgroundColor: string
    color: string
  }
  container: {
    align: 'left' | 'center' | 'right'
    width: number
    paddingLeft: number
    paddingRight: number
  }
  typography: {
    fontSize: number
    lineHeight: number
    fontFamily: string
  }
  link: {
    color: string
    decoration: 'underline' | 'none'
  }
  image: {
    borderRadius: number
  }
  button: {
    backgroundColor: string
    textColor: string
    radius: number
    paddingTop: number
    paddingRight: number
    paddingBottom: number
    paddingLeft: number
  }
  codeBlock: {
    borderRadius: number
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
    backgroundColor: string
  }
  inlineCode: {
    backgroundColor: string
    textColor: string
    radius: number
  }
  globalCss: string
}

const defaultStyles: EmailStyles = {
  body: {
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  container: {
    align: 'left',
    width: 600,
    paddingLeft: 0,
    paddingRight: 0,
  },
  typography: {
    fontSize: 14,
    lineHeight: 155,
    fontFamily: 'Arial, sans-serif',
  },
  link: {
    color: '#0670DB',
    decoration: 'underline',
  },
  image: {
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#000000',
    textColor: '#ffffff',
    radius: 4,
    paddingTop: 7,
    paddingRight: 12,
    paddingBottom: 7,
    paddingLeft: 12,
  },
  codeBlock: {
    borderRadius: 4,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: '#f4f4f5',
  },
  inlineCode: {
    backgroundColor: '#e5e7eb',
    textColor: '#1e293b',
    radius: 4,
  },
  globalCss: '',
}

interface StyleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function StyleSection({ title, defaultOpen = false, children }: StyleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm">{title}</span>
        <Plus className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

interface StyleRowProps {
  label: string
  children: React.ReactNode
}

function StyleRow({ label, children }: StyleRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {children}
      </div>
    </div>
  )
}

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  unit?: string
  min?: number
  max?: number
}

function NumberInput({ value, onChange, unit = 'px', min = 0, max = 9999 }: NumberInputProps) {
  return (
    <div className="flex items-center border rounded-md">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
        className="w-16 h-8 border-0 text-center text-sm"
      />
      <span className="px-2 text-sm text-muted-foreground bg-muted/50 h-8 flex items-center border-l">
        {unit}
      </span>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-6 p-0 border-l"
        onClick={() => onChange(value)}
      >
        <Minus className="w-3 h-3 text-muted-foreground" />
      </Button>
    </div>
  )
}

interface ColorInputProps {
  value: string
  onChange: (value: string) => void
}

function ColorInput({ value, onChange }: ColorInputProps) {
  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 cursor-pointer border-0"
        />
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 h-8 border-0 text-sm"
      />
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-6 p-0 border-l"
      >
        <Minus className="w-3 h-3 text-muted-foreground" />
      </Button>
    </div>
  )
}

interface EmailStylesPanelProps {
  styles: EmailStyles
  onChange: (styles: EmailStyles) => void
  onClose?: () => void
}

export function EmailStylesPanel({ styles, onChange, onClose }: EmailStylesPanelProps) {
  const updateStyles = <K extends Exclude<keyof EmailStyles, 'globalCss'>>(
    section: K,
    key: keyof EmailStyles[K],
    value: EmailStyles[K][keyof EmailStyles[K]]
  ) => {
    onChange({
      ...styles,
      [section]: {
        ...(styles[section] as object),
        [key]: value,
      },
    })
  }

  const updateGlobalCss = (value: string) => {
    onChange({
      ...styles,
      globalCss: value,
    })
  }

  return (
    <div className="w-full sm:w-72 border-l bg-background overflow-y-auto h-full fixed sm:relative inset-0 sm:inset-auto z-50 sm:z-auto">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <Button variant="secondary" size="sm" className="gap-2">
          <Palette className="w-4 h-4" />
          Styles
        </Button>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="sm:hidden h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Body Section */}
      <StyleSection title="Body">
        <StyleRow label="Background">
          <ColorInput 
            value={styles.body.backgroundColor} 
            onChange={(v) => updateStyles('body', 'backgroundColor', v)} 
          />
        </StyleRow>
        <StyleRow label="Text color">
          <ColorInput 
            value={styles.body.color} 
            onChange={(v) => updateStyles('body', 'color', v)} 
          />
        </StyleRow>
      </StyleSection>

      {/* Container Section */}
      <StyleSection title="Container" defaultOpen>
        <StyleRow label="Align">
          <Select 
            value={styles.container.align} 
            onValueChange={(v: 'left' | 'center' | 'right') => updateStyles('container', 'align', v)}
          >
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </StyleRow>
        <StyleRow label="Width">
          <NumberInput 
            value={styles.container.width} 
            onChange={(v) => updateStyles('container', 'width', v)} 
          />
        </StyleRow>
        <StyleRow label="Padding Left">
          <NumberInput 
            value={styles.container.paddingLeft} 
            onChange={(v) => updateStyles('container', 'paddingLeft', v)} 
          />
        </StyleRow>
        <StyleRow label="Padding Right">
          <NumberInput 
            value={styles.container.paddingRight} 
            onChange={(v) => updateStyles('container', 'paddingRight', v)} 
          />
        </StyleRow>
      </StyleSection>

      {/* Typography Section */}
      <StyleSection title="Typography">
        <StyleRow label="Font size">
          <NumberInput 
            value={styles.typography.fontSize} 
            onChange={(v) => updateStyles('typography', 'fontSize', v)} 
          />
        </StyleRow>
        <StyleRow label="Line Height">
          <NumberInput 
            value={styles.typography.lineHeight} 
            onChange={(v) => updateStyles('typography', 'lineHeight', v)} 
            unit="%"
          />
        </StyleRow>
        <StyleRow label="Font Family">
          <Select 
            value={styles.typography.fontFamily} 
            onValueChange={(v) => updateStyles('typography', 'fontFamily', v)}
          >
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial, sans-serif">Arial</SelectItem>
              <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
              <SelectItem value="Georgia, serif">Georgia</SelectItem>
              <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
              <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
              <SelectItem value="system-ui, sans-serif">System UI</SelectItem>
            </SelectContent>
          </Select>
        </StyleRow>
      </StyleSection>

      {/* Link Section */}
      <StyleSection title="Link">
        <StyleRow label="Color">
          <ColorInput 
            value={styles.link.color} 
            onChange={(v) => updateStyles('link', 'color', v)} 
          />
        </StyleRow>
        <StyleRow label="Decoration">
          <Select 
            value={styles.link.decoration} 
            onValueChange={(v: 'underline' | 'none') => updateStyles('link', 'decoration', v)}
          >
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="underline">Underline</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </StyleRow>
      </StyleSection>

      {/* Image Section */}
      <StyleSection title="Image">
        <StyleRow label="Border radius">
          <NumberInput 
            value={styles.image.borderRadius} 
            onChange={(v) => updateStyles('image', 'borderRadius', v)} 
          />
        </StyleRow>
      </StyleSection>

      {/* Button Section */}
      <StyleSection title="Button">
        <StyleRow label="Background">
          <ColorInput 
            value={styles.button.backgroundColor} 
            onChange={(v) => updateStyles('button', 'backgroundColor', v)} 
          />
        </StyleRow>
        <StyleRow label="Text color">
          <ColorInput 
            value={styles.button.textColor} 
            onChange={(v) => updateStyles('button', 'textColor', v)} 
          />
        </StyleRow>
        <StyleRow label="Radius">
          <NumberInput 
            value={styles.button.radius} 
            onChange={(v) => updateStyles('button', 'radius', v)} 
          />
        </StyleRow>
        <StyleRow label="Padding Top">
          <NumberInput 
            value={styles.button.paddingTop} 
            onChange={(v) => updateStyles('button', 'paddingTop', v)} 
          />
        </StyleRow>
        <StyleRow label="Padding Right">
          <NumberInput 
            value={styles.button.paddingRight} 
            onChange={(v) => updateStyles('button', 'paddingRight', v)} 
          />
        </StyleRow>
        <StyleRow label="Padding Bottom">
          <NumberInput 
            value={styles.button.paddingBottom} 
            onChange={(v) => updateStyles('button', 'paddingBottom', v)} 
          />
        </StyleRow>
        <StyleRow label="Padding Left">
          <NumberInput 
            value={styles.button.paddingLeft} 
            onChange={(v) => updateStyles('button', 'paddingLeft', v)} 
          />
        </StyleRow>
      </StyleSection>

      {/* Code Block Section */}
      <StyleSection title="Code Block">
        <StyleRow label="Background">
          <ColorInput 
            value={styles.codeBlock.backgroundColor} 
            onChange={(v) => updateStyles('codeBlock', 'backgroundColor', v)} 
          />
        </StyleRow>
        <StyleRow label="Border Radius">
          <NumberInput 
            value={styles.codeBlock.borderRadius} 
            onChange={(v) => updateStyles('codeBlock', 'borderRadius', v)} 
          />
        </StyleRow>
        <StyleRow label="Padding Top">
          <NumberInput 
            value={styles.codeBlock.paddingTop} 
            onChange={(v) => updateStyles('codeBlock', 'paddingTop', v)} 
          />
        </StyleRow>
        <StyleRow label="Padding Bottom">
          <NumberInput 
            value={styles.codeBlock.paddingBottom} 
            onChange={(v) => updateStyles('codeBlock', 'paddingBottom', v)} 
          />
        </StyleRow>
        <StyleRow label="Padding Left">
          <NumberInput 
            value={styles.codeBlock.paddingLeft} 
            onChange={(v) => updateStyles('codeBlock', 'paddingLeft', v)} 
          />
        </StyleRow>
        <StyleRow label="Padding Right">
          <NumberInput 
            value={styles.codeBlock.paddingRight} 
            onChange={(v) => updateStyles('codeBlock', 'paddingRight', v)} 
          />
        </StyleRow>
      </StyleSection>

      {/* Inline Code Section */}
      <StyleSection title="Inline Code">
        <StyleRow label="Background">
          <ColorInput 
            value={styles.inlineCode.backgroundColor} 
            onChange={(v) => updateStyles('inlineCode', 'backgroundColor', v)} 
          />
        </StyleRow>
        <StyleRow label="Text color">
          <ColorInput 
            value={styles.inlineCode.textColor} 
            onChange={(v) => updateStyles('inlineCode', 'textColor', v)} 
          />
        </StyleRow>
        <StyleRow label="Radius">
          <NumberInput 
            value={styles.inlineCode.radius} 
            onChange={(v) => updateStyles('inlineCode', 'radius', v)} 
          />
        </StyleRow>
      </StyleSection>

      {/* Global CSS Section */}
      <StyleSection title="Global CSS">
        <textarea
          value={styles.globalCss}
          onChange={(e) => updateGlobalCss(e.target.value)}
          placeholder="/* Add custom CSS here */&#10;.custom-class { }&#10;"
          className="w-full h-24 text-xs font-mono bg-muted/50 border rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </StyleSection>

      {/* Reset Button */}
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onChange(defaultStyles)}
        >
          Reset Styles
        </Button>
      </div>
    </div>
  )
}

export { defaultStyles }
