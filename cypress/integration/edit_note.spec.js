describe("Edit note inline", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("saves edited title and restores on cancel", () => {
    cy.get('[data-testid="add-note-button"]').click();
    const originalTitle = "Note to edit";
    cy.get("#create-note-title").clear().type(originalTitle);
    cy.get("#create-note-body").clear().type("Body.");
    cy.get('[data-testid="create-note-submit"]').click();

    cy.contains('[data-testid="note-list"] li', originalTitle)
      .find('[data-testid^="edit-note-"]')
      .click();

    cy.get('[data-testid="note-edit-title"]').clear().type("Saved title");
    cy.get('[data-testid="note-edit-save"]').click();

    cy.contains('[data-testid="note-list"] li', "Saved title").should(
      "be.visible",
    );

    cy.contains('[data-testid="note-list"] li', "Saved title")
      .find('[data-testid^="edit-note-"]')
      .click();

    cy.get('[data-testid="note-edit-title"]').clear().type("Discarded title");
    cy.get('[data-testid="note-edit-cancel"]').click();

    cy.contains('[data-testid="note-list"] li', "Saved title").should(
      "be.visible",
    );
    cy.contains('[data-testid="note-list"] li', "Discarded title").should(
      "not.exist",
    );
  });
});
