'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface SavedSimulation {
  id: string
  name: string
  created_at: string
  data: {
    setupParams: {
      gridSize: {
        rows: number
        cols: number
      }
    }
  }
}

const fetchSavedSimulations = async (): Promise<SavedSimulation[]> => {
  const response = await fetch('/api/simulations')
  if (!response.ok) {
    throw new Error('Failed to fetch simulations')
  }
  return response.json()
}

const deleteSavedSimulation = async (id: string): Promise<void> => {
  const response = await fetch(`/api/simulations/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error('Failed to delete simulation')
  }
}

export default function LoadSimulation() {
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')
  const [selectedSimulation, setSelectedSimulation] = useState<SavedSimulation | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadSimulations = async () => {
      setIsLoading(true)
      try {
        const simulations = await fetchSavedSimulations()
        setSavedSimulations(simulations)
      } catch (error) {
        console.error('Failed to load simulations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSimulations()
  }, [])

  const filteredAndSortedSimulations = savedSimulations
    .filter(sim => sim.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else {
        return a.name.localeCompare(b.name)
      }
    })

  const handleLoadSimulation = (simulation: SavedSimulation) => {
    setSelectedSimulation(simulation)
  }

  const confirmLoadSimulation = () => {
    if (selectedSimulation) {
      router.push(`/simulation?id=${selectedSimulation.id}`)
    }
  }

  const handleDeleteSimulation = async (id: string) => {
    try {
      await deleteSavedSimulation(id)
      setSavedSimulations(prevSimulations => prevSimulations.filter(sim => sim.id !== id))
    } catch (error) {
      console.error('Failed to delete simulation:', error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Load Simulation</CardTitle>
          <CardDescription>Select a previously saved simulation to load</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <Label htmlFor="search" className="sr-only">Search simulations</Label>
                <Input
                  id="search"
                  placeholder="Search simulations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-shrink-0">
                <Label htmlFor="sort" className="sr-only">Sort by</Label>
                <Select value={sortBy} onValueChange={(value: 'date' | 'name') => setSortBy(value)}>
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedSimulations.map((simulation) => (
                    <TableRow key={simulation.id}>
                      <TableCell>{simulation.name}</TableCell>
                      <TableCell>{new Date(simulation.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{simulation.data.setupParams.gridSize.rows}x{simulation.data.setupParams.gridSize.cols}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" onClick={() => handleLoadSimulation(simulation)}>Load</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Load Simulation</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to load the simulation "{simulation.name}"?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedSimulation(null)}>Cancel</Button>
                                <Button onClick={confirmLoadSimulation}>Confirm</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Simulation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the simulation "{simulation.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSimulation(simulation.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.push('/')}>Back to Home</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
