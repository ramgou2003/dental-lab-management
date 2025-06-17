import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Device type detection
export function useDeviceType() {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    updateDeviceType()
    window.addEventListener('resize', updateDeviceType)
    return () => window.removeEventListener('resize', updateDeviceType)
  }, [])

  return deviceType
}

// UI Scale control hook - scales elements while keeping viewport size
export function useZoomLevel() {
  const [zoomLevel, setZoomLevel] = React.useState<number>(() => {
    // Get saved zoom level from localStorage or default to 100%
    const saved = localStorage.getItem('app-zoom-level')
    return saved ? parseFloat(saved) : 100
  })

  const updateZoomLevel = React.useCallback((newZoom: number) => {
    // Only allow 90% (tablet) and 100% (desktop) modes
    const validZoom = newZoom === 90 ? 90 : 100
    setZoomLevel(validZoom)
    localStorage.setItem('app-zoom-level', validZoom.toString())

    // Remove any existing scale classes
    document.documentElement.classList.remove('ui-scale-90')

    // Apply tablet scale class if needed
    if (validZoom === 90) {
      document.documentElement.classList.add('ui-scale-90')
    }

    // Show simple notification for view mode changes
    const viewMode = validZoom === 100 ? 'Desktop View' : 'Tablet View'
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #059669;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: opacity 0.3s ease;
    `
    notification.textContent = `Switched to ${viewMode}`
    document.body.appendChild(notification)

    // Remove notification after 2 seconds
    setTimeout(() => {
      notification.style.opacity = '0'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 2000)
  }, [])

  // Apply saved scale on mount
  React.useEffect(() => {
    updateZoomLevel(zoomLevel)
  }, [updateZoomLevel, zoomLevel])

  return { zoomLevel, updateZoomLevel }
}
