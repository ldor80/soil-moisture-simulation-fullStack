'use client'

import React from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const {
    units,
    setUnits,
    moistureUnit,
    setMoistureUnit,
    colorScheme,
    setColorScheme,
    displayValuesInCells,
    setDisplayValuesInCells
  } = useSettings()

  const handleSaveSettings = () => {
    // Save settings to local storage or other persistent storage
    localStorage.setItem('units', units)
    localStorage.setItem('moistureUnit', moistureUnit)
    localStorage.setItem('colorScheme', colorScheme)
    localStorage.setItem('displayValuesInCells', displayValuesInCells.toString())
    // You might want to add some user feedback here, like a toast notification
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Simulation Settings</CardTitle>
          <CardDescription>Customize your soil moisture simulation experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="units">Units</Label>
            <Select value={units} onValueChange={setUnits}>
              <SelectTrigger id="units">
                <SelectValue placeholder="Select units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric</SelectItem>
                <SelectItem value="imperial">Imperial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="moistureUnit">Moisture Unit</Label>
            <Select value={moistureUnit} onValueChange={setMoistureUnit}>
              <SelectTrigger id="moistureUnit">
                <SelectValue placeholder="Select moisture unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="volumetric">Volumetric (m³/m³)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="colorScheme">Color Scheme</Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger id="colorScheme">
                <SelectValue placeholder="Select color scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Red to Blue)</SelectItem>
                <SelectItem value="blue">Blue Scale</SelectItem>
                <SelectItem value="grayscale">Grayscale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="displayValuesInCells"
              checked={displayValuesInCells}
              onCheckedChange={setDisplayValuesInCells}
            />
            <Label htmlFor="displayValuesInCells">Display Values in Cells</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSaveSettings}>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  )
}