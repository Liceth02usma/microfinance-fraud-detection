import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../src/App";

// Mock del cliente API para aislar la UI de la red.
vi.mock("../src/api/client", () => ({
  apiClient: {
    health: vi.fn().mockResolvedValue({ status: "ok", env: "test" }),
  },
}));

describe("App", () => {
  it("muestra el estado del backend cuando responde ok", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Backend status: ok/i)).toBeInTheDocument();
    });
  });
});
