import { renderHook, act } from "@testing-library/react";
import { useDarkMode } from "./useDarkMode";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("useDarkMode", () => {
  it("defaults to light when storage is empty", () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("starts dark when theme is stored as dark", () => {
    localStorage.setItem("theme", "dark");
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement).toHaveClass("dark");
  });

  it("toggle flips state, class and storage", () => {
    const { result } = renderHook(() => useDarkMode());
    act(() => result.current.toggleDarkMode());
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    act(() => result.current.toggleDarkMode());
    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("treats a garbage stored value as light", () => {
    localStorage.setItem("theme", "banana");
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(false);
  });
});
