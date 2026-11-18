describe("test tooling", () => {
  it("does arithmetic", () => {
    expect(1 + 1).toBe(2);
  });

  it("has a jsdom document", () => {
    expect(document.body).toBeInTheDocument();
  });
});
