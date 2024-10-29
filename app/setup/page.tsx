"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function SetupPage() {
  const [rows, setRows] = useState('10')
  const [cols, setCols] = useState('10')
  const [initialMoisture, setInitialMoisture] = useState('uniform')
  const [uniformMoisture, setUniformMoisture] = useState('50')
  const [units, setUnits] = useState('metric')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const queryParams = new URLSearchParams({
      rows,
      cols,
      initialMoisture,
      uniformMoisture,
      units,
    }).toString()
    router.push(`/simulation?${queryParams}`)
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Simulation Setup</CardTitle>
          <CardDescription>Configure your soil moisture simulation parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rows">Rows</Label>
                <Input
                  id="rows"
                  type="number"
                  value={rows}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRows(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cols">Columns</Label>
                <Input
                  id="cols"
                  type="number"
                  value={cols}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCols(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="initialMoisture">Initial Moisture Distribution</Label>
              <Select value={initialMoisture} onValueChange={setInitialMoisture}>
                <SelectTrigger id="initialMoisture">
                  <SelectValue placeholder="Select initial moisture distribution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uniform">Uniform</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {initialMoisture === 'uniform' && (
              <div>
                <Label htmlFor="uniformMoisture">Uniform Moisture (%)</Label>
                <Input
                  id="uniformMoisture"
                  type="number"
                  value={uniformMoisture}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUniformMoisture(e.target.value)}
                  min="0"
                  max="100"
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="units">Units</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select value={units} onValueChange={setUnits}>
                      <SelectTrigger id="units">
                        <SelectValue placeholder="Select units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric</SelectItem>
                        <SelectItem value="imperial">Imperial</SelectItem>
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Metric: mm/h for rates, cm for depth</p>
                    <p>Imperial: in/h for rates, in for depth</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button type="submit">Start Simulation</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}