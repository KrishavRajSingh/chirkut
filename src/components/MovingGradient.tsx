import { useEffect, useRef } from "react";

export const MovingGradient = () => {

    const interactiveBgRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
        if (interactiveBgRef.current) {
            const { clientX, clientY } = e
            const { width, height } = interactiveBgRef.current.getBoundingClientRect()
            const x = (clientX / width) * 100
            const y = (clientY / height) * 100
            interactiveBgRef.current.style.setProperty("--mouse-x", `${x}%`)
            interactiveBgRef.current.style.setProperty("--mouse-y", `${y}%`)
        }
        }

        document.addEventListener("mousemove", handleMouseMove)
        return () => document.removeEventListener("mousemove", handleMouseMove)
    }, []);
    
    return (
        <div
        ref={interactiveBgRef}
        className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 transition-all duration-300 ease-in-out"
        style={{
          backgroundSize: "100% 100%",
          backgroundImage: `
            radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(192, 38, 211, 0.3) 0%, transparent 50%),
            radial-gradient(circle at calc(100% - var(--mouse-x)) calc(100% - var(--mouse-y)),rgba(6, 182, 212, 0.3)  0%, transparent 50%)
          `,
        }}
      />
    )
};