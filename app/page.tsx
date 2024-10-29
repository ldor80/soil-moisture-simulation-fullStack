import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <h1 className="text-4xl font-bold mb-4 text-center">Welcome to Soil Moisture Simulation</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Explore and understand soil moisture dynamics in agricultural settings with our interactive simulation tool. 
        Customize your field, control irrigation, and visualize moisture movement in real-time.
      </p>
      <div className="space-x-4">
        <Link href="/setup">
          <Button size="lg">Create New Simulation</Button>
        </Link>
        <Link href="/load-simulation">
          <Button size="lg" variant="outline">Load Simulation</Button>
        </Link>
      </div>
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <ul className="list-disc list-inside text-left max-w-md mx-auto">
          <li>Customizable grid size and initial conditions</li>
          <li>Real-time visualization of soil moisture levels</li>
          <li style={{ whiteSpace: 'nowrap' }}>Interactive controls for irrigation and parameter adjustment</li>          <li>Data analysis with time-series graphs and heatmaps</li>
          <li>Save and load simulation states</li>
        </ul>
      </div>
    </div>
  )
}
