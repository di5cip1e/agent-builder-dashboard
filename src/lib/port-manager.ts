/**
 * Port Manager - Handles port allocation for agent containers (range 3001-3999)
 */

import fs from 'fs';
import path from 'path';
import { PortManagerState, PortAllocation } from '@/types/agent';

const PORT_RANGE_START = 3001;
const PORT_RANGE_END = 3999;
const STATE_FILE = '/opt/agents/.port-manager-state.json';

class PortManager {
  private state: PortManagerState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): PortManagerState {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load port manager state:', error);
    }
    return { allocations: [], lastAllocated: PORT_RANGE_START - 1 };
  }

  private saveState(): void {
    try {
      const dir = path.dirname(STATE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Failed to save port manager state:', error);
      throw error;
    }
  }

  /**
   * Allocate a unique port for an agent
   */
  allocate(agentId: string, agentSlug: string): number {
    // Check if agent already has a port
    const existing = this.state.allocations.find(a => a.agentId === agentId);
    if (existing) {
      return existing.port;
    }

    // Find next available port
    const usedPorts = new Set(this.state.allocations.map(a => a.port));
    
    for (let port = this.state.lastAllocated + 1; port <= PORT_RANGE_END; port++) {
      if (!usedPorts.has(port)) {
        const allocation: PortAllocation = {
          port,
          agentId,
          agentSlug,
          allocatedAt: new Date().toISOString()
        };
        this.state.allocations.push(allocation);
        this.state.lastAllocated = port;
        this.saveState();
        return port;
      }
    }

    // Wrap around and check from the beginning
    for (let port = PORT_RANGE_START; port <= this.state.lastAllocated; port++) {
      if (!usedPorts.has(port)) {
        const allocation: PortAllocation = {
          port,
          agentId,
          agentSlug,
          allocatedAt: new Date().toISOString()
        };
        this.state.allocations.push(allocation);
        this.state.lastAllocated = port;
        this.saveState();
        return port;
      }
    }

    throw new Error('No available ports in range');
  }

  /**
   * Release a port allocation
   */
  release(agentId: string): boolean {
    const index = this.state.allocations.findIndex(a => a.agentId === agentId);
    if (index === -1) {
      return false;
    }
    this.state.allocations.splice(index, 1);
    this.saveState();
    return true;
  }

  /**
   * Get port for a specific agent
   */
  getPort(agentId: string): number | null {
    const allocation = this.state.allocations.find(a => a.agentId === agentId);
    return allocation?.port ?? null;
  }

  /**
   * Get all allocations
   */
  getAllocations(): PortAllocation[] {
    return [...this.state.allocations];
  }

  /**
   * Check if a port is in use
   */
  isPortInUse(port: number): boolean {
    return this.state.allocations.some(a => a.port === port);
  }

  /**
   * Get agent info by port
   */
  getAgentByPort(port: number): PortAllocation | null {
    return this.state.allocations.find(a => a.port === port) ?? null;
  }
}

// Singleton instance
let portManagerInstance: PortManager | null = null;

export function getPortManager(): PortManager {
  if (!portManagerInstance) {
    portManagerInstance = new PortManager();
  }
  return portManagerInstance;
}

export { PortManager };