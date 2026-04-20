describe("Search notes", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("filters the list after debounce; clear restores all notes", () => {
    const titles = ["Apple Note", "Banana Note", "Cherry Note"];

    titles.forEach((title) => {
      cy.get('[data-testid="add-note-button"]').click();
      cy.get("#create-note-title").clear().type(title);
      cy.get("#create-note-body").clear().type(`Body for ${title}`);
      cy.get('[data-testid="create-note-submit"]').click();
      cy.get('[data-testid="create-note-modal"]').should("not.exist");
    });

    cy.get('[data-testid="note-list"] li').should("have.length", 3);

    cy.get('[data-testid="note-search-input"]').clear().type("banana");
    cy.wait(350);

    cy.get('[data-testid="note-list"] li').should("have.length", 1);
    cy.contains('[data-testid="note-list"]', "Banana Note").should("be.visible");
    cy.get('[data-testid="note-list"]').should("not.contain", "Apple Note");

    cy.get('[data-testid="note-search-clear"]').click();
    cy.get('[data-testid="note-list"] li').should("have.length", 3);
  });

  it("matches case-insensitively", () => {
    cy.get('[data-testid="add-note-button"]').click();
    cy.get("#create-note-title").clear().type("Hello World");
    cy.get("#create-note-body").clear().type("alpha");
    cy.get('[data-testid="create-note-submit"]').click();

    cy.get('[data-testid="note-search-input"]').clear().type("HELLO");
    cy.wait(350);
    cy.get('[data-testid="note-list"] li').should("have.length", 1);
  });
});
