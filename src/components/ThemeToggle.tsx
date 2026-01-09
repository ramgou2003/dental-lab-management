import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { Button } from "@/components/ui/button"

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={`h-9 w-9 relative transition-all duration-300 ${!collapsed ? 'w-full justify-start px-2' : ''}`}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
            <div className="relative h-5 w-5 flex-shrink-0">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute top-0 left-0" />
                <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute top-0 left-0" />
            </div>
            {!collapsed && (
                <span className="ml-3 font-medium text-sm transition-all duration-300">
                    {theme === "light" ? "Result to Dark Mode" : "Result to Light Mode"}
                </span>
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
