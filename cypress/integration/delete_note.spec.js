describe("Delete note flow", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("creates a note, deletes it after confirmation, and removes it from the list", () => {
    cy.get('[data-testid="add-note-button"]').click();
    const title = "Note to delete";
    cy.get("#create-note-title").clear().type(title);
    cy.get("#create-note-body").clear().type("Will be removed.");
    cy.get('[data-testid="create-note-submit"]').click();

    cy.contains('[data-testid="note-list"] li', title).should("be.visible");

    cy.contains('[data-testid="note-list"] li', title)
      .find('[data-testid="note-delete-open"]')
      .click();

    cy.get('[data-testid="confirm-dialog"]').should("be.visible");
    cy.get('[data-testid="confirm-dialog-confirm"]').click();

    cy.contains('[data-testid="note-list"] li', title).should("not.exist");
  });
});
