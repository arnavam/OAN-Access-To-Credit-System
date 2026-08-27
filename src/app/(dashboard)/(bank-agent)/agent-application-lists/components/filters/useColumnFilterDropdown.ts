import { useCallback, useEffect, useRef, useState } from 'react';

interface UseColumnFilterDropdownProps {
  /** Width of the dropdown menu in pixels, used to prevent right-edge overflow. */
  menuWidth?: number;
  /** Optional callback fired just before the dropdown opens. */
  onOpen?: () => void;
}

export function useColumnFilterDropdown({
  menuWidth = 300,
  onOpen,
}: UseColumnFilterDropdownProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 8;
      let left = rect.left + window.scrollX;

      // Prevent the dropdown from overflowing the right edge of the screen
      const maxLeft = document.documentElement.clientWidth - menuWidth - 16;
      if (left > maxLeft) {
        left = Math.max(0, maxLeft);
      }

      setDropdownPos({ top, left });
    }
  }, [menuWidth]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const toggleDropdown = useCallback(() => {
    if (!isOpen) {
      onOpen?.();
      // Use setTimeout to ensure any state updates from onOpen (like resetting drafts)
      // are batched, though position calculation uses the trigger button which is already rendered.
      setTimeout(updatePosition, 0);
    }
    setIsOpen((prev) => !prev);
  }, [isOpen, onOpen, updatePosition]);

  return {
    isOpen,
    setIsOpen,
    dropdownRef,
    menuRef,
    dropdownPos,
    toggleDropdown,
  };
}
