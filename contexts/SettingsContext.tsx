'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type MoistureUnit = 'percentage' | 'volumetric'
type ColorScheme = 'default' | 'blue' | 'grayscale'
type Units = 'metric' | 'imperial'

interface SettingsContextType {
  colorScheme: ColorScheme
  setColorScheme: (colorScheme: ColorScheme) => void
  units: Units
  setUnits: (units: Units) => void
  moistureUnit: MoistureUnit
  setMoistureUnit: (moistureUnit: MoistureUnit) => void
  displayValuesInCells: boolean
  setDisplayValuesInCells: (displayValuesInCells: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default')
  const [units, setUnits] = useState<Units>('metric')
  const [moistureUnit, setMoistureUnit] = useState<MoistureUnit>('percentage')
  const [displayValuesInCells, setDisplayValuesInCells] = useState(false)

  return (
    <SettingsContext.Provider
      value={{
        colorScheme,
        setColorScheme,
        units,
        setUnits,
        moistureUnit,
        setMoistureUnit,
        displayValuesInCells,
        setDisplayValuesInCells,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}