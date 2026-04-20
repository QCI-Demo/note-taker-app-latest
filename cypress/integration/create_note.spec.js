describe("Create note flow", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("opens modal, creates a note, and shows it in the list", () => {
    cy.get('[data-testid="add-note-button"]').click();
    cy.get('[data-testid="create-note-modal"]').should("be.visible");

    const title = "My Cypress Note";
    const body = "Note body from Cypress.";

    cy.get("#create-note-title").clear().type(title);
    cy.get("#create-note-body").clear().type(body);
    cy.get('[data-testid="create-note-submit"]').click();

    cy.get('[data-testid="create-note-modal"]').should("not.exist");
    cy.contains('[data-testid="note-list"] li', title).should("be.visible");
  });

  it("shows validation when title is empty on submit", () => {
    cy.get('[data-testid="add-note-button"]').click();
    cy.get("#create-note-title").clear();
    cy.get('[data-testid="create-note-submit"]').click();
    cy.get("#create-note-title-error").should("be.visible");
  });
});
