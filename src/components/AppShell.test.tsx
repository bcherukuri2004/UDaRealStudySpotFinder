import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppShell from "./AppShell";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

const renderShell = () =>
  render(
    <MemoryRouter initialEntries={["/events"]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/events" element={<p>child page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("AppShell", () => {
  it("renders the wordmark, the routed child and the nav", () => {
    renderShell();
    expect(screen.getByText("study")).toBeInTheDocument();
    expect(screen.getByText("spot")).toBeInTheDocument();
    expect(screen.getByText("child page")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });

  it("dark-mode button toggles the html class", async () => {
    renderShell();
    const btn = screen.getByRole("button", { name: "Toggle dark mode" });
    await userEvent.click(btn);
    expect(document.documentElement).toHaveClass("dark");
    await userEvent.click(btn);
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
