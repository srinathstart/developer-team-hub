import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ProjectForm from "./ProjectForm";
import userEvent from "@testing-library/user-event";

afterEach(() => {
    cleanup();
});

test("shows project name input", () => {
    render(<ProjectForm onCreate={() => {}} />);

    expect(
        screen.getByLabelText("Project name")
    ).toBeInTheDocument();
});

test("submits the project name", async () => {
    const user = userEvent.setup();

    const onCreate = vi.fn();

    render(<ProjectForm onCreate={onCreate} />);

    const input = screen.getByLabelText("Project name");
    const button = screen.getByRole("button", {
        name: "Create Project",
    });

    await user.type(input, "My Project");
    await user.click(button);

    expect(onCreate).toHaveBeenCalledWith("My Project");
});