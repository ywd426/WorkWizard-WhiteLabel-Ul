// Types for robot data
export interface RobotPosition {
  x: number
  y: number
  z: number
}

export interface Robot {
  id: string
  name: string
  type: string
  status: 'active' | 'idle' | 'charging' | 'error' | 'maintenance'
  battery: number
  speed: number
  position: RobotPosition
  heading: number
  lastUpdate: Date
  task?: string
  area?: string
  mapName?: string
  index?: number

  trajectory?: Trajectory
}

export interface RobotStatus {
  totalRobots: number
  activeRobots: number
  lowBatteryCount: number
  lastUpdate: Date
}

// Trajectory system for fixed paths
export interface Waypoint {
  x: number
  y: number
  z: number
  heading: number
  waitTime?: number // Time to wait at this waypoint (seconds)
}

export interface Trajectory {
  waypoints: Waypoint[]
  loop: boolean
  currentWaypointIndex: number
  progress: number // 0-1 progress between current and next waypoint
  speed: number // meters per second
}

// Predefined trajectories for different robots
const TRAJECTORIES = {
  'ROBOT-001': {
    waypoints: [
      { x: 38, y: 68, z: 0, heading: 0 },
      { x: 43, y: 68, z: 0, heading: 0 },
      { x: 43, y: 64, z: 0, heading: 90 },
      { x: 58, y: 64, z: 0, heading: 90 },
      { x: 58, y: 63, z: 0, heading: 180 },
      { x: 61, y: 63, z: 0, heading: 180 },
      { x: 61, y: 40, z: 0, heading: 270 },
      { x: 38, y: 40, z: 0, heading: 0 }
    ],
    loop: true,
    speed: 1.5
  },
  'ROBOT-002': {
    waypoints: [
      { x: 68, y: 77, z: 0, heading: 0 },
      { x: 64, y: 77, z: 0, heading: 0 },
      { x: 64, y: 71, z: 0, heading: 90 },
      { x: 68, y: 71, z: 0, heading: 90 },
      { x: 68, y: 50, z: 0, heading: 270 },
      { x: 78, y: 50, z: 0, heading: 270 },
      { x: 68, y: 77, z: 0, heading: 0 }
    ],
    loop: true,
    speed: 1.2
  },
  'ROBOT-003': {
    waypoints: [
      { x: 15, y: 74, z: 0, heading: 0 },
      { x: 15, y: 76, z: 0, heading: 0 },
      { x: 25, y: 76, z: 0, heading: 90 },
      { x: 25, y: 74, z: 0, heading: 180 },
      { x: 15, y: 74, z: 0, heading: 270 }
    ],
    loop: true,
    speed: 0.4
  },
  'ROBOT-004': {
    waypoints: [
      { x: 40, y: 22, z: 0, heading: 0 },
      { x: 40, y: 30, z: 0, heading: 0 },
      { x: 55, y: 30, z: 0, heading: 90 },
      { x: 55, y: 22, z: 0, heading: 180 },
      { x: 40, y: 22, z: 0, heading: 270 }
    ],
    loop: true,
    speed: 0.6
  }
}


// Mock data for demonstration
const mockRobots: Robot[] = [
  {
    id: 'ROBOT-001',
    name: 'Cleaning Robot Alpha',
    type: 'Floor Cleaner',
    status: 'active',
    battery: 85,
    speed: TRAJECTORIES['ROBOT-001'].speed,
    position: { x: -25, y: -10, z: 0 },
    heading: 0,
    lastUpdate: new Date(),
    task: 'Floor Cleaning',
    area: 'Main Hall',
    trajectory: {
      waypoints: TRAJECTORIES['ROBOT-001'].waypoints,
      loop: TRAJECTORIES['ROBOT-001'].loop,
      currentWaypointIndex: 0,
      progress: 0,
      speed: TRAJECTORIES['ROBOT-001'].speed
    }
  },
  {
    id: 'ROBOT-002',
    name: 'Maintenance Bot Beta',
    type: 'Maintenance',
    status: 'active',
    battery: 65,
    speed: TRAJECTORIES['ROBOT-002'].speed,
    position: { x: 10, y: -8, z: 0 },
    heading: 0,
    lastUpdate: new Date(),
    task: 'Equipment Check',
    area: 'Equipment Room',
    trajectory: {
      waypoints: TRAJECTORIES['ROBOT-002'].waypoints,
      loop: TRAJECTORIES['ROBOT-002'].loop,
      currentWaypointIndex: 0,
      progress: 0,
      speed: TRAJECTORIES['ROBOT-002'].speed
    }
  },
  {
    id: 'ROBOT-003',
    name: 'Security Robot Gamma',
    type: 'Security',
    status: 'active',
    battery: 92,
    speed: TRAJECTORIES['ROBOT-003'].speed,
    position: { x: -20, y: 5, z: 0 },
    heading: 0,
    lastUpdate: new Date(),
    task: 'Patrol',
    area: 'Perimeter',
    trajectory: {
      waypoints: TRAJECTORIES['ROBOT-003'].waypoints,
      loop: TRAJECTORIES['ROBOT-003'].loop,
      currentWaypointIndex: 0,
      progress: 0,
      speed: TRAJECTORIES['ROBOT-003'].speed
    }
  },
  {
    id: 'ROBOT-004',
    name: 'Delivery Bot Delta',
    type: 'Delivery',
    status: 'active',
    battery: 75,
    speed: TRAJECTORIES['ROBOT-004'].speed,
    position: { x: 5, y: -5, z: 0 },
    heading: 0,
    lastUpdate: new Date(),
    task: 'Package Delivery',
    area: 'Loading Dock',
    trajectory: {
      waypoints: TRAJECTORIES['ROBOT-004'].waypoints,
      loop: TRAJECTORIES['ROBOT-004'].loop,
      currentWaypointIndex: 0,
      progress: 0,
      speed: TRAJECTORIES['ROBOT-004'].speed
    }
  }
]

// Simulate real-time updates
let updateInterval: NodeJS.Timeout | null = null

// Robot service class
export class RobotService {
  private robots: Robot[] = [...mockRobots]
  private subscribers: ((robots: Robot[]) => void)[] = []

  constructor() {
    this.startRealTimeUpdates()
  }

  // Get all robots
  async getRobots(): Promise<Robot[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...this.robots]
  }

  // Get robot by ID
  async getRobotById(id: string): Promise<Robot | null> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return this.robots.find(robot => robot.id === id) || null
  }

  // Get robot status summary
  async getRobotStatus(): Promise<RobotStatus> {
    const robots = await this.getRobots()
    return {
      totalRobots: robots.length,
      activeRobots: robots.filter(r => r.status === 'active').length,
      lowBatteryCount: robots.filter(r => r.battery < 30).length,
      lastUpdate: new Date()
    }
  }

  // Subscribe to real-time updates
  subscribe(callback: (robots: Robot[]) => void): () => void {
    this.subscribers.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  // Start real-time updates
  public startRealTimeUpdates() {
    if (updateInterval) return

    updateInterval = setInterval(() => {
      this.updateRobotPositions()
      this.notifySubscribers()
    }, 100) // Update every 100ms for smoother movement
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }

  // Calculate distance between two points
  private calculateDistance(p1: RobotPosition, p2: RobotPosition): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  // Calculate angle between two points
  private calculateAngle(from: RobotPosition, to: RobotPosition): number {
    return Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI
  }

  // Update robot positions using waypoint-based trajectories
  private updateRobotPositions() {
    const deltaTime = 0.1 // 100ms update interval

    this.robots.forEach(robot => {
      if (robot.status === 'active' && robot.trajectory) {
        const trajectory = robot.trajectory
        const waypoints = trajectory.waypoints
        
        if (waypoints.length < 2) return

        const currentWaypoint = waypoints[trajectory.currentWaypointIndex]
        const nextWaypointIndex = (trajectory.currentWaypointIndex + 1) % waypoints.length
        const nextWaypoint = waypoints[nextWaypointIndex]

        // Calculate distance to travel in this update
        const distanceToTravel = trajectory.speed * deltaTime
        const totalDistance = this.calculateDistance(currentWaypoint, nextWaypoint)
        
        // Update progress
        trajectory.progress += distanceToTravel / totalDistance

        // Interpolate position between waypoints
        if (trajectory.progress >= 1) {
          // Move to next waypoint
          trajectory.currentWaypointIndex = nextWaypointIndex
          trajectory.progress = 0
          
          // Update robot position and heading
          robot.position.x = nextWaypoint.x
          robot.position.y = nextWaypoint.y
          robot.heading = nextWaypoint.heading
        } else {
          // Interpolate position
          robot.position.x = currentWaypoint.x + (nextWaypoint.x - currentWaypoint.x) * trajectory.progress
          robot.position.y = currentWaypoint.y + (nextWaypoint.y - currentWaypoint.y) * trajectory.progress
          
          // Interpolate heading
          const headingDiff = nextWaypoint.heading - currentWaypoint.heading
          robot.heading = currentWaypoint.heading + headingDiff * trajectory.progress
        }

        // Simulate battery discharge for active robots
        robot.battery = Math.max(0, robot.battery - 0.01)

        // Update last update time
        robot.lastUpdate = new Date()
      }
    })
  }

  // Notify all subscribers
  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback([...this.robots])
      } catch (error) {
        console.error('Error in robot update subscriber:', error)
      }
    })
  }

  // Control robot (simulate commands)
  async controlRobot(robotId: string, command: string): Promise<boolean> {
    const robot = this.robots.find(r => r.id === robotId)
    if (!robot) return false

    switch (command) {
      case 'start':
        robot.status = 'active'
        break
      case 'stop':
        robot.status = 'idle'
        break
      case 'charge':
        robot.status = 'charging'
        robot.battery = Math.min(100, robot.battery + 10)
        break
      case 'maintenance':
        robot.status = 'maintenance'
        break
      default:
        return false
    }

    robot.lastUpdate = new Date()
    this.notifySubscribers()
    return true
  }

  // Get robot path history (simulated)
  async getRobotPath(robotId: string, duration: number = 3600): Promise<RobotPosition[]> {
    const robot = this.robots.find(r => r.id === robotId)
    if (!robot || !robot.trajectory) return []

    // Generate path history based on trajectory
    const path: RobotPosition[] = []
    const waypoints = robot.trajectory.waypoints
    const steps = Math.min(100, Math.floor(duration / 60)) // One point per minute, max 100 points
    
    for (let i = 0; i < steps; i++) {
      const progress = i / steps
      const waypointIndex = Math.floor(progress * waypoints.length)
      const nextIndex = (waypointIndex + 1) % waypoints.length
      const waypointProgress = (progress * waypoints.length) % 1
      
      const currentWaypoint = waypoints[waypointIndex]
      const nextWaypoint = waypoints[nextIndex]
      
      const x = currentWaypoint.x + (nextWaypoint.x - currentWaypoint.x) * waypointProgress
      const y = currentWaypoint.y + (nextWaypoint.y - currentWaypoint.y) * waypointProgress
      
      path.push({ x, y, z: 0 })
    }

    return path
  }

  // Get trajectory for a robot
  getRobotTrajectory(robotId: string): Trajectory | null {
    const robot = this.robots.find(r => r.id === robotId)
    return robot?.trajectory || null
  }

  // Set custom trajectory for a robot
  setRobotTrajectory(robotId: string, trajectory: Trajectory): boolean {
    const robot = this.robots.find(r => r.id === robotId)
    if (!robot) return false
    
    robot.trajectory = trajectory
    return true
  }
}

// Export singleton instance
export const robotService = new RobotService() 