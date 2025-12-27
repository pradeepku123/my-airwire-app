import React, { useState, useEffect, useRef } from 'react';

const DraggablePiP = ({ children }) => {
    // Initial Position: Top-Right (safe from bottom controls)
    const [position, setPosition] = useState({ x: window.innerWidth - 140, y: 80 });
    const [dragging, setDragging] = useState(false);
    const [rel, setRel] = useState(null); // Relative position of cursor within the element
    const nodeRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            // Keep it within bounds on resize
            setPosition(prev => ({
                x: Math.min(prev.x, window.innerWidth - 140),
                y: Math.min(prev.y, window.innerHeight - 200)
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onMouseDown = (e) => {
        // Allow touch or left-click
        if (e.type === 'mousedown' && e.button !== 0) return;

        const node = nodeRef.current;
        const { left, top } = node.getBoundingClientRect();

        // Calculate relative position of the mouse inside the element
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        setDragging(true);
        setRel({
            x: clientX - left,
            y: clientY - top
        });

        // Prevent default only for mouse to allow touch scroll if needed (but we use touch-action: none)
        if (e.type === 'mousedown') e.preventDefault();
        e.stopPropagation();
    };

    const onMouseMove = (e) => {
        if (!dragging) return;

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        const newX = clientX - rel.x;
        const newY = clientY - rel.y;

        // Boundary constraints
        const maxX = window.innerWidth - nodeRef.current.offsetWidth;
        const maxY = window.innerHeight - nodeRef.current.offsetHeight;

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });

        e.preventDefault();
    };

    const onMouseUp = () => {
        setDragging(false);
    };

    // Attach global listeners for drag movement
    useEffect(() => {
        if (dragging) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onMouseMove, { passive: false });
            document.addEventListener('touchend', onMouseUp);
        } else {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        };
    }, [dragging, rel]);

    return (
        <div
            ref={nodeRef}
            onMouseDown={onMouseDown}
            onTouchStart={onMouseDown}
            onDragStart={(e) => e.preventDefault()} // Prevent native drag
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                cursor: dragging ? 'grabbing' : 'grab',
                zIndex: 1000,
                touchAction: 'none' // Important for touch dragging
            }}
            className="draggable-pip"
        >
            {children}
        </div>
    );
};

export default DraggablePiP;
